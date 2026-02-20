import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uptime } from './uptime.entity';
import { Site } from '../sites/site.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class UptimeService {
    private readonly logger = new Logger(UptimeService.name);

    constructor(
        @InjectRepository(Uptime)
        private uptimeRepository: Repository<Uptime>,
        @InjectRepository(Site)
        private sitesRepository: Repository<Site>,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES, { name: 'origin-uptime-monitor' })
    async monitorOrigins() {
        this.logger.debug('Running Global Origin Uptime Checks...');
        const sites = await this.sitesRepository.find({ where: { isActive: true } });

        for (const site of sites) {
            await this.pingSite(site);
        }
    }

    private async pingSite(site: Site) {
        let primaryIp = '';
        if (Array.isArray(site.targetIp) && site.targetIp.length > 0) {
            primaryIp = site.targetIp[0].ip;
        } else if (typeof site.targetIp === 'string') {
            primaryIp = site.targetIp;
        }

        if (!primaryIp) return; // Silent skip if no origins registered yet

        const target = primaryIp.startsWith('http') ? primaryIp : `http://${primaryIp}`;
        const startTime = Date.now();

        let status: 'up' | 'down' = 'up';
        let latencyMs = 0;
        let errorMessage = null;

        try {
            // Send a lightweight HEAD request to check availability
            await axios.head(target, {
                timeout: 5000,
                headers: { 'User-Agent': 'ShieldDOS-Uptime-Monitor/1.0' }
            });
            latencyMs = Date.now() - startTime;
        } catch (error: any) {
            status = 'down';
            errorMessage = error.message;
            // Differentiate between timeouts and explicit 5xx errors from proxy
            this.logger.warn(`Site Origin Down: ${site.domain} (${target}) - ${errorMessage}`);
        }

        const log = this.uptimeRepository.create({
            site: { id: site.id },
            targetIp: site.targetIp,
            status,
            latencyMs,
            errorMessage
        });

        await this.uptimeRepository.save(log);

        // Optional logic: if site goes down, send email, webhook, etc.
    }

    async getUptimeStats(siteId: string, user: any) {
        // Enforce RBAC
        const site = await this.sitesRepository.findOne({
            where: { id: siteId },
            relations: ['user'] // Need to verify ownership
        });

        if (!site) throw new Error('Site not found');
        if (user.role !== 'admin' && site.user.id !== user.userId) {
            throw new Error('Access denied');
        }

        // Fetch last 50 pings
        const logs = await this.uptimeRepository.find({
            where: { site: { id: siteId } },
            order: { timestamp: 'DESC' },
            take: 50
        });

        return logs.reverse(); // Return in chronological order for frontend graphing
    }
}
