import * as http from 'http';
import httpProxy from 'http-proxy';
import { Client } from 'pg';

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// DB Configuration
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
        // 1. Check if site exists in DB
        const result = await client.query('SELECT * FROM site WHERE domain = $1', [host.split(':')[0]]); // Simple strict match, ignore port
        const site = result.rows[0];

        if (!site) {
            res.writeHead(404);
            res.end('ShieldDOS: Site not configured');
            return;
        }

        if (!site.isActive) {
            res.writeHead(503);
            res.end('ShieldDOS: Site maintenance');
            return;
        }

        // 2. Log Request (Async - don't block)
        const logQuery = `
      INSERT INTO analytics ("siteId", path, method, "ipAddress", "statusCode", "userAgent", blocked)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
        // We log '200' effectively for now, actual status might differ if upstream fails, but this is checking "intent"
        // To be more accurate, we should log after proxy response, but for speed we log here.
        client.query(logQuery, [site.id, req.url, req.method, ip, 200, req.headers['user-agent'], false]).catch(console.error);

        // 3. Proxy Request
        proxy.web(req, res, { target: `http://${site.targetIp}` }, (err) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) {
                res.writeHead(502);
                res.end('Bad Gateway');
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
