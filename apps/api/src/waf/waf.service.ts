import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WafRule } from './waf-rule.entity';
import Redis from 'ioredis';

@Injectable()
export class WafService implements OnModuleInit {
    private redis: Redis;

    constructor(
        @InjectRepository(WafRule)
        private wafRuleRepo: Repository<WafRule>,
    ) {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async onModuleInit() {
        await this.syncToRedis();
    }

    async findAll(): Promise<WafRule[]> {
        return this.wafRuleRepo.find({ order: { priority: 'DESC', createdAt: 'DESC' } });
    }

    async create(data: Partial<WafRule>): Promise<WafRule> {
        const rule = this.wafRuleRepo.create(data);
        const saved = await this.wafRuleRepo.save(rule);
        await this.syncToRedis();
        return saved;
    }

    async update(id: string, data: Partial<WafRule>): Promise<WafRule> {
        await this.wafRuleRepo.update(id, data);
        const updated = await this.wafRuleRepo.findOneBy({ id });
        await this.syncToRedis();
        return updated;
    }

    async remove(id: string): Promise<void> {
        await this.wafRuleRepo.delete(id);
        await this.syncToRedis();
    }

    async syncToRedis() {
        const rules = await this.wafRuleRepo.find({ where: { enabled: true }, order: { priority: 'DESC' } });
        await this.redis.set('shield:waf:rules', JSON.stringify(rules));
        console.log(`[WAF] Synced ${rules.length} active rules to Redis.`);
    }

    async toggleUnderAttackMode(enabled: boolean) {
        if (enabled) {
            await this.redis.set('shield:security:level', 'under_attack');
        } else {
            await this.redis.set('shield:security:level', 'standard');
        }
    }
    
    async getSecurityLevel(): Promise<string> {
        return (await this.redis.get('shield:security:level')) || 'standard';
    }
}
