import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post()
    logRequest(@Body() data: Partial<Analytics>): Promise<Analytics> {
        return this.analyticsService.logRequest(data);
    }

    @Get(':siteId')
    @UseGuards(AuthGuard('jwt'))
    getStats(@Param('siteId') siteId: string): Promise<Analytics[]> {
        return this.analyticsService.getStats(siteId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    getAllStats(): Promise<Analytics[]> {
        return this.analyticsService.getAllStats();
    }
}
