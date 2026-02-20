import { Resolver, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { DashboardAnalytics } from './analytics.type';
import Redis from 'ioredis';

@Resolver(() => DashboardAnalytics)
export class AnalyticsResolver {
    private redis: Redis;

    constructor(private readonly analyticsService: AnalyticsService) {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    @Query(() => DashboardAnalytics)
    @UseGuards(AuthGuard('jwt'))
    async getGlobalAnalytics(@Context() context): Promise<DashboardAnalytics> {
        const user = context.req.user;

        // Parallelize Database and Redis Queries for maximum performance
        const [
            topIpsDb,
            topCountriesDb,
            trafficDistDb,
            allStats
        ] = await Promise.all([
            this.analyticsService.getTopIPs(user),
            this.analyticsService.getCountryAggregation(user),
            this.analyticsService.getTrafficDistribution(user),
            this.analyticsService.getAllStats(user)
        ]);

        const totalRequests = allStats.length;
        const blockedRequests = allStats.filter(s => s.blocked).length;

        // Fetch dynamic metrics from Edge Proxy via Redis
        // For a true multi-tenant we'd loop their sites, but for the global dashboard we aggregate.
        // Assuming single domain for demo or aggregating all wildcard metrics
        // In a production app, we would sum these across all domains owned by the user
        let cacheHits = 0;
        let cacheMisses = 0;
        let activeTarpits = 0;

        try {
            // Ideally we get all sites for the user, here we just sum all metrics keys for simplicity
            const hitKeys = await this.redis.keys('metrics:cache:hit:*');
            for (const key of hitKeys) cacheHits += parseInt(await this.redis.get(key) || '0');

            const missKeys = await this.redis.keys('metrics:cache:miss:*');
            for (const key of missKeys) cacheMisses += parseInt(await this.redis.get(key) || '0');

            const tarpitKeys = await this.redis.keys('metrics:tarpit:active:*');
            for (const key of tarpitKeys) activeTarpits += parseInt(await this.redis.get(key) || '0');
        } catch (e) {
            console.error('Redis Metrics Error in GraphQL Resolver:', e);
        }

        return {
            totalRequests,
            blockedRequests,
            activeTarpits,
            cacheHits,
            cacheMisses,
            topIps: topIpsDb.map(ip => ({ name: ip.ipAddress, value: parseInt(ip.count) })),
            topCountries: topCountriesDb.map(c => ({ country: c.country, count: parseInt(c.count) })),
            trafficDistribution: trafficDistDb.map(m => ({ name: m.method, value: parseInt(m.count) }))
        };
    }
}
