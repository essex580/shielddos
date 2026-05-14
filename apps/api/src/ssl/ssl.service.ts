import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../sites/site.entity';
import * as acme from 'acme-client';
import Redis from 'ioredis';

@Injectable()
export class SslService {
    private readonly logger = new Logger(SslService.name);
    private redisClient: Redis;

    constructor(
        @InjectRepository(Site)
        private sitesRepository: Repository<Site>,
    ) {
        this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async issueCertificate(domain: string, user: any): Promise<{ success: boolean, message: string }> {
        const site = await this.sitesRepository.findOne({ where: { domain, user: { id: user.userId } } });
        if (!site) throw new Error('Site not found or access denied');
        
        // Remove wildcard prefix for issuing if needed, though ACME v2 supports wildcards with DNS-01.
        // For HTTP-01, we can only issue for exact domains.
        if (domain.startsWith('*.')) {
            return { success: false, message: 'Wildcard certificates require DNS-01 validation which is not supported in this version. Please use exact domains for Auto-SSL.' };
        }

        try {
            this.logger.log(`Starting ACME certificate issuance for ${domain}`);
            
            // 1. Init client
            const client = new acme.Client({
                directoryUrl: acme.directory.letsencrypt.production,
                accountKey: await acme.crypto.createPrivateKey()
            });

            // 2. Register account
            await client.createAccount({
                termsOfServiceAgreed: true,
                contact: ['mailto:admin@shielddos.local']
            });

            // 3. Create CSR
            const [key, csr] = await acme.crypto.createCsr({
                commonName: domain
            });

            // 4. Issue certificate
            const cert = await client.auto({
                csr,
                email: 'admin@shielddos.local',
                termsOfServiceAgreed: true,
                challengePriority: ['http-01'],
                challengeCreateFn: async (authz, challenge, keyAuthorization) => {
                    this.logger.log(`[ACME] Challenge created for ${domain}: ${challenge.token}`);
                    // Save the token to Redis so the proxy can intercept it at /.well-known/acme-challenge/<token>
                    await this.redisClient.set(`acme:${challenge.token}`, keyAuthorization, 'EX', 600);
                },
                challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
                    this.logger.log(`[ACME] Challenge removed for ${domain}: ${challenge.token}`);
                    await this.redisClient.del(`acme:${challenge.token}`);
                }
            });

            // 5. Save to database
            site.sslCert = cert.toString();
            site.sslKey = key.toString();
            await this.sitesRepository.save(site);

            // 6. Clear proxy cache
            await this.redisClient.del(`shield:ssl:${domain}`);

            this.logger.log(`Successfully issued and installed certificate for ${domain}`);
            return { success: true, message: 'Certificate issued successfully' };

        } catch (e: any) {
            this.logger.error(`Failed to issue certificate for ${domain}: ${e.message}`);
            return { success: false, message: `ACME Error: ${e.message}` };
        }
    }
}
