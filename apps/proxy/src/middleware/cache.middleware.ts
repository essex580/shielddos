import { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';

// Cache static assets for 1 hour by default
const CACHE_TTL = 3600;
const STATIC_EXTENSIONS = /\.(css|js|jpeg|jpg|png|gif|svg|ico|woff|woff2|ttf|eot)$/i;

export async function serveCachedResponse(req: IncomingMessage, res: ServerResponse, redis: Redis, host: string): Promise<boolean> {
    if (req.method !== 'GET') return false;

    const url = req.url || '';
    if (!STATIC_EXTENSIONS.test(url)) return false;

    const cacheKey = `cache:${host}${url}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            res.writeHead(200, {
                'Content-Type': data.contentType,
                'X-Shield-Cache': 'HIT',
                ...data.headers
            });
            res.end(Buffer.from(data.body, 'base64'));
            return true; // Successfully served from cache
        }
    } catch (e) {
        console.error('Cache Read Error:', e);
    }
    return false;
}

export function interceptAndCacheResponse(req: IncomingMessage, res: ServerResponse, redis: Redis, host: string) {
    if (req.method !== 'GET') return;

    const url = req.url || '';
    if (!STATIC_EXTENSIONS.test(url)) return;

    const cacheKey = `cache:${host}${url}`;

    const _write = res.write;
    const _end = res.end;
    const chunks: Buffer[] = [];

    res.write = function (chunk: any, encoding?: any, callback?: any) {
        if (Buffer.isBuffer(chunk)) chunks.push(chunk);
        else if (typeof chunk === 'string') chunks.push(Buffer.from(chunk, encoding as BufferEncoding));

        return _write.apply(res, arguments as any);
    } as any;

    res.end = function (chunk?: any, encoding?: any, callback?: any) {
        if (chunk) {
            if (Buffer.isBuffer(chunk)) chunks.push(chunk);
            else if (typeof chunk === 'string') chunks.push(Buffer.from(chunk, encoding as BufferEncoding));
        }

        if (res.statusCode === 200) {
            const body = Buffer.concat(chunks);
            // Only cache if it's less than 5MB to save redis memory
            if (body.length < 5 * 1024 * 1024) {
                const contentType = res.getHeader('content-type') || 'application/octet-stream';

                // Store standard headers we want to proxy back
                const headersToCache: Record<string, string> = {};
                if (res.getHeader('cache-control')) headersToCache['Cache-Control'] = res.getHeader('cache-control') as string;

                const cacheData = JSON.stringify({
                    contentType,
                    headers: headersToCache,
                    body: body.toString('base64')
                });

                redis.setex(cacheKey, CACHE_TTL, cacheData).catch(e => console.error('Cache Write Error:', e));
            }
        }

        return _end.apply(res, arguments as any);
    } as any;
}
