import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Request } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Site } from './site.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('sites')
@UseGuards(AuthGuard('jwt'))
export class SitesController {
    constructor(private readonly sitesService: SitesService) { }

    @Get()
    findAll(@Request() req: any): Promise<Site[]> {
        return this.sitesService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string): Promise<Site | null> {
        return this.sitesService.findOne(id, req.user);
    }

    @Post()
    create(@Request() req: any, @Body() site: Partial<Site>): Promise<Site> {
        return this.sitesService.create(req.user, site);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string): Promise<void> {
        return this.sitesService.remove(id, req.user);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() site: Partial<Site>): Promise<Site> {
        return this.sitesService.update(id, site, req.user);
    }

    @Post(':id/verify')
    verify(@Request() req: any, @Param('id') id: string): Promise<{ resolvedIp: string; isConfigured: boolean }> {
        return this.sitesService.verify(id, req.user);
    }

    @Post(':id/purge-cache')
    purgeCache(@Request() req: any, @Param('id') id: string): Promise<{ success: boolean; cleared: number }> {
        return this.sitesService.purgeCache(id, req.user);
    }
}
