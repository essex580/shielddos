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

    getStats(siteId: string, user: any): Promise<Analytics[]> {
        if (user.role === 'admin') {
            return this.analyticsRepository.find({ where: { siteId }, order: { timestamp: 'DESC' }, take: 100 });
        }
        return this.analyticsRepository.find({
            where: { siteId, userId: user.userId },
            order: { timestamp: 'DESC' },
            take: 100
        });
    }

    getAllStats(user: any): Promise<Analytics[]> {
        if (user.role === 'admin') {
            return this.analyticsRepository.find({ order: { timestamp: 'DESC' }, take: 100 });
        }
        return this.analyticsRepository.find({
            where: { userId: user.userId },
            order: { timestamp: 'DESC' },
            take: 100
        });
    }

    async getTrafficChartData(user: any): Promise<any[]> {
        if (user.role === 'admin') {
            return this.analyticsRepository.query(`
                SELECT 
                    to_char(timestamp, 'HH24:MI') as time,
                    COUNT(*) as count,
                    SUM(CASE WHEN blocked = true THEN 1 ELSE 0 END) as blocked
                FROM analytics
                WHERE timestamp > NOW() - INTERVAL '1 hour'
                GROUP BY to_char(timestamp, 'HH24:MI')
                ORDER BY min(timestamp) ASC
            `);
        } else {
            return this.analyticsRepository.query(`
                SELECT 
                    to_char(timestamp, 'HH24:MI') as time,
                    COUNT(*) as count,
                    SUM(CASE WHEN blocked = true THEN 1 ELSE 0 END) as blocked
                FROM analytics
                WHERE timestamp > NOW() - INTERVAL '1 hour'
                AND "userId" = $1
                GROUP BY to_char(timestamp, 'HH24:MI')
                ORDER BY min(timestamp) ASC
            `, [user.userId]);
        }
    }
}
