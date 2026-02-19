import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';
import { AuthGuard } from '@nestjs/passport';
import { EventsGateway } from '../events/events.gateway';

@Controller('analytics')
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    @Post()
    async logRequest(@Body() data: Partial<Analytics>): Promise<Analytics> {
        const result = await this.analyticsService.logRequest(data);
        this.eventsGateway.emitNewTraffic(result);
        return result;
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
