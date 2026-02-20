
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import httpProxy from 'http-proxy';
import { Client } from 'pg';
import axios from 'axios';
import Redis from 'ioredis';
import geoip from 'geoip-lite';

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Autonomous Traffic Shaping (Auto-WAF) - Anomaly Detection Engine
proxy.on('proxyRes', async (proxyRes, req: any, res) => {
    const site = req.shieldSite;
    if (site && site.autoWafEnabled && site.securityLevel !== 'under_attack') {
        const status = proxyRes.statusCode || 200;
        // Monitor for Layer 7 Anomaly Behaviors: 404 scanning, 5xx database drops, or 429 rate limits
        if (status === 404 || status >= 500 || status === 429) {
            const errorKey = `shield:autowaf:${site.id}`;
            // Intentionally bypassing top-level await via raw Redis promise
            redis.incr(errorKey).then(errors => {
                if (errors === 1) redis.expire(errorKey, 60); // 60-second analysis window

                // Threshold: 100 critical HTTP errors per minute triggers the WAF automatically
                if (errors > 100) {
                    console.log(`[Auto-WAF ML] Severe Layer 7 Anomaly Detected on ${site.domain}! Autonomously engaging Under Attack Mode.`);

                    // Instantly alter the local V8 memory state for instantaneous interception
                    site.securityLevel = 'under_attack';

                    // Persist defensive posture seamlessly into PostgreSQL
                    client.query('UPDATE site SET "securityLevel" = $1 WHERE id = $2', ['under_attack', site.id]).catch(console.error);

                    // Reset counter to prevent execution spam
                    redis.del(errorKey).catch(() => { });
                }
            }).catch(e => console.error('[Auto-WAF Error]', e));
        }
    }
});

function getRegionFromCountry(countryCode: string): string {
    const eu = ['AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FO', 'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SJ', 'SM', 'UA', 'VA'];
    const us = ['US', 'CA', 'MX'];
    const as = ['AF', 'AM', 'AZ', 'BD', 'BH', 'BN', 'BT', 'CC', 'CN', 'CX', 'CY', 'GE', 'HK', 'ID', 'IL', 'IN', 'IO', 'IQ', 'IR', 'JO', 'JP', 'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MM', 'MN', 'MO', 'MV', 'MY', 'NP', 'OM', 'PH', 'PK', 'PS', 'QA', 'SA', 'SG', 'SY', 'TH', 'TJ', 'TM', 'TR', 'TW', 'UZ', 'VN', 'YE'];
    const oc = ['AS', 'AU', 'CK', 'FJ', 'FM', 'GU', 'KI', 'MH', 'MP', 'NC', 'NF', 'NR', 'NU', 'NZ', 'PF', 'PG', 'PN', 'PW', 'SB', 'TK', 'TO', 'TV', 'UM', 'VU', 'WF', 'WS'];
    const af = ['AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'EH', 'ER', 'ET', 'GA', 'GH', 'GM', 'GN', 'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR', 'MU', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SC', 'SD', 'SH', 'SL', 'SN', 'SO', 'ST', 'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'YT', 'ZA', 'ZM', 'ZW'];
    const sa = ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY', 'PE', 'PY', 'SR', 'UY', 'VE'];

    if (eu.includes(countryCode)) return 'EU';
    if (us.includes(countryCode)) return 'US';
    if (as.includes(countryCode)) return 'AS';
    if (oc.includes(countryCode)) return 'OC';
    if (af.includes(countryCode)) return 'AF';
    if (sa.includes(countryCode)) return 'SA';
    return 'GLOBAL';
}

// SSL Configuration
import * as tls from 'tls';

let sslOptions: https.ServerOptions = {};
try {
    const keyPath = path.join(__dirname, '../../../certs/server.key');
    const certPath = path.join(__dirname, '../../../certs/server.cert');
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        sslOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
        console.log('[SSL] Loaded local fallback certificates successfully.');
    } else {
        console.warn('[SSL] Certificates not found. HTTPS server will fail if started without them.');
    }
} catch (e) {
    console.error('[SSL] Error loading certs:', e);
}

