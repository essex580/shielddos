export const DEMO_TOKEN = 'demo-token';

export const isDemoMode =
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    (import.meta.env.PROD && typeof window !== 'undefined' && window.location.hostname.includes('github.io'));

export function isDemoToken(): boolean {
    return localStorage.getItem('access_token') === DEMO_TOKEN;
}

export function enterDemoSession(): void {
    localStorage.setItem('access_token', DEMO_TOKEN);
}
