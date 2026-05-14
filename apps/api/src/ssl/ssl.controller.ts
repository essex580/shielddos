import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { SslService } from './ssl.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ssl')
@UseGuards(JwtAuthGuard)
export class SslController {
    constructor(private readonly sslService: SslService) {}

    @Post('issue/:domain')
    async issueCertificate(@Request() req: any, @Param('domain') domain: string) {
        return this.sslService.issueCertificate(domain, req.user);
    }
}
