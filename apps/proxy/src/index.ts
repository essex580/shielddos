
import * as http from 'http';
import httpProxy from 'http-proxy';
import { Client } from 'pg';
import axios from 'axios';
import Redis from 'ioredis';

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

const server = http.createServer(async (req, res) => {
    const host = req.headers.host;
    const ip = req.socket.remoteAddress || 'unknown';

    if (!host) {
        res.writeHead(400);
        res.end('Bad Request: Missing Host Header');
        return;
    }

    try {
        // 0. Global Rate Limiting using Redis (Infrastructure Protection)
        const limit = 200; // requests per minute
        const window = 60;
        const key = `ratelimit:${ip}`;

        try {
            const current = await redis.incr(key);
            if (current === 1) {
                await redis.expire(key, window);
            }
            if (current > limit) {
                res.writeHead(429);
                res.end('ShieldDOS: Too Many Requests');
                // We return immediately to save resources
                return;
            }
        } catch (redisError) {
            console.error('Redis Error:', redisError);
            // Continue if Redis fails (fail-open)
        }

        // 1. Check if site exists in DB
        const result = await client.query('SELECT * FROM site WHERE domain = $1', [host.split(':')[0]]);
        const site = result.rows[0];

        if (!site) {
            res.writeHead(404);
            res.end('ShieldDOS: Site not configured');
            return;
        }

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
                // Update hit count (async fire & forget)
                client.query('UPDATE firewall_rule SET hits = hits + 1 WHERE id = $1', [rule.id]).catch(console.error);
                break;
            }
            if (rule.type === 'ALLOW_IP' && rule.value === ip) {
                // Explicit allow overrides other potential blocks (if implemented)
                break;
            }
            // Add other rule types here (Country, etc.)
        }

        // 4. Log Request (Async via API)
        axios.post(`${API_URL}/analytics`, {
            siteId: site.id,
            path: req.url,
            method: req.method,
            ipAddress: ip,
            statusCode: blocked ? 403 : 200,
            userAgent: req.headers['user-agent'] || 'unknown',
            blocked
        }).catch(err => console.error('API Log Error:', err.message));

        if (blocked) {
            res.writeHead(403);
            res.end(`ShieldDOS: Access Denied (${blockReason})`);
            return;
        }

        // 5. Proxy Request
        // Handle target protocol (http vs https)
        const target = site.targetIp.startsWith('http') ? site.targetIp : `http://${site.targetIp}`;
        const changeOrigin = true; // Always true for named hosts

        console.log(`[Proxy] Routing ${host}${req.url} -> ${target}`);

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
