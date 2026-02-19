import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Analytics])],
    providers: [AnalyticsService],
    controllers: [AnalyticsController],
    exports: [AnalyticsService]
})
export class AnalyticsModule { }
