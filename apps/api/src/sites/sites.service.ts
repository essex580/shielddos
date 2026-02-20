import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './site.entity';
import * as dns from 'dns';
import { promisify } from 'util';
import axios from 'axios';

const resolve4 = promisify(dns.resolve4);

@Injectable()
export class SitesService {
    constructor(
        @InjectRepository(Site)
        private sitesRepository: Repository<Site>,
    ) { }

    findAll(user: any): Promise<Site[]> {
        if (user.role === 'admin') return this.sitesRepository.find();
        return this.sitesRepository.find({ where: { user: { id: user.userId } } });
    }

    findOne(id: string, user: any): Promise<Site | null> {
        if (user.role === 'admin') return this.sitesRepository.findOneBy({ id });
        return this.sitesRepository.findOne({ where: { id, user: { id: user.userId } } });
    }

    create(user: any, site: Partial<Site>): Promise<Site> {
        const newSite = this.sitesRepository.create(site);
        newSite.user = { id: user.userId } as any;
        return this.sitesRepository.save(newSite);
    }

    async remove(id: string, user: any): Promise<void> {
        const site = await this.findOne(id, user);
        if (site) await this.sitesRepository.delete(id);
    }

    async update(id: string, siteUpdate: Partial<Site>, user: any): Promise<Site> {
        const site = await this.findOne(id, user);
        if (!site) throw new Error('Site not found or access denied');
        await this.sitesRepository.update(id, siteUpdate);
        return this.findOne(id, user) as Promise<Site>;
    }

    async verify(id: string, user: any): Promise<{ resolvedIp: string; isConfigured: boolean }> {
        const site = await this.findOne(id, user);
        if (!site) throw new Error('Site not found or access denied');

        try {
            const ips = await resolve4(site.domain);
            const resolvedIp = ips[0];

            let publicIp = process.env.PUBLIC_IP;
            if (!publicIp) {
                try {
                    const ipRes = await axios.get('https://api.ipify.org?format=json');
                    publicIp = ipRes.data.ip;
                } catch (e) {
                    publicIp = null;
                }
            }

            // Check if resolved IP maps to our public IP, explicitly configured env IP, or local fallback
            const isConfigured = !!resolvedIp && (resolvedIp === publicIp || resolvedIp === '127.0.0.1');

            return {
                resolvedIp,
                isConfigured
            };
        } catch (e) {
            return {
                resolvedIp: 'NOT_RESOLVED',
                isConfigured: false
            };
        }
    }
}
