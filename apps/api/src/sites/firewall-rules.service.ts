
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallRule, RuleType } from './firewall-rule.entity';
import { Site } from './site.entity';

@Injectable()
export class FirewallRulesService {
    constructor(
        @InjectRepository(FirewallRule)
        private rulesRepository: Repository<FirewallRule>,
        @InjectRepository(Site)
        private sitesRepository: Repository<Site>,
    ) { }

    async create(siteId: string, ruleData: Partial<FirewallRule>): Promise<FirewallRule> {
        const site = await this.sitesRepository.findOneBy({ id: siteId });
        if (!site) throw new NotFoundException('Site not found');

        const rule = this.rulesRepository.create({
            ...ruleData,
            site: site,
            hits: 0
        });
        return this.rulesRepository.save(rule);
    }

    async findAll(siteId: string): Promise<FirewallRule[]> {
        return this.rulesRepository.find({
            where: { site: { id: siteId } },
            order: { createdAt: 'DESC' }
        });
    }

    async remove(id: string): Promise<void> {
        await this.rulesRepository.delete(id);
    }

    // Used by Proxy to fetch rules efficiently
    async getActiveRules(siteId: string): Promise<FirewallRule[]> {
        return this.rulesRepository.find({
            where: { site: { id: siteId }, isActive: true }
        });
    }
}
