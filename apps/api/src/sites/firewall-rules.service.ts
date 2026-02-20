
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

    async create(siteId: string, ruleData: Partial<FirewallRule>, user: any): Promise<FirewallRule> {
        let siteQuery: any = { id: siteId };
        if (user.role !== 'admin') siteQuery = { id: siteId, user: { id: user.userId } };

        const site = await this.sitesRepository.findOne({ where: siteQuery });
        if (!site) throw new NotFoundException('Site not found or access denied');

        const rule = this.rulesRepository.create({
            ...ruleData,
            site: site,
            hits: 0
        });
        return this.rulesRepository.save(rule);
    }

    async findAll(siteId: string, user: any): Promise<FirewallRule[]> {
        let siteQuery: any = { id: siteId };
        if (user.role !== 'admin') siteQuery = { id: siteId, user: { id: user.userId } };
        const site = await this.sitesRepository.findOne({ where: siteQuery });
        if (!site) throw new NotFoundException('Site not found or access denied');

        return this.rulesRepository.find({
            where: { site: { id: siteId } },
            order: { createdAt: 'DESC' }
        });
    }

    async remove(id: string, user: any): Promise<void> {
        const rule = await this.rulesRepository.findOne({ where: { id }, relations: ['site', 'site.user'] });
        if (!rule) throw new NotFoundException('Rule not found');

        if (user.role !== 'admin' && rule.site.user.id !== user.userId) {
            throw new NotFoundException('Access denied');
        }

        await this.rulesRepository.delete(id);
    }

    // Used by Proxy to fetch rules efficiently
    async getActiveRules(siteId: string): Promise<FirewallRule[]> {
        return this.rulesRepository.find({
            where: { site: { id: siteId }, isActive: true }
        });
    }
}
