import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FirewallRule } from '../sites/firewall-rule.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FirewallRule]), AnalyticsModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule { }
