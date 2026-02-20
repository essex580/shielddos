import { IncomingMessage, ServerResponse } from 'http';
import { PassThrough } from 'stream';

/**
 * Deep GraphQL / JSON AST Inspector
 * Prevents Query Depth Attacks by analyzing the nesting layers in real-time.
 * Returns a new PassThrough stream that `http-proxy` can read from, or null if dropped.
 */
export const inspectGraphQLPayload = (req: IncomingMessage, res: ServerResponse, maxAllowedDepth: number = 6): PassThrough | null => {
    // Only inspect mutable payload methods
    const method = req.method;
    if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') return null;

    // Only inspect JSON or GraphQL content types
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json') && !contentType.includes('application/graphql')) {
        return null;
    }

    const inspectStream = new PassThrough();
    let currentDepth = 0;
    let depthExceeded = false;
    let insideString = false;
    let escapeNext = false;

    // Start consuming the raw network data into our buffer stream
    req.pipe(inspectStream);

    inspectStream.on('data', (chunk: Buffer) => {
        if (depthExceeded) return;
        const str = chunk.toString();

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            // Ignore brackets inside standard JSON string values
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (char === '"') {
                insideString = !insideString;
                continue;
            }

            if (!insideString) {
                if (char === '{' || char === '[') {
                    currentDepth++;
                    if (currentDepth > maxAllowedDepth) {
                        depthExceeded = true;
                        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
                        console.log(`[GraphQL WAF] Dropped malicious payload from ${ip} (AST Depth > ${maxAllowedDepth})`);

                        if (!res.headersSent) {
                            res.writeHead(413, { 'Content-Type': 'text/plain' });
                            res.end('ShieldDOS: Payload AST Depth Exceeded Safety Limit (Potential CPU Exhaustion Attack)');
                        }

                        // Forcefully terminate the connection socket to kill the upload speed and free memory
                        req.socket.destroy();
                        break;
                    }
                } else if (char === '}' || char === ']') {
                    currentDepth--;
                }
            }
        }
    });

    // Return the safe stream proxy so http-proxy can consume it simultaneously
    return inspectStream;
};
