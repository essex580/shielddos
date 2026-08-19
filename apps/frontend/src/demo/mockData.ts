const SITE_IDS = {
    shield: 'demo-site-001',
    api: 'demo-site-002',
    shop: 'demo-site-003',
} as const;

function hoursAgo(h: number): string {
    return new Date(Date.now() - h * 3600_000).toISOString();
}

function randomId(): string {
    return `evt-${Math.random().toString(36).slice(2, 10)}`;
}

const paths = ['/api/v1/users', '/wp-admin/setup-config.php', '/graphql', '/assets/main.js', '/login', '/.env', '/admin/config'];
const methods = ['GET', 'POST', 'HEAD', 'PUT'];
const countries = ['US', 'CN', 'RU', 'RO', 'DE', 'BR', 'IN', 'NL'];
const ips = ['185.220.101.42', '103.152.112.88', '91.219.236.14', '89.32.45.12', '45.33.32.156', '203.142.78.91'];

export function createInitialSites() {
    return [
        {
            id: SITE_IDS.shield,
            domain: 'shield.example.com',
            targetIp: [
                { ip: '104.21.45.12', region: 'EU' },
                { ip: '172.67.182.44', region: 'US' },
            ],
            isActive: true,
            botProtection: true,
            securityLevel: 'normal',
            wafEnabled: true,
            rateLimit: 200,
            autoWafEnabled: true,
            graphqlInspectionEnabled: true,
            waitingRoomEnabled: false,
            autoSslEnabled: true,
            protectedRoutes: ['/admin', '/api/private'],
            verificationStatus: { resolvedIp: '104.21.45.12', isConfigured: true, checking: false },
        },
        {
            id: SITE_IDS.api,
            domain: 'api.acme.io',
            targetIp: [{ ip: '10.0.4.22', region: 'US' }],
            isActive: true,
            botProtection: true,
            securityLevel: 'strict',
            wafEnabled: true,
            rateLimit: 120,
            autoWafEnabled: false,
            graphqlInspectionEnabled: true,
            waitingRoomEnabled: true,
            autoSslEnabled: true,
            protectedRoutes: ['/internal'],
            verificationStatus: { resolvedIp: '10.0.4.22', isConfigured: true, checking: false },
        },
        {
            id: SITE_IDS.shop,
            domain: 'shop.megacorp.net',
            targetIp: [{ ip: '192.168.50.10', region: 'AS' }],
            isActive: false,
            botProtection: false,
            securityLevel: 'lenient',
            wafEnabled: false,
            rateLimit: 500,
            autoWafEnabled: false,
            graphqlInspectionEnabled: false,
            waitingRoomEnabled: false,
            autoSslEnabled: false,
            protectedRoutes: [],
        },
    ];
}

export function createInitialLogs() {
    const domains = ['shield.example.com', 'api.acme.io', 'shop.megacorp.net'];
    const logs = [];

    for (let i = 0; i < 50; i++) {
        const blocked = i % 4 === 0 || paths[i % paths.length].includes('wp-admin') || paths[i % paths.length] === '/.env';
        logs.push({
            id: `log-${String(i).padStart(3, '0')}`,
            siteId: i % 3 === 0 ? SITE_IDS.shield : i % 3 === 1 ? SITE_IDS.api : SITE_IDS.shop,
            domain: domains[i % 3],
            path: paths[i % paths.length],
            method: methods[i % methods.length],
            ipAddress: ips[i % ips.length],
            statusCode: blocked ? 403 : 200,
            userAgent: blocked ? 'python-requests/2.31.0' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            country: countries[i % countries.length],
            blocked,
            bandwidth: 1200 + (i * 37) % 8000,
            responseTime: 12 + (i * 7) % 180,
            timestamp: hoursAgo(i * 0.4),
        });
    }

    return logs;
}

