import { IncomingMessage, ServerResponse } from 'http';
import * as crypto from 'crypto';
import * as url from 'url';

const COOKIE_NAME = 'shield_dos_challenge';
const SECRET = 'shield_dos_secret_key'; // In prod, env var

export const handleChallenge = (req: IncomingMessage, res: ServerResponse): boolean => {
    // Returns true if the request was handled (blocked/challenged/verified), false if it should pass through

    // Check cookie
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);

    if (cookies[COOKIE_NAME]) {
        const [hash, timestamp] = cookies[COOKIE_NAME].split('.');
        // Simple verification: expiry < 1 hour
        if (Date.now() - parseInt(timestamp) < 3600000) {
            return false; // Valid cookie, pass through
        }
    }

    // Check if verification path
    if (req.method === 'POST' && req.url?.startsWith('/__shield_challenge')) {
        const parsedUrl = url.parse(req.url, true);
        const originalUrl = parsedUrl.query.original_url as string || '/';

        const timestamp = Date.now();
        const hash = crypto.createHmac('sha256', SECRET).update(`${req.socket.remoteAddress}-${timestamp}`).digest('hex');
        const token = `${hash}.${timestamp}`;

        res.writeHead(302, {
            'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=3600`,
            'Location': originalUrl
        });
        res.end();
        return true; // Handled
    }

    // Serve Interstitial
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Just a moment...</title>
                    < meta name = "viewport" content = "width=device-width, initial-scale=1" >
                        <style>
                        body { display: flex; flex - direction: column; align - items: center; justify - content: center; height: 100vh; margin: 0; background: #ffffff; color: #333; font - family: -apple - system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans - serif; }
            .card { text - align: center; max - width: 400px; padding: 40px; }
            .loader { border: 3px solid #f3f3f3; border - top: 3px solid #f58220; border - radius: 50 %; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
            h1 { font - size: 24px; font - weight: 500; margin - bottom: 10px; color: #111; }
            p { color: #555; font - size: 15px; margin - bottom: 20px; line - height: 1.5; }
            .footer { margin - top: 30px; font - size: 12px; color: #999; }
@keyframes spin { 0 % { transform: rotate(0deg); } 100 % { transform: rotate(360deg); } }
</style>
    <script>
setTimeout(() => {
    fetch('/__shield_challenge?original_url=' + encodeURIComponent(window.location.href), { method: 'POST' })
        .then(() => window.location.reload())
        .catch(e => console.error(e));
}, 3000);
</script>
    </head>
    < body >
    <div class="card" >
        <div class="loader" > </div>
            < h1 > Checking your browser...</h1>
                < p > This process is automatic.Your browser will redirect to your requested content shortly.</p>
                    < p id = "timer-text" > Please allow up to < span id = "timer" > 3 < /span> seconds...</p >
                        <div class="footer" > Protection by ShieldDOS </div>
                            </div>
                            <script>
let count = 3;
setInterval(() => {
    count--;
    if (count >= 0) document.getElementById('timer').innerText = count;
}, 1000);
</script>
    </body>
    </html>
        `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
    return true; // Handled (Served challenge)
};
