import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WafService } from './waf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('waf')
@UseGuards(JwtAuthGuard)
export class WafController {
    constructor(private readonly wafService: WafService) {}

    @Get('rules')
    getRules() {
        return this.wafService.findAll();
    }

    @Post('rules')
    createRule(@Body() data: any) {
        return this.wafService.create(data);
    }

    @Put('rules/:id')
    updateRule(@Param('id') id: string, @Body() data: any) {
        return this.wafService.update(id, data);
    }

    @Delete('rules/:id')
    deleteRule(@Param('id') id: string) {
        return this.wafService.remove(id);
    }

    @Get('status')
    async getStatus() {
        return { securityLevel: await this.wafService.getSecurityLevel() };
    }

    @Post('status')
    async setStatus(@Body() body: { securityLevel: string }) {
        const isUnderAttack = body.securityLevel === 'under_attack';
        await this.wafService.toggleUnderAttackMode(isUnderAttack);
        return { success: true, securityLevel: body.securityLevel };
    }
}
