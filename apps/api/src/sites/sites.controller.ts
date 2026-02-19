import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Site } from './site.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('sites')
@UseGuards(AuthGuard('jwt'))
export class SitesController {
    constructor(private readonly sitesService: SitesService) { }

    @Get()
    findAll(): Promise<Site[]> {
        return this.sitesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Site | null> {
        return this.sitesService.findOne(id);
    }

    @Post()
    create(@Body() site: Partial<Site>): Promise<Site> {
        return this.sitesService.create(site);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.sitesService.remove(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() site: Partial<Site>): Promise<Site> {
        return this.sitesService.update(id, site);
    }

    @Post(':id/verify')
    verify(@Param('id') id: string): Promise<{ resolvedIp: string; isConfigured: boolean }> {
        return this.sitesService.verify(id);
    }
}
