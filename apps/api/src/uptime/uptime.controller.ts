import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UptimeService } from './uptime.service';

@Controller('uptime')
@UseGuards(JwtAuthGuard)
export class UptimeController {
    constructor(private readonly uptimeService: UptimeService) { }

    @Get('sites/:id')
    getUptimeStats(@Request() req: any, @Param('id') siteId: string) {
        return this.uptimeService.getUptimeStats(siteId, req.user);
    }
}