// 🌐 Zero-Touch Auto SSL (SNI Callback Interception)
// Dynamically resolves Let's Encrypt certificates from Database without rebooting Proxy
sslOptions.SNICallback = async (domain, cb) => {
    try {
        // Layer 0: High-speed TLS Memory Cache
        const cacheKey = `shield:ssl:${domain}`;
        const cachedStr = await redis.get(cacheKey);
        let certObj = cachedStr ? JSON.parse(cachedStr) : null;

        if (!certObj) {
            // Layer 1: Postgres Source of Truth
            const res = await client.query('SELECT "sslCert", "sslKey" FROM site WHERE domain = $1 AND "isActive" = true AND "autoSslEnabled" = true', [domain]);
            if (res.rows.length > 0 && res.rows[0].sslCert && res.rows[0].sslKey) {
                certObj = { cert: res.rows[0].sslCert, key: res.rows[0].sslKey };
                await redis.set(cacheKey, JSON.stringify(certObj), 'EX', 3600); // 1 hr Cache
            }
        }

        if (certObj) {
            // Serve the Enterprise ACME Certificate!
            const ctx = tls.createSecureContext({
                key: certObj.key,
                cert: certObj.cert
            });
            return cb(null, ctx);
        }
    } catch (e) {
        console.error(`[SNI Error] Failed resolving TLS context for ${domain}:`, e);
    }

    // Safety Fallback: Serve the generic default certificate
    if (sslOptions.cert) {
        cb(null, tls.createSecureContext({ key: sslOptions.key as string, cert: sslOptions.cert as string }));
    } else {
        cb(new Error('ShieldDOS: No Certificate Found'));
    }
};

// Redis Client (Publisher)
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Redis Mesh: Global Ban Synchronization (Subscriber)
const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const globalBannedIps = new Set<string>(); // Ultra-fast Layer 0 memory cache

redisSubscriber.subscribe('shield:ban', (err, count) => {
    if (err) console.error('[Redis Mesh] Failed to subscribe to shield:ban', err);
    else console.log(`[Redis Mesh] Subscribed to ${count} channels for global sync.`);
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'shield:ban') {
        globalBannedIps.add(message);
        // We could add a sweeping mechanism to clear old IPs, but for now it's fine. 
        // A TTL eviction could be implemented using map with timestamps.

        // Log locally if we want, but keeping it silent for performance
    }
});

// DB Configuration (Keep for fast site lookup)
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://shield_user:shield_password@localhost:5432/shield_db',
});

client.connect().catch(err => console.error('DB Connection Error:', err));

import { isBot } from './middleware/bot-filter.middleware';
import { handleChallenge } from './middleware/challenge.middleware';
import { isWafAttack } from './middleware/waf.middleware';
import { serveCachedResponse, interceptAndCacheResponse } from './middleware/cache.middleware';
import { isBlacklistedIp } from './middleware/reputation.middleware';
import { inspectGraphQLPayload } from './middleware/graphql-inspector.middleware';
import { handleWaitingRoom } from './middleware/waiting-room.middleware';

// Hard limits for DDoS mitigation
const MAX_PAYLOAD_SIZE = 15 * 1024 * 1024; // 15MB
const REQUEST_TIMEOUT = 30000; // 30 seconds (Slowloris protection)

const server = http.createServer(appHandler);
const httpsServer = https.createServer(sslOptions, appHandler);


