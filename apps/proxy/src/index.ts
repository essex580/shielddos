
import * as http from 'http';
import httpProxy from 'http-proxy';
import { Client } from 'pg';
import axios from 'axios';
import Redis from 'ioredis';
import geoip from 'geoip-lite';

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Redis Client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// DB Configuration (Keep for fast site lookup)
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://shield_user:shield_password@localhost:5432/shield_db',
});

client.connect().catch(err => console.error('DB Connection Error:', err));

import { isBot } from './middleware/bot-filter.middleware';
import { handleChallenge } from './middleware/challenge.middleware';
import { isWafAttack } from './middleware/waf.middleware';
import { serveCachedResponse, interceptAndCacheResponse } from './middleware/cache.middleware';

// Hard limits for DDoS mitigation
const MAX_PAYLOAD_SIZE = 15 * 1024 * 1024; // 15MB
const REQUEST_TIMEOUT = 30000; // 30 seconds (Slowloris protection)

const server = http.createServer(async (req, res) => {
    // 1. Slowloris Mitigation (Drop slow connections)
    res.setTimeout(REQUEST_TIMEOUT, () => {
        console.log(`[Timeout] Connection dropped against Slowloris attack: ${req.socket.remoteAddress}`);
        res.writeHead(408);
        res.end('ShieldDOS: Request Timeout');
    });

    // 2. HTTP Payload Limiter (Prevent memory exhaustion)
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_PAYLOAD_SIZE) {
        console.log(`[Payload Limit] Dropped oversized request (${contentLength} bytes) from ${req.socket.remoteAddress}`);
        res.writeHead(413);
        res.end('ShieldDOS: Payload Too Large');
        req.socket.destroy();
        return;
    }

    const host = req.headers.host;

    // 3. Real-IP extraction (Honor X-Forwarded-For if behind a Load Balancer, else socket IP)
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp[0];

    // GeoIP Lookup
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'XX'; // XX = Unknown or Local

    if (!host) {
        res.writeHead(400);
        res.end('Bad Request: Missing Host Header');
        return;
    }

    try {
        // Global rate limiting logic moved below site loading to allow per-site config

        // 1. Check if site exists in DB
        const result = await client.query('SELECT * FROM site WHERE domain = $1', [host.split(':')[0]]);
        const site = result.rows[0];

        if (!site) {
            res.writeHead(404);
            res.end('ShieldDOS: Site not configured');
            return;
        }

        // 0. Rate Limiting using Redis
        // We check if there's a specific rate limit or use a global one
        const limit = site.rateLimit || 200; // default 200 per minute
        const window = 60; // 1 minute window
        const key = `ratelimit:${site.id}:${ip}`;

        try {
            const current = await redis.incr(key);
            if (current === 1) {
                await redis.expire(key, window);
            }
            if (current > limit) {
                console.log(`[RateLimit] Blocked ${ip} targeted at ${host} (${current}/${limit})`);

                // Async log rate limit block
                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    path: req.url,
                    method: req.method,
                    ipAddress: ip,
                    statusCode: 429,
                    userAgent: req.headers['user-agent'] || 'unknown',
                    blocked: true,
                    country
                }).catch(err => console.error('API Log Error:', err.message));

                res.writeHead(429);
                res.end('ShieldDOS: Too Many Requests (Rate Limited)');
                return;
            }
        } catch (redisError) {
            console.error('Redis Error:', redisError);
            // Continue if Redis fails (fail-open)
        }

        // --- SECURITY MIDDLEWARE LAYERS ---

        // Layer 1: Bot Filter
        if (site.botProtection) {
            if (isBot(req)) {
                console.log(`[BotFilter] Blocked ${ip} targetting ${host}`);
                res.writeHead(403);
                res.end('ShieldDOS: Bot Detected');

                // Log exclusion
                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    path: req.url,
                    method: req.method,
                    ipAddress: ip,
                    statusCode: 403,
                    userAgent: req.headers['user-agent'] || 'unknown',
                    blocked: true,
                    country
                }).catch(err => console.error('API Log Error:', err.message));

                return;
            }
        }

        // Layer 1.5: WAF
        if (site.wafEnabled) {
            if (isWafAttack(req)) {
                console.log(`[WAF] Blocked attack from ${ip} targeting ${host}${req.url}`);
                res.writeHead(403);
                res.end('ShieldDOS: WAF Blocked Request (Malicious Pattern Detected)');

                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    path: req.url,
                    method: req.method,
                    ipAddress: ip,
                    statusCode: 403,
                    userAgent: req.headers['user-agent'] || 'unknown',
                    blocked: true,
                    country
                }).catch(err => console.error('API Log Error:', err.message));

                return;
            }
        }

        // Layer 2: Challenge / Under Attack Mode
        if (site.securityLevel === 'under_attack') {
            const handled = handleChallenge(req, res);
            if (handled) {
                // Request was intercepted by challenge (served HTML or verified)
                return;
            }
            // If handleChallenge returns false, it means user is verified, continue to proxy
        }

        // Layer 3: Edge Static Caching (Redis)
        const cacheHit = await serveCachedResponse(req, res, redis, host);
        if (cacheHit) {
            // Served directly from Redis!
            return;
        }

        // ----------------------------------

        // 2. Load Firewall Rules
        const rulesRes = await client.query('SELECT * FROM firewall_rule WHERE "siteId" = $1 AND "isActive" = true', [site.id]);
        const rules = rulesRes.rows;

        // 3. Enforce Rules
        let blocked = false;
        let blockReason = '';

        for (const rule of rules) {
            if (rule.type === 'BLOCK_IP' && rule.value === ip) {
                blocked = true;
                blockReason = 'IP Blocked';
                client.query('UPDATE firewall_rule SET hits = hits + 1 WHERE id = $1', [rule.id]).catch(console.error);
                break;
            }
            if (rule.type === 'BLOCK_COUNTRY' && rule.value === country) {
                blocked = true;
                blockReason = `Country Blocked (${country})`;
                client.query('UPDATE firewall_rule SET hits = hits + 1 WHERE id = $1', [rule.id]).catch(console.error);
                break;
            }
            if (rule.type === 'ALLOW_IP' && rule.value === ip) {
                // Explicit allow overrides other potential blocks
                break;
            }
        }

        // 4. Log Request (Async via API)
        // Only log if not already logged by middleware (e.g. bot block)
        axios.post(`${API_URL}/analytics`, {
            siteId: site.id,
            path: req.url,
            method: req.method,
            ipAddress: ip,
            statusCode: blocked ? 403 : 200, // This might be inaccurate if upstream returns 404/500, but good enough for Access Log
            userAgent: req.headers['user-agent'] || 'unknown',
            blocked,
            country
        }).catch(err => console.error('API Log Error:', err.message));

        if (blocked) {
            res.writeHead(403);
            res.end(`ShieldDOS: Access Denied (${blockReason})`);
            return;
        }

        // 5. Proxy Request
        const target = site.targetIp.startsWith('http') ? site.targetIp : `http://${site.targetIp}`;
        const changeOrigin = true;

        // Inject Real-IP Headers for upstream origin Server
        req.headers['x-forwarded-for'] = ip;
        req.headers['x-shield-connecting-ip'] = ip;
        req.headers['cf-connecting-ip'] = ip; // Compatibility with Cloudflare-expecting backends
        req.headers['x-shield-country'] = country;

        interceptAndCacheResponse(req, res, redis, host);

        // console.log(`[Proxy] Routing ${host}${req.url} -> ${target} (${ip} - ${country})`); 

        proxy.web(req, res, {
            target,
            changeOrigin,
            secure: false
        }, (err) => {
            console.error('[Proxy Error] Upstream failed:', err);
            if (!res.headersSent) {
                res.writeHead(502);
                res.end('Bad Gateway: Upstream Unreachable');
            }
        });

    } catch (error) {
        console.error('Request Handler Error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`ShieldDOS Proxy checking DB and listening on port ${PORT}`);
});
