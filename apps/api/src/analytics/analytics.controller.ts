import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post()
    logRequest(@Body() data: Partial<Analytics>): Promise<Analytics> {
        return this.analyticsService.logRequest(data);
    }

    @Get(':siteId')
    getStats(@Param('siteId') siteId: string): Promise<Analytics[]> {
        return this.analyticsService.getStats(siteId);
    }

    @Get()
    getAllStats(): Promise<Analytics[]> {
        return this.analyticsService.getAllStats();
    }
}
