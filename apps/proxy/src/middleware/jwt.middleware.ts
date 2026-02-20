import { IncomingMessage, ServerResponse } from 'http';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'shield_dos_jwt_super_secret_key_123';

export function verifyEdgeJwt(req: IncomingMessage, res: ServerResponse, site: any): boolean {
    const urlStr = req.url?.split('?')[0] || '';

    // Check if the requested route requires JWT protection
    if (!site.protectedRoutes || !Array.isArray(site.protectedRoutes) || site.protectedRoutes.length === 0) {
        return false; // No routes protected, let it pass
    }

    const isProtected = site.protectedRoutes.some((route: string) => urlStr.startsWith(route));
    if (!isProtected) return false;

    // Route IS protected. Check for valid JWT token in headers
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ShieldDOS Edge: Unauthorized. Missing Bearer Token for Protected Route.' }));
        return true; // Request handled (blocked)
    }

    const token = authHeader.substring(7);

    try {
        // A minimal HMAC-SHA256 JWT verifier to avoid heavy dependencies on the Edge
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid JWT structure');

        const headerB64 = parts[0];
        const payloadB64 = parts[1];
        const signatureB64 = parts[2];

        // Let's create an exact base64url equivalent using Node's crypto
        const signatureBuffer = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${headerB64}.${payloadB64}`)
            .digest();

        const expectedSignature = signatureBuffer.toString('base64url');

        if (signatureB64 !== expectedSignature) {
            throw new Error('Invalid signature');
        }

        // Token is valid! 
        return false; // Let it pass to routing
    } catch (e) {
        console.error(`[Edge JWT] Token Validation Failed:`, e);
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ShieldDOS Edge: Forbidden. Invalid or Expired Token.' }));
        return true; // Request handled (blocked)
    }
}
