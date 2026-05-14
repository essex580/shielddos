import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Redis from 'ioredis';

@Controller('cache')
@UseGuards(JwtAuthGuard)
export class CacheController {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    @Post('purge')
    async purgeAll() {
        const keys = await this.redis.keys('cache:*');
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
        return { success: true, cleared: keys.length };
    }

    @Post('purge/:host')
    async purgeHost(@Param('host') host: string) {
        const keys = await this.redis.keys(`cache:${host}*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
        return { success: true, cleared: keys.length };
    }
}
