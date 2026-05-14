import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
    @UseGuards(JwtAuthGuard)
    getTrafficChart(@Request() req: any): Promise<any[]> {
        return this.analyticsService.getTrafficChartData(req.user);
    }

    @Get('bandwidth')
    @UseGuards(JwtAuthGuard)
    getBandwidth(@Request() req: any): Promise<any[]> {
        return this.analyticsService.getBandwidthStats(req.user);
    }

    @Get(':siteId')
    @UseGuards(JwtAuthGuard)
    getStats(@Request() req: any, @Param('siteId') siteId: string): Promise<Analytics[]> {
        return this.analyticsService.getStats(siteId, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAllStats(@Request() req: any): Promise<Analytics[]> {
        return this.analyticsService.getAllStats(req.user);
    }

    // Phase 8: SIEM Aggregation Endpoints
    @Get('logs/advanced')
    @UseGuards(JwtAuthGuard)
    getAdvancedLogs(@Request() req: any, @Body() body: any): Promise<any[]> {
        // GET requests usually take params from query string, but we can accept query params via req.query
        return this.analyticsService.getAdvancedLogs(req.user, req.query);
    }

    @Get('aggregation/countries')
    @UseGuards(JwtAuthGuard)
    getCountryAggregation(@Request() req: any): Promise<any[]> {
        return this.analyticsService.getCountryAggregation(req.user);
    }

    @Get('aggregation/top-ips')
    @UseGuards(JwtAuthGuard)
    getTopIPs(@Request() req: any): Promise<any[]> {
        return this.analyticsService.getTopIPs(req.user);
    }
}