export function createInitialWafRules() {
    return [
        {
            id: 'waf-rule-001',
            name: 'Block Tor exit nodes',
            field: 'ip',
            operator: 'in',
            value: '185.220.101.42,91.219.236.14',
            action: 'block',
        },
        {
            id: 'waf-rule-002',
            name: 'Challenge suspicious paths',
            field: 'path',
            operator: 'contains',
            value: '/wp-admin',
            action: 'challenge',
        },
        {
            id: 'waf-rule-003',
            name: 'Allow health checks',
            field: 'path',
            operator: 'equals',
            value: '/health',
            action: 'bypass',
        },
    ];
}

export function createSiteFirewallRules(siteId: string) {
    if (siteId === SITE_IDS.shield) {
        return [
            { id: 'sfr-001', type: 'BLOCK_COUNTRY', value: 'CN', siteId },
            { id: 'sfr-002', type: 'BLOCK_IP', value: '103.152.112.88', siteId },
        ];
    }
    return [{ id: 'sfr-003', type: 'CUSTOM_RULE', value: JSON.stringify({ action: 'BLOCK', field: 'path', operator: 'contains', match: '/.env' }), siteId }];
}

export function createChartData() {
    const data = [];
    for (let h = 23; h >= 0; h--) {
        const count = 180 + Math.floor(Math.random() * 420);
        const blocked = Math.floor(count * (0.05 + Math.random() * 0.12));
        data.push({
            time: `${String(23 - h).padStart(2, '0')}:00`,
            count: String(count),
            blocked: String(blocked),
        });
    }
    return data;
}

export function createBandwidthData() {
    const data = [];
    for (let h = 23; h >= 0; h--) {
        data.push({
            time: `${String(23 - h).padStart(2, '0')}:00`,
            bytes: String(450_000 + Math.floor(Math.random() * 2_100_000)),
        });
    }
    return data;
}

export function createCountryAggregation(logs: any[]) {
    const counts: Record<string, number> = {};
    for (const log of logs) {
        counts[log.country] = (counts[log.country] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([country, count]) => ({ country, count: String(count) }))
        .sort((a, b) => parseInt(b.count) - parseInt(a.count));
}

export function createGlobalAnalytics(logs: any[]) {
    const totalRequests = 12400;
    const blockedRequests = logs.filter(l => l.blocked).length * 17;
    const ipCounts: Record<string, number> = {};
    const methodCounts: Record<string, number> = {};

    for (const log of logs) {
        ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
        methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
    }

    return {
        totalRequests,
        blockedRequests,
        activeTarpits: 3,
        cacheHits: 8420,
        cacheMisses: 3980,
        topIps: Object.entries(ipCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5),
        trafficDistribution: Object.entries(methodCounts).map(([name, value]) => ({ name, value })),
    };
}

export function createUptimeData(siteId: string) {
    const points = [];
    for (let i = 23; i >= 0; i--) {
        points.push({
            timestamp: hoursAgo(i),
            status: siteId === SITE_IDS.shop && i < 3 ? 'down' : 'up',
            latency: 20 + (i * 3) % 90,
        });
    }
    return points;
}

export function createTrafficEvent(sites: any[], logs: any[]) {
    const template = logs[Math.floor(Math.random() * logs.length)];
    const site = sites.find(s => s.id === template.siteId) || sites[0];
    return {
        ...template,
        id: randomId(),
        timestamp: new Date().toISOString(),
        siteId: site.id,
        domain: site.domain,
        responseTime: 15 + Math.floor(Math.random() * 120),
        blocked: Math.random() < 0.25,
    };
}

export const AI_EXPLAIN_STUB =
    '**Threat Assessment (Preview Mode):**\n\nThis request exhibits characteristics consistent with automated vulnerability scanning. The source IP has triggered WAF heuristics targeting sensitive paths. Recommended action: maintain block rule and enable JS challenge for the originating ASN.';

export const AI_REPORT_STUB =
    '**Executive Summary (Preview Mode):**\n\nTraffic analysis indicates coordinated probing activity against `/wp-admin` and `/.env` endpoints from multiple geographic regions. Primary threat vectors: credential stuffing and CMS exploit attempts.\n\n**Recommendations:** Enable Under Attack mode, tighten rate limits on `/api/*`, and block known bad ASNs.';
