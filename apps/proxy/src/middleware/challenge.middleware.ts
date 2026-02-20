import { IncomingMessage, ServerResponse } from 'http';
import * as crypto from 'crypto';
import * as url from 'url';
import axios from 'axios';

const COOKIE_NAME = 'shield_dos_clearance';
const SECRET = process.env.COOKIE_SECRET || 'shield_dos_super_secret_key_123';

export const handleChallenge = async (req: IncomingMessage, res: ServerResponse, site: any): Promise<boolean> => {
    // Returns true if the request was handled (blocked/challenged/verified), false if it should pass through

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

    if (cookies[COOKIE_NAME]) {
        try {
            const [hash, ipStr, timestamp] = cookies[COOKIE_NAME].split('.');
            // Verify HMAC signature
            const expectedHash = crypto.createHmac('sha256', SECRET).update(`${ipStr}.${timestamp}`).digest('hex');

            if (hash === expectedHash && ipStr === clientIp) {
                // Verify expiration (30 minutes)
                if (Date.now() - parseInt(timestamp) < 30 * 60 * 1000) {
                    return false; // Valid clearance, pass through to proxy
                }
            }
        } catch (e) {
            // Invalid cookie format, continue to challenge
        }
    }

    // 2. Handle Turnstile Verification POST request
    if (req.method === 'POST' && req.url?.startsWith('/__shield_turnstile_verify')) {
        return new Promise((resolve) => {
            const parsedUrl = url.parse(req.url || '/', true);
            const originalUrl = (parsedUrl.query.original_url as string) || '/';

            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
                if (body.length > 1e6) req.socket.destroy(); // Flood protection
            });

            req.on('end', async () => {
                const searchParams = new URLSearchParams(body);
                const token = searchParams.get('cf-turnstile-response');

                // FALLBACK MODE (No Turnstile Keys Configured)
                // If they reached here via the 3-second HTML delay form, issue the clearance cookie natively.
                if (!site.turnstileSecretKey || !site.turnstileSiteKey) {
                    const timestamp = Date.now();
                    const hash = crypto.createHmac('sha256', SECRET).update(`${clientIp}.${timestamp}`).digest('hex');
                    const clearanceCookie = `${hash}.${clientIp}.${timestamp}`;

                    res.writeHead(302, {
                        'Set-Cookie': `${COOKIE_NAME}=${clearanceCookie}; Path=/; HttpOnly; Max-Age=1800; SameSite=Lax`,
                        'Location': originalUrl
                    });
                    res.end();
                    resolve(true); // Handled perfectly
                    return;
                }

                // If Turnstile IS active, but the user bypassed the UI and sent an empty token:
                if (!token) {
                    serveChallengePage(res, site, originalUrl);
                    resolve(true);
                    return;
                }

                try {
                    // Verify with Cloudflare API
                    const cfRes = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                        secret: site.turnstileSecretKey,
                        response: token,
                        remoteip: clientIp
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (cfRes.data.success) {
                        // Issue Clearance Cookie
                        const timestamp = Date.now();
                        const hash = crypto.createHmac('sha256', SECRET).update(`${clientIp}.${timestamp}`).digest('hex');
                        const clearanceCookie = `${hash}.${clientIp}.${timestamp}`;

                        res.writeHead(302, {
                            'Set-Cookie': `${COOKIE_NAME}=${clearanceCookie}; Path=/; HttpOnly; Max-Age=1800; SameSite=Lax`,
                            'Location': originalUrl
                        });
                        res.end();
                    } else {
                        // Failed verification, re-challenge
                        serveChallengePage(res, site, originalUrl);
                    }
                } catch (e) {
                    console.error('Turnstile verification error:', e);
                    serveChallengePage(res, site, originalUrl);
                }
                resolve(true); // Handled
            });
        });
    }

    // 3. Serve the HTML Challenge Page
    serveChallengePage(res, site, req.url || '/');
    return true; // Handled
};

function serveChallengePage(res: ServerResponse, site: any, originalUrl: string) {
    // If no Turnstile keys are configured, fallback to the old dummy JS challenge
    if (!site.turnstileSiteKey || !site.turnstileSecretKey) {
        const fallbackHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Just a moment...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                .card { text-align: center; max-width: 400px; padding: 40px; }
                .loader { border: 3px solid #f3f3f3; border-top: 3px solid #f58220; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
                h1 { font-size: 24px; font-weight: 500; margin-bottom: 10px; color: #111; }
                p { color: #555; font-size: 15px; margin-bottom: 20px; line-height: 1.5; }
                .footer { margin-top: 30px; font-size: 12px; color: #999; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
            <script>
                setTimeout(() => {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/__shield_turnstile_verify?original_url=' + encodeURIComponent('${originalUrl}');
                    document.body.appendChild(form);
                    form.submit();
                }, 3000);
            </script>
        </head>
        <body>
            <div class="card">
                <div class="loader"></div>
                <h1>Checking your browser...</h1>
                <p>Please wait while we verify your browser. This process is automatic.</p>
                <div class="footer">Protection by ShieldDOS (Fallback Mode)</div>
            </div>
        </body>
        </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(fallbackHtml);
        res.end();
        return;
    }

    // Serve Cloudflare Turnstile Challenge HTML
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>One more step</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .card { text-align: center; max-width: 450px; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid #e5e7eb; }
            .logo { width: 48px; height: 48px; background: #3b82f6; border-radius: 12px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center; color: white; }
            .logo svg { width: 24px; height: 24px; }
            h1 { font-size: 22px; font-weight: 600; margin-bottom: 12px; color: #111827; }
            p { color: #6b7280; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
            .turnstile-container { margin: 24px auto; min-height: 65px; display: flex; justify-content: center; }
            .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px; }
            .ray-id { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-top: 8px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h1>Verify you are human</h1>
            <p>Please complete the security check to access <strong>${site.domain}</strong>. This helps prevent automated attacks and ensures a safe browsing experience.</p>
            
            <form action="/__shield_turnstile_verify?original_url=${encodeURIComponent(originalUrl)}" method="POST">
                <div class="turnstile-container">
                    <div class="cf-turnstile" data-sitekey="${site.turnstileSiteKey}" data-theme="light"></div>
                </div>
                <noscript>    
                    <p style="color: red; font-size: 12px;">JavaScript is required to pass this security check.</p>
                </noscript>
                <!-- Form auto-submits via Turnstile's built in mechanics, or we can listen to the callback, but the standard form action works perfectly -->
                <button type="submit" style="display:none;" id="submit-btn"></button>
            </form>
            
            <script>
                // We don't strictly need to auto-submit, Turnstile injects an input named cf-turnstile-response that gets submitted if the user clicks a button.
                // But better UX: auto submit when verified.
                window.onload = function() {
                    const btn = document.getElementById('submit-btn');
                    // We can configure turnstile to auto-submit the form upon success if we want, or just wait for the user to click.
                    // Actually, if it's an invisible challenge, it auto runs. 
                    // If it's visible, the user clicks, Turnstile handles it, then we submit.
                    
                    // Add a callback to the Turnstile config to submit form automatically when solved
                    const turnstileEl = document.querySelector('.cf-turnstile');
                    if(turnstileEl) {
                        turnstileEl.setAttribute('data-callback', 'onTurnstileSuccess');
                    }
                }
                function onTurnstileSuccess(token) {
                    document.forms[0].submit();
                }
            </script>

            <div class="footer">
                <div>Secured by ShieldDOS WAF</div>
                <div class="ray-id">Ray ID: ${crypto.randomBytes(8).toString('hex')}</div>
            </div>
        </div>
    </body>
    </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}
