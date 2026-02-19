import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './analytics.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Analytics)
        private analyticsRepository: Repository<Analytics>,
    ) { }

    logRequest(data: Partial<Analytics>): Promise<Analytics> {
        const log = this.analyticsRepository.create(data);
        return this.analyticsRepository.save(log);
    }

    getStats(siteId: string): Promise<Analytics[]> {
        return this.analyticsRepository.find({
            where: { siteId },
            order: { timestamp: 'DESC' },
            take: 100
        });
    }

    getAllStats(): Promise<Analytics[]> {
        return this.analyticsRepository.find({
            order: { timestamp: 'DESC' },
            take: 100
        });
    }
}