async function resolveSite(host: string, req: http.IncomingMessage, res: http.ServerResponse | null) {
    try {
        // 1. Check if site exists in DB (Exact or Wildcard)
        const hostname = host.split(':')[0];
        let site = null;

        // Try exact match first
        const exactResult = await client.query('SELECT * FROM site WHERE domain = $1 AND "isActive" = true', [hostname]);
        if (exactResult.rows.length > 0) {
            site = exactResult.rows[0];
        } else {
            // Try wildcard match (*.domain.com)
            const parts = hostname.split('.');
            if (parts.length > 2) {
                for (let i = 1; i < parts.length - 1; i++) {
                    const wildcardDomain = '*.' + parts.slice(i).join('.');
                    const wcResult = await client.query('SELECT * FROM site WHERE domain = $1 AND "isActive" = true', [wildcardDomain]);
                    if (wcResult.rows.length > 0) {
                        site = wcResult.rows[0];
                        break;
                    }
                }
            }
        }

        if (!site) {
            if (res) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('ShieldDOS: Domain not claimed or inactive. To secure this host, add it to your Dashboard.');
            } else if (req.socket) {
                req.socket.destroy();
            }
            return null;
        }

        return site;
    } catch (e) {
        console.error('DB Site Resolve Error:', e);
        return null;
    }
}

