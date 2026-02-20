import axios from 'axios';
import { IncomingMessage } from 'http';

// using a Set for O(1) IP lookup times
let malicousIps = new Set<string>();
let isLoaded = false;

const THREAT_LIST_URL = 'https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt';

export async function loadThreatIntelligence() {
    try {
        console.log('[ThreatIntel] Downloading global IP Blacklist...');
        const response = await axios.get(THREAT_LIST_URL, { timeout: 10000 });
        const lines = response.data.split('\n');

        const newSet = new Set<string>();

        for (const line of lines) {
            // Skip comments and empty lines
            if (!line || line.startsWith('#')) continue;

            const parts = line.split('\t');
            if (parts.length >= 2) {
                const ip = parts[0].trim();
                const score = parseInt(parts[1].trim(), 10);

                // Only block IPs that appear on at least 3 different blacklists (High Confidence)
                if (score >= 3) {
                    newSet.add(ip);
                }
            }
        }

        malicousIps = newSet;
        isLoaded = true;
        console.log(`[ThreatIntel] Successfully loaded ${malicousIps.size} highly malicious IPs.`);
    } catch (e: any) {
        console.error('[ThreatIntel] Failed to load global IP blacklist:', e.message);
    }
}

// Ensure the list updates automatically every 24 hours
setInterval(loadThreatIntelligence, 24 * 60 * 60 * 1000);

// Call this function instantly at boot
loadThreatIntelligence();

export function isBlacklistedIp(req: IncomingMessage): boolean {
    if (!isLoaded || malicousIps.size === 0) return false;

    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp[0];

    return malicousIps.has(ip);
}
