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

    // Phase 8: SIEM Aggregation Endpoints
    async getAdvancedLogs(user: any, query: any): Promise<any[]> {
        const { limit = 50, offset = 0, ipAddress, country, type } = query;
        let qb = this.analyticsRepository.createQueryBuilder('a')
            .leftJoin('site', 's', 'CAST(s.id AS VARCHAR) = a."siteId"')
            .select(['a.*', 's.domain as domain']);

        if (user.role !== 'admin') {
            qb = qb.where('a."userId" = :userId', { userId: user.userId });
        } else {
            qb = qb.where('1=1');
        }

        if (ipAddress) qb = qb.andWhere('a."ipAddress" = :ipAddress', { ipAddress });
        if (country) qb = qb.andWhere('a.country = :country', { country });
        if (type === 'WAF') qb = qb.andWhere('a.blocked = true AND a.statusCode = 403');
        if (type === 'RATE_LIMIT') qb = qb.andWhere('a.blocked = true AND a.statusCode = 429');

        qb = qb.orderBy('a.timestamp', 'DESC').limit(limit).offset(offset);
        return qb.getRawMany();
    }

    async getCountryAggregation(user: any): Promise<any[]> {
        let qb = this.analyticsRepository.createQueryBuilder('a')
            .select('a.country', 'country')
            .addSelect('COUNT(*)', 'count')
            .where('a.blocked = true');

        if (user.role !== 'admin') {
            qb = qb.andWhere('a."userId" = :userId', { userId: user.userId });
        }

        qb = qb.groupBy('a.country').orderBy('count', 'DESC').limit(50);
        return qb.getRawMany();
    }

    async getTopIPs(user: any): Promise<any[]> {
        let qb = this.analyticsRepository.createQueryBuilder('a')
            .select('a."ipAddress"', 'ipAddress')
            .addSelect('COUNT(*)', 'count')
            .where('a.blocked = true');

        if (user.role !== 'admin') {
            qb = qb.andWhere('a."userId" = :userId', { userId: user.userId });
        }

        qb = qb.groupBy('a."ipAddress"').orderBy('count', 'DESC').limit(10);
        return qb.getRawMany();
    }
}