async function appHandler(req: http.IncomingMessage, res: http.ServerResponse) {
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

    // ACME HTTP-01 Let's Encrypt Challenge Responder
    if (req.url?.startsWith('/.well-known/acme-challenge/')) {
        const token = req.url.split('/').pop();
        if (token) {
            try {
                const keyAuth = await redis.get(`shield:acme:${token}`);
                if (keyAuth) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(keyAuth);
                } else {
                    res.writeHead(404);
                    res.end('ShieldDOS ACME Challenge Failed: Token expired or not found.');
                }
            } catch (e) {
                res.writeHead(500); res.end('ACME Redis Error');
            }
            return; // Terminate request here for ACME challenges
        }
    }

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

    // Layer 0.0: Redis Mesh Global Distributed Ban (Ultra-Fast Memory Lookup)
    if (globalBannedIps.has(ip)) {
        res.writeHead(403);
        res.end('ShieldDOS: Access Denied (Globally Banned by Edge Mesh)');
        req.socket.destroy();
        return;
    }

    // Layer 0.1: Global IP Reputation Blacklist
    if (isBlacklistedIp(req)) {
        console.log(`[Global Blacklist] Dropped connection from known malicious actor: ${ip}`);
        res.writeHead(403);
        res.end('ShieldDOS: Access Denied (Global Threat Intelligence Match)');
        req.socket.destroy();
        return;
    }

    try {
        const site = await resolveSite(host, req, res);
        if (!site) return;

        // Inject the Site data onto the Node.js Request object for the proxyRes Auto-WAF analyzer downstream
        (req as any).shieldSite = site;

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

                // Publish to Global Redis Mesh
                redis.publish('shield:ban', ip).catch(e => console.error('[Mesh Error]', e));
                globalBannedIps.add(ip); // Add locally instantly

                // Async log rate limit block
                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    userId: site.userId,
                    path: req.url,
                    method: req.method,
                    ipAddress: ip,
                    statusCode: 429,
                    userAgent: req.headers['user-agent'] || 'unknown',
                    blocked: true,
                    country
                }).catch(err => console.error('API Log Error:', err.message));

                res.writeHead(429, { 'Content-Type': site.customErrorPage403 ? 'text/html' : 'text/plain' });
                res.end(site.customErrorPage403 || 'ShieldDOS: Too Many Requests (Rate Limited)');
                return;
            }
        } catch (redisError) {
            console.error('Redis Error:', redisError);
            // Continue if Redis fails (fail-open)
        }

        // --- SECURITY MIDDLEWARE LAYERS ---

        // Layer 0.5: Distributed Virtual Waiting Room
        if (site.waitingRoomEnabled) {
            try {
                const isQueued = await handleWaitingRoom(req, res, site, redis);
                if (isQueued) return; // Request trapped in queue or redirected
            } catch (wrError) {
                console.error('[Waiting Room Pipeline Error]', wrError);
            }
        }

        // Layer 1: Bot Filter
        if (site.botProtection) {
            if (isBot(req)) {
                console.log(`[BotFilter] Blocked ${ip} targetting ${host}`);
                res.writeHead(403, { 'Content-Type': site.customErrorPage403 ? 'text/html' : 'text/plain' });
                res.end(site.customErrorPage403 || 'ShieldDOS: Bot Detected');

                // Log exclusion
                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    userId: site.userId,
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

                // Publish to Global Redis Mesh for severe violations
                redis.publish('shield:ban', ip).catch(e => console.error('[Mesh Error]', e));
                globalBannedIps.add(ip); // Add locally instantly

                res.writeHead(403, { 'Content-Type': site.customErrorPage403 ? 'text/html' : 'text/plain' });
                res.end(site.customErrorPage403 || 'ShieldDOS: WAF Blocked Request (Malicious Pattern Detected)');

                axios.post(`${API_URL}/analytics`, {
                    siteId: site.id,
                    userId: site.userId,
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

        // Layer 1.6: Deep GraphQL / JSON AST Inspection (CPU Exhaustion Deflector)
        let safePayloadStream: any = undefined;
        if (site.graphqlInspectionEnabled) {
            const inspectedStream = inspectGraphQLPayload(req, res, 6); // Max Depth = 6 
            if (inspectedStream) {
                // Use the safe stream to route traffic, as original `req` was consumed by our inspector
                safePayloadStream = inspectedStream;
            } else if (res.writableEnded || req.socket.destroyed) {
                // If the stream analyzer actively killed the request because of toxic depths, abort routing!
                return;
            }
        }

        // Layer 2: Challenge / Under Attack Mode
        if (site.securityLevel === 'under_attack') {
            const handled = await handleChallenge(req, res, site);
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
            if (rule.type === 'CUSTOM_RULE') {
                try {
                    const custom = JSON.parse(rule.value);
                    let targetValue = '';
                    if (custom.field === 'path') targetValue = req.url || '';
                    else if (custom.field === 'header') targetValue = req.headers[custom.headerName?.toLowerCase()] as string || '';
                    else if (custom.field === 'query') {
                        const q = req.url?.split('?')[1] || '';
                        const searchParams = new URLSearchParams(q);
                        targetValue = searchParams.get(custom.queryName) || '';
                    }

                    let isMatch = false;
                    if (custom.operator === 'contains') isMatch = targetValue.includes(custom.match);
                    if (custom.operator === 'equals') isMatch = targetValue === custom.match;
                    if (custom.operator === 'starts_with') isMatch = targetValue.startsWith(custom.match);

                    if (isMatch) {
                        client.query('UPDATE firewall_rule SET hits = hits + 1 WHERE id = $1', [rule.id]).catch(console.error);
                        if (custom.action === 'BLOCK') {
                            blocked = true;
                            blockReason = `Advanced Rule Blocked (${custom.field} ${custom.operator})`;
                            break;
                        } else if (custom.action === 'CHALLENGE') {
                            const handled = await handleChallenge(req, res, site);
                            if (handled) return; // Intercepted by challenge page
                        }
                    }
                } catch (e) {
                    console.error('Custom Rule Parse Error:', e);
                }
            }
        }

        // 4. Log Request (Async via API)
        // Only log if not already logged by middleware (e.g. bot block)
        axios.post(`${API_URL}/analytics`, {
            siteId: site.id,
            userId: site.userId,
            path: req.url,
            method: req.method,
            ipAddress: ip,
            statusCode: blocked ? 403 : 200, // This might be inaccurate if upstream returns 404/500, but good enough for Access Log
            userAgent: req.headers['user-agent'] || 'unknown',
            blocked,
            country
        }).catch(err => console.error('API Log Error:', err.message));

        if (blocked) {
            res.writeHead(403, { 'Content-Type': site.customErrorPage403 ? 'text/html' : 'text/plain' });
            res.end(site.customErrorPage403 || `ShieldDOS: Access Denied (${blockReason})`);
            return;
        }

        // 5. Proxy Request: Layer 7 Geo-Routing w/ Zero-Downtime Failover
        let selectedOriginIp = '';
        if (Array.isArray(site.targetIp) && site.targetIp.length > 0) {
            const visitorRegion = getRegionFromCountry(country);
            const healthyOrigins = site.targetIp.filter((o: any) => o.isDown !== true);

            if (healthyOrigins.length > 0) {
                // 1. Try exact region match
                let matchedOrigin = healthyOrigins.find((o: any) => o.region === visitorRegion);
                // 2. Try GLOBAL default
                if (!matchedOrigin) {
                    matchedOrigin = healthyOrigins.find((o: any) => o.region === 'GLOBAL');
                }
                // 3. Fallback to the first healthy origin
                if (!matchedOrigin) {
                    matchedOrigin = healthyOrigins[0];
                }
                selectedOriginIp = matchedOrigin.ip;
            }
        } else if (typeof site.targetIp === 'string') {
            selectedOriginIp = site.targetIp; // Fallback for old records
        }

        if (!selectedOriginIp) {
            res.writeHead(502, { 'Content-Type': site.customErrorPage502 ? 'text/html' : 'text/plain' });
            res.end(site.customErrorPage502 || 'ShieldDOS: 502 Bad Gateway - All Origin Servers are Offline.');
            return;
        }

        const target = selectedOriginIp.startsWith('http') ? selectedOriginIp : `http://${selectedOriginIp}`;
        const changeOrigin = true;

        // Inject Real-IP Headers for upstream origin Server
        req.headers['x-forwarded-for'] = ip;
        req.headers['x-shield-connecting-ip'] = ip;
        req.headers['cf-connecting-ip'] = ip; // Compatibility with Cloudflare-expecting backends
        req.headers['x-shield-country'] = country;

        interceptAndCacheResponse(req, res, redis, host);

        // console.log(`[Proxy] Routing ${host}${req.url} -> ${target} (${ip} - ${country} / ${getRegionFromCountry(country)})`); 

        proxy.web(req, res, {
            target,
            changeOrigin,
            secure: false,
            buffer: safePayloadStream // <--- ShieldDOS AST Stream Injection
        }, (err) => {
            console.error('[Proxy Error] Upstream failed:', err);
            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': site.customErrorPage502 ? 'text/html' : 'text/plain' });
                res.end(site.customErrorPage502 || 'Bad Gateway: Upstream Unreachable');
            }
        });

    } catch (error) {
        console.error('Request Handler Error:', error);
        if (!res.headersSent) {
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    }
}

server.listen(PORT, () => {
    console.log(`[HTTP] ShieldDOS Proxy checking DB and listening on port ${PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`[HTTPS] ShieldDOS Edge TLS Terminated on port ${HTTPS_PORT}`);
});

// Add WebSocket Upgrade Handlers for HMR & Socket.io
const wsUpgradeHandler = async (req: http.IncomingMessage, socket: any, head: any) => {
    const host = req.headers.host;
    if (!host) {
        socket.destroy();
        return;
    }

    const site = await resolveSite(host, req, null);
    if (!site) {
        socket.destroy();
        return;
    }

    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp[0];
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'XX';

    let selectedOriginIp = '';
    if (Array.isArray(site.targetIp) && site.targetIp.length > 0) {
        const visitorRegion = getRegionFromCountry(country);
        const healthyOrigins = site.targetIp.filter((o: any) => o.isDown !== true);

        if (healthyOrigins.length > 0) {
            let matchedOrigin = healthyOrigins.find((o: any) => o.region === visitorRegion)
                || healthyOrigins.find((o: any) => o.region === 'GLOBAL')
                || healthyOrigins[0];
            selectedOriginIp = matchedOrigin.ip;
        }
    } else if (typeof site.targetIp === 'string') {
        selectedOriginIp = site.targetIp;
    }

    if (!selectedOriginIp) {
        socket.destroy();
        return;
    }

    const target = selectedOriginIp.startsWith('http') ? selectedOriginIp : `http://${selectedOriginIp}`;

    proxy.ws(req, socket, head, {
        target,
        secure: false,
        changeOrigin: true
    }, (err) => {
        console.error('[WS Proxy Error] Upstream failed:', err);
        socket.destroy();
    });
};

server.on('upgrade', wsUpgradeHandler);
httpsServer.on('upgrade', wsUpgradeHandler);
