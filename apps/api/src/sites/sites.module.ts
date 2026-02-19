import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './site.entity';
import { FirewallRule } from './firewall-rule.entity';
import { SitesService } from './sites.service';
import { FirewallRulesService } from './firewall-rules.service';
import { SitesController } from './sites.controller';
import { FirewallRulesController } from './firewall-rules.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Site, FirewallRule])],
    providers: [SitesService, FirewallRulesService],
    controllers: [SitesController, FirewallRulesController],
    exports: [SitesService, FirewallRulesService]
})
export class SitesModule { }
