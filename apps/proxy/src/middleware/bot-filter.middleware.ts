import { IncomingMessage } from 'http';

const BOT_USER_AGENTS = [
    'curl', 'wget', 'python', 'go-http-client', 'scrapy', 'bot', 'crawler', 'spider', 'headless', 'puppeteer'
];

export const isBot = (req: IncomingMessage): boolean => {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    if (BOT_USER_AGENTS.some(bot => userAgent.includes(bot))) {
        return true;
    }

    return false;
};
