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

    async getTrafficChartData(): Promise<any[]> {
        // Aggregate by minute for last hour
        const result = await this.analyticsRepository.query(`
            SELECT 
                to_char(timestamp, 'HH24:MI') as time,
                COUNT(*) as count,
                SUM(CASE WHEN blocked = true THEN 1 ELSE 0 END) as blocked
            FROM analytics
            WHERE timestamp > NOW() - INTERVAL '1 hour'
            GROUP BY to_char(timestamp, 'HH24:MI')
            ORDER BY min(timestamp) ASC
        `);
        return result;
    }
}
