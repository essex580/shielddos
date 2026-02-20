import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UptimeService } from './uptime.service';
import { UptimeController } from './uptime.controller';
import { Uptime } from './uptime.entity';
import { Site } from '../sites/site.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Uptime, Site])],
    providers: [UptimeService],
    controllers: [UptimeController],
    exports: [UptimeService]
})
export class UptimeModule { }
