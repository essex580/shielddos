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

    // --------------------------------------------------------------------------------
    // HEURISTIC WAF: Anomaly Detection Engine
    // --------------------------------------------------------------------------------

    // 1. Shannon Entropy Check on Query Parameters
    // Calculates the randomness of the payload. Highly random strings 
    // are often zero-day shellcode, base64 obfuscation, or packed payloads.
    const queryString = url.split('?')[1] || '';
    if (queryString.length > 20) {
        const entropyScore = calculateEntropy(queryString);
        // Standard English text has an entropy of ~3.5 to 4.0.
        // Random base64/hex usually exceeds 4.8.
        if (entropyScore > 4.8) {
            console.log(`[Heuristic WAF] Blocked Anomaly: High Entropy Payload Detected (Score: ${entropyScore.toFixed(2)})`);
            return true;
        }
    }

    // 2. Suspicious Character Density (Heuristic Rule)
    // Attackers usually chain lots of special characters: /**/ ; -- () ' " %00 %27
    const specialChars = (queryString.match(/[^a-zA-Z0-9=\-&]/g) || []).length;
    if (queryString.length > 10 && specialChars / queryString.length > 0.4) {
        console.log(`[Heuristic WAF] Blocked Anomaly: High Special Character Density (${specialChars}/${queryString.length})`);
        return true;
    }

    return false;
}

/**
 * Calculates the Shannon Entropy of a given string.
 * High entropy = High randomness (Encrypted, Compressed, or Obfuscated data).
 */
function calculateEntropy(str: string): number {
    if (str.length === 0) return 0;
    const frequencies: Record<string, number> = {};
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
        const p = freq / str.length;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}
