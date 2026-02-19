import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './site.entity';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Site])],
    providers: [SitesService],
    controllers: [SitesController],
    exports: [SitesService]
})
export class SitesModule { }
