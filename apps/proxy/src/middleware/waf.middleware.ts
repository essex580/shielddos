import { IncomingMessage, ServerResponse } from 'http';

const WAF_PATTERNS = [
    // 1. SQL Injection (SQLi)
    /UNION\s+SELECT/i,
    /OR\s+['"]?\d+['"]?=['"]?\d+['"]?/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /xp_cmdshell/i,
    /EXEC\s*\(/i,
    /INFORMATION_SCHEMA/i,
    /--\s*$/i, // SQL Commenting

    // 2. Cross-Site Scripting (XSS)
    /<script\b[^>]*>([\s\S]*?)<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onmous\w+\s*=/i,
    /document\.cookie/i,
    /<iframe\b[^>]*>/i,

    // 3. Path Traversal & Local File Inclusion (LFI)
    /\.\.\//,
    /\.\.\\/,
    /\/etc\/passwd/i,
    /win\.ini/i,
    /boot\.ini/i,
    /\.env/i,
    /\/var\/log\//i,

    // 4. Remote Code Execution (RCE) / Command Injection
    /;\s*(ls|cat|pwd|whoami|ping|netstat|nmap|wget|curl)\b/i,
    /\|\s*(ls|cat|pwd|whoami|ping|netstat|nmap|wget|curl)\b/i,
    /`.*(ls|cat|pwd|whoami|ping|netstat|nmap|wget|curl).*`/i,

    // 5. Insecure Deserialization / Object Injection Patterns
    /O:\d+:"[^"]+":\d+:/i, // PHP Object Injection
];

export function isWafAttack(req: IncomingMessage): boolean {
    const url = req.url || '';
    const userAgent = req.headers['user-agent'] || '';

    // Check URL and Query String
    for (const pattern of WAF_PATTERNS) {
        if (pattern.test(url)) return true;
        if (pattern.test(userAgent)) return true;
    }

    // In a more advanced WAF we would also check the body, 
    // but that requires buffering the request which can be heavy.
    // For this implementation, we stick to URL/Headers.

    return false;
}
