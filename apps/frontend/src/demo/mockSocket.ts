import { createTrafficEvent } from './mockData';
import { getDemoState } from './mockApi';

export type MockSocket = {
    on: (event: string, handler: (...args: any[]) => void) => void;
    disconnect: () => void;
};

export function createMockSocket(): MockSocket {
    const handlers: Record<string, ((...args: any[]) => void)[]> = {};
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const socket: MockSocket = {
        on(event: string, handler: (...args: any[]) => void) {
            if (!handlers[event]) handlers[event] = [];
            handlers[event].push(handler);

            if (event === 'connect') {
                setTimeout(() => handler(), 50);
            }

            if (event === 'new_traffic' && !intervalId) {
                intervalId = setInterval(() => {
                    const state = getDemoState();
                    const event = createTrafficEvent(state.sites, state.logs);
                    state.logs.unshift(event);
                    if (state.logs.length > 500) state.logs.pop();
                    for (const h of handlers['new_traffic'] || []) h(event);
                }, 3500);
            }
        },
        disconnect() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },
    };

    return socket;
}
