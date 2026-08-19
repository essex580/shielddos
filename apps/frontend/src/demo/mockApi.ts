import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    createInitialSites,
    createInitialLogs,
    createInitialWafRules,
    createSiteFirewallRules,
    createChartData,
    createBandwidthData,
    createCountryAggregation,
    createGlobalAnalytics,
    createUptimeData,
    AI_EXPLAIN_STUB,
} from './mockData';

type DemoState = {
    sites: ReturnType<typeof createInitialSites>;
    logs: ReturnType<typeof createInitialLogs>;
    wafRules: ReturnType<typeof createInitialWafRules>;
    siteRules: Record<string, ReturnType<typeof createSiteFirewallRules>>;
    securityLevel: string;
};

const state: DemoState = {
    sites: createInitialSites(),
    logs: createInitialLogs(),
    wafRules: createInitialWafRules(),
    siteRules: {},
    securityLevel: 'under_attack',
};

for (const site of state.sites) {
    state.siteRules[site.id] = createSiteFirewallRules(site.id);
}

function parsePath(url: string): { pathname: string; search: string } {
    try {
        const u = new URL(url, 'http://demo.local');
        return { pathname: u.pathname, search: u.search };
    } catch {
        const [path, search = ''] = url.split('?');
        return { pathname: path, search: search ? `?${search}` : '' };
    }
}

function ok<T>(data: T, status = 200): AxiosResponse<T> {
    return { data, status, statusText: 'OK', headers: {}, config: {} as AxiosRequestConfig };
}

function handleMock(config: InternalAxiosRequestConfig): AxiosResponse | null {
    const rawUrl = config.url || '';
    const method = (config.method || 'get').toUpperCase();
    const { pathname } = parsePath(rawUrl);

    // Auth
    if (method === 'POST' && pathname.endsWith('/auth/login')) {
        return ok({ access_token: 'demo-token' });
    }
    if (method === 'POST' && pathname.endsWith('/auth/register')) {
        return ok({ access_token: 'demo-token' });
    }

    // Sites
    if (method === 'GET' && /\/sites$/.test(pathname)) {
        return ok(state.sites);
    }
    if (method === 'POST' && /\/sites$/.test(pathname)) {
        const body = config.data ? JSON.parse(config.data as string) : {};
        const site = {
            id: `demo-site-${Date.now()}`,
            domain: body.domain || 'new.example.com',
            targetIp: body.targetIp || [{ ip: '0.0.0.0', region: 'GLOBAL' }],
            isActive: true,
            botProtection: false,
            securityLevel: 'normal',
            wafEnabled: true,
            rateLimit: 200,
            autoWafEnabled: false,
            graphqlInspectionEnabled: false,
            waitingRoomEnabled: false,
            autoSslEnabled: false,
            protectedRoutes: [],
        };
        state.sites.push(site);
        state.siteRules[site.id] = [];
        return ok(site, 201);
    }
    if (method === 'DELETE' && /\/sites\/[^/]+$/.test(pathname)) {
        const id = pathname.split('/').pop()!;
        state.sites = state.sites.filter(s => s.id !== id);
        delete state.siteRules[id];
        return ok({ success: true });
    }
    if (method === 'PATCH' && /\/sites\/[^/]+$/.test(pathname)) {
        const id = pathname.split('/').pop()!;
        const body = config.data ? JSON.parse(config.data as string) : {};
        const site = state.sites.find(s => s.id === id);
        if (site) Object.assign(site, body);
        return ok(site);
    }
    if (method === 'POST' && /\/sites\/[^/]+\/verify$/.test(pathname)) {
        return ok({ resolvedIp: '104.21.45.12', isConfigured: true });
    }
    if (method === 'POST' && /\/sites\/[^/]+\/purge-cache$/.test(pathname)) {
        return ok({ cleared: 128 });
    }

    // Site firewall rules
    const siteRulesMatch = pathname.match(/\/sites\/([^/]+)\/rules(?:\/([^/]+))?$/);
    if (siteRulesMatch) {
        const [, siteId, ruleId] = siteRulesMatch;
        if (!state.siteRules[siteId]) state.siteRules[siteId] = [];

        if (method === 'GET') return ok(state.siteRules[siteId]);
        if (method === 'POST') {
            const body = config.data ? JSON.parse(config.data as string) : {};
            const rule = { id: `sfr-${Date.now()}`, siteId, ...body };
            state.siteRules[siteId].push(rule);
            return ok(rule, 201);
        }
        if (method === 'DELETE' && ruleId) {
            state.siteRules[siteId] = state.siteRules[siteId].filter(r => r.id !== ruleId);
            return ok({ success: true });
        }
    }

    // Analytics
    if (method === 'GET' && pathname.endsWith('/analytics/chart')) {
        return ok(createChartData());
    }
    if (method === 'GET' && pathname.endsWith('/analytics/bandwidth')) {
        return ok(createBandwidthData());
    }
    if (method === 'GET' && pathname.endsWith('/analytics/logs/advanced')) {
        return ok(state.logs);
    }
    if (method === 'GET' && pathname.endsWith('/analytics/aggregation/countries')) {
        return ok(createCountryAggregation(state.logs));
    }
    if (method === 'GET' && /\/analytics$/.test(pathname)) {
        return ok(state.logs);
    }

    // GraphQL
    if (method === 'POST' && pathname.endsWith('/graphql')) {
        const analytics = createGlobalAnalytics(state.logs);
        return ok({ data: { getGlobalAnalytics: analytics } });
    }

    // WAF
    if (method === 'GET' && pathname.endsWith('/waf/rules')) {
        return ok(state.wafRules);
    }
    if (method === 'POST' && pathname.endsWith('/waf/rules')) {
        const body = config.data ? JSON.parse(config.data as string) : {};
        const rule = { id: `waf-${Date.now()}`, ...body };
        state.wafRules.push(rule);
        return ok(rule, 201);
    }
    if (method === 'DELETE' && /\/waf\/rules\/[^/]+$/.test(pathname)) {
        const id = pathname.split('/').pop()!;
        state.wafRules = state.wafRules.filter(r => r.id !== id);
        return ok({ success: true });
    }
    if (method === 'GET' && pathname.endsWith('/waf/status')) {
        return ok({ securityLevel: state.securityLevel });
    }
    if (method === 'POST' && pathname.endsWith('/waf/status')) {
        const body = config.data ? JSON.parse(config.data as string) : {};
        if (body.securityLevel) state.securityLevel = body.securityLevel;
        return ok({ success: true, securityLevel: state.securityLevel });
    }

    // Cache / SSL / Uptime / AI
    if (method === 'POST' && pathname.endsWith('/cache/purge')) {
        return ok({ cleared: 256 });
    }
    if (method === 'POST' && /\/ssl\/issue\//.test(pathname)) {
        return ok({ success: true, message: 'Certificate issued (preview)' });
    }
    if (method === 'GET' && /\/uptime\/sites\/[^/]+$/.test(pathname)) {
        const siteId = pathname.split('/').pop()!;
        return ok(createUptimeData(siteId));
    }
    if (method === 'POST' && pathname.endsWith('/ai/explain-threat')) {
        return ok({ explanation: AI_EXPLAIN_STUB });
    }

    console.warn('[Demo] Unhandled mock request:', method, pathname);
    return ok({});
}

export function getDemoState() {
    return state;
}

export function setupDemoApi(axios: { interceptors: { request: { use: Function } } }) {
    axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const mock = handleMock(config);
        if (mock) {
            config.adapter = () => Promise.resolve(mock);
        }
        return config;
    });
}
