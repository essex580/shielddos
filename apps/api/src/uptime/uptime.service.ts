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
            let statusChanged = false;

            if (Array.isArray(site.targetIp)) {
                // Ping EVERY origin in the multi-origin loadbalancer
                for (let i = 0; i < site.targetIp.length; i++) {
                    const origin = site.targetIp[i];
                    if (!origin.ip) continue;

                    const newStatus = await this.pingSite(site, origin.ip);
                    const isDown = newStatus === 'down';

                    // Only write to Postgres if the state actually changed to save DB cycles
                    if (origin.isDown !== isDown) {
                        site.targetIp[i].isDown = isDown;
                        statusChanged = true;
                    }
                }
            } else if (typeof site.targetIp === 'string') {
                // Legacy support for single string IPs
                await this.pingSite(site, site.targetIp as string);
            }

            if (statusChanged) {
                await this.sitesRepository.save(site);
                this.logger.verbose(`Updated Origin Failover State for ${site.domain}`);
            }
        }
    }

    private async pingSite(site: Site, targetIpStr: string): Promise<'up' | 'down'> {
        if (!targetIpStr) return 'down';

        const targetUrl = targetIpStr.startsWith('http') ? targetIpStr : `http://${targetIpStr}`;
        const startTime = Date.now();

        let status: 'up' | 'down' = 'up';
        let latencyMs = 0;
        let errorMessage = null;

        try {
            // Send a lightweight HEAD request to check availability
            await axios.head(targetUrl, {
                timeout: 5000,
                headers: { 'User-Agent': 'ShieldDOS-Uptime-Monitor/1.0' }
            });
            latencyMs = Date.now() - startTime;
        } catch (error: any) {
            status = 'down';
            errorMessage = error.message;
            // Differentiate between timeouts and explicit 5xx errors from proxy
            this.logger.warn(`Site Origin Down: ${site.domain} (${targetUrl}) - ${errorMessage}`);
        }

        const log = this.uptimeRepository.create({
            site: { id: site.id },
            targetIp: targetIpStr,
            status,
            latencyMs,
            errorMessage
        });

        await this.uptimeRepository.save(log);
        return status;
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
