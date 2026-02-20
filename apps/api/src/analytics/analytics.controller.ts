import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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

    @Get('chart')
    @UseGuards(AuthGuard('jwt'))
    getTrafficChart(@Request() req: any): Promise<any[]> {
        return this.analyticsService.getTrafficChartData(req.user);
    }

    @Get(':siteId')
    @UseGuards(AuthGuard('jwt'))
    getStats(@Request() req: any, @Param('siteId') siteId: string): Promise<Analytics[]> {
        return this.analyticsService.getStats(siteId, req.user);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    getAllStats(@Request() req: any): Promise<Analytics[]> {
        return this.analyticsService.getAllStats(req.user);
    }
}
