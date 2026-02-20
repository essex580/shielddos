
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FirewallRulesService } from './firewall-rules.service';
import { FirewallRule } from './firewall-rule.entity';

@Controller('sites/:siteId/rules')
@UseGuards(AuthGuard('jwt'))
export class FirewallRulesController {
    constructor(private readonly rulesService: FirewallRulesService) { }

    @Post()
    create(@Request() req: any, @Param('siteId') siteId: string, @Body() rule: Partial<FirewallRule>) {
        return this.rulesService.create(siteId, rule, req.user);
    }

    @Get()
    findAll(@Request() req: any, @Param('siteId') siteId: string) {
        return this.rulesService.findAll(siteId, req.user);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.rulesService.remove(id, req.user);
    }
}
