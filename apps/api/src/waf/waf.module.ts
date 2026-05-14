import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WafRule } from './waf-rule.entity';
import { WafService } from './waf.service';
import { WafController } from './waf.controller';

@Module({
    imports: [TypeOrmModule.forFeature([WafRule])],
    providers: [WafService],
    controllers: [WafController],
    exports: [WafService]
})
export class WafModule {}
