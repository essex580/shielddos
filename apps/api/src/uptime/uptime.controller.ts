import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UptimeService } from './uptime.service';

@Controller('uptime')
@UseGuards(AuthGuard('jwt'))
export class UptimeController {
    constructor(private readonly uptimeService: UptimeService) { }

    @Get('sites/:id')
    getUptimeStats(@Request() req: any, @Param('id') siteId: string) {
        return this.uptimeService.getUptimeStats(siteId, req.user);
    }
}
