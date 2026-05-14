import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsResolver } from './analytics.resolver';
import { CacheController } from './cache.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Analytics])],
    providers: [AnalyticsService, AnalyticsResolver],
    controllers: [AnalyticsController, CacheController],
    exports: [AnalyticsService]
})
export class AnalyticsModule { }
