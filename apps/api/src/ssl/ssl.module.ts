import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../sites/site.entity';
import { SslService } from './ssl.service';
import { SslController } from './ssl.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Site])],
    providers: [SslService],
    controllers: [SslController],
    exports: [SslService]
})
export class SslModule {}
