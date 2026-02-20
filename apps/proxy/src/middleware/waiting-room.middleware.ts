import { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';
import * as crypto from 'crypto';

const SECRET = process.env.COOKIE_SECRET || 'super-secret-shield-key-2026';
const WR_COOKIE = '__shield_waitingroom';
const CLEARANCE_TIME_MS = 30 * 60 * 1000; // 30 minutes clearance
const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // Count users cleared in the last 5 minutes as "Active"

async function grantClearance(res: ServerResponse, ip: string, url: string) {
    const timestamp = Date.now().toString();
    const hash = crypto.createHmac('sha256', SECRET).update(`WR|${ip}|${timestamp}`).digest('hex');
    const cookieVal = `${hash}|${ip}|${timestamp}`;

    // Redirect the user back to their destination URL, but this time they will possess the WR_COOKIE
    res.writeHead(302, {
        'Set-Cookie': `${WR_COOKIE}=${cookieVal}; Path=/; HttpOnly; Max-Age=1800; SameSite=Lax`,
        'Location': url
    });
    res.end();
}

function serveWaitingRoomHtml(res: ServerResponse, site: any, position: number) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waiting Room - ${site.domain}</title>
    <meta http-equiv="refresh" content="10">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .container { background: #0f172a; padding: 40px; border-radius: 12px; border: 1px solid #1e293b; text-align: center; max-width: 500px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; }
        .pos { font-size: 48px; font-weight: bold; margin: 20px 0; color: #fff; }
        p { color: #94a3b8; line-height: 1.5; }
        .loader { border: 3px solid #1e293b; border-top: 3px solid #38bdf8; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>Virtual Waiting Room</h1>
        <p>This website is experiencing high traffic. To ensure a smooth experience, you have been placed in a virtual queue.</p>
        <div class="loader"></div>
        <p>Your current position in line:</p>
        <div class="pos">${position}</div>
        <p><small>This page will automatically refresh every 10 seconds.<br>Please do not close your browser.</small></p>
    </div>
</body>
</html>
    `);
}

/**
 * Redis-backed Virtual Waiting Room Queue
 * Returns true if the request was intercepted (queued or redirected), false if allowed to proxy.
 */
export const handleWaitingRoom = async (req: IncomingMessage, res: ServerResponse, site: any, redis: Redis): Promise<boolean> => {
    if (!site.waitingRoomEnabled) return false;

    const clientIp = typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket.remoteAddress || 'unknown';

    // 1. Check for valid clearance cookie
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) acc[name] = value;
        return acc;
    }, {} as Record<string, string>);

    if (cookies[WR_COOKIE]) {
        try {
            const parts = cookies[WR_COOKIE].split('|');
            if (parts.length === 3) {
                const [hash, ipStr, timestamp] = parts;
                const expectedHash = crypto.createHmac('sha256', SECRET).update(`WR|${ipStr}|${timestamp}`).digest('hex');

                if (hash === expectedHash && ipStr === clientIp) {
                    if (Date.now() - parseInt(timestamp) < CLEARANCE_TIME_MS) {
                        return false; // Valid waiting room clearance, allow proxy
                    }
                }
            }
        } catch (e) {
            // Invalid cookie format, throw back to queue evaluation
        }
    }

    const queueKey = `shield:queue:${site.id}`;
    const activeKey = `shield:active:${site.id}`;
    const threshold = site.waitingRoomThreshold || 500;

    try {
        // Remove expired active users (older than 5 minutes)
        await redis.zremrangebyscore(activeKey, '-inf', Date.now() - ACTIVE_WINDOW_MS);

        // Count currently active users
        const activeCount = await redis.zcard(activeKey);

        let rank = await redis.zrank(queueKey, clientIp);

        if (activeCount < threshold) {
            // Backend has capacity! 
            if (rank !== null) {
                // User is in the queue. Are they at the front?
                // If capacity allows 10 users, and their rank is 0-9, let them in.
                if (rank < (threshold - activeCount)) {
                    await redis.zrem(queueKey, clientIp);
                    await redis.zadd(activeKey, Date.now(), clientIp);
                    await grantClearance(res, clientIp, req.url || '/');
                    return true;
                }
            } else {
                // User not in queue, and we have global capacity. VIP Pass!
                await redis.zadd(activeKey, Date.now(), clientIp);
                await grantClearance(res, clientIp, req.url || '/');
                return true;
            }
        }

        // Capacity is full. Put user in queue if not already there.
        if (rank === null) {
            await redis.zadd(queueKey, Date.now(), clientIp);
            // Re-fetch position
            rank = await redis.zrank(queueKey, clientIp);
        }

        // Serve HTML Queue Page (Position is Rank + 1)
        serveWaitingRoomHtml(res, site, (rank || 0) + 1);
        return true;
    } catch (redisErr) {
        console.error('[Waiting Room] Redis Error:', redisErr);
        // Fail-open to prevent total outage if Redis cluster crashes
        return false;
    }
};
