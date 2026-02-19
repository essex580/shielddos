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

    findAll(): Promise<Site[]> {
        return this.sitesRepository.find();
    }

    findOne(id: string): Promise<Site | null> {
        return this.sitesRepository.findOneBy({ id });
    }

    create(site: Partial<Site>): Promise<Site> {
        const newSite = this.sitesRepository.create(site);
        return this.sitesRepository.save(newSite);
    }

    async remove(id: string): Promise<void> {
        await this.sitesRepository.delete(id);
    }

    async update(id: string, site: Partial<Site>): Promise<Site> {
        await this.sitesRepository.update(id, site);
        return this.findOne(id) as Promise<Site>;
    }

    async verify(id: string): Promise<{ resolvedIp: string; isConfigured: boolean }> {
        const site = await this.findOne(id);
        if (!site) throw new Error('Site not found');

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
