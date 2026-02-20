import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from '../analytics/analytics.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallRule, RuleType } from '../sites/firewall-rule.entity';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(
        private readonly analyticsService: AnalyticsService,
        @InjectRepository(FirewallRule)
        private firewallRepository: Repository<FirewallRule>
    ) {
        // Requires GEMINI_API_KEY in the environment or .env file of the NestJS container
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            // Defaulting to gemini-2.5-flash for blazing fast forensic analysis
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            this.logger.log("Google Generative AI Service initialized successfully.");
        } else {
            this.logger.warn("GEMINI_API_KEY is missing. AI modules will throw placeholder text.");
        }
    }

    async explainThreat(logData: any): Promise<string> {
        if (!this.model) {
            return "🛡️ **AI Engine Offline:** \n\nCannot perform threat forensics. Please configure `GEMINI_API_KEY` in the ShieldDOS API environment variables.";
        }

        const prompt = `
You are ShieldDOS-AI, an expert Cybersecurity Analyst working within a cutting-edge Enterprise Layer 7 Firewall. 
An attack was recently neutralized at the Edge Proxy. Your job is to analyze the raw telemetry data below and explain to the server administrator what the attacker was trying to achieve. 

**Raw Forensic Telemetry:**
- **Attacker IP:** ${logData.ip}
- **Target Domain:** ${logData.siteId}
- **HTTP Method:** ${logData.method}
- **Request URI:** ${logData.path}
- **Block Reason / Rule:** ${logData.blocked ? 'WAF/Bot Engine (Status ' + logData.status + ')' : 'Not Blocked - Monitored'}
- **Timestamp:** ${logData.timestamp}
- **Country:** ${logData.country || 'Unknown'}

**Your Instructions:**
Write a concise, professional, and actionable forensic report (max 2-3 short paragraphs). Use Markdown formatting. 
1. Explain the probable intent of this attack vector based on the URI/Method. (e.g., Are they looking for vulnerability scanning? SQL Injection? Path traversal? DDoS?)
2. State why ShieldDOS blocking this request saved their infrastructure.
3. Keep the tone clinical, expert, and highly deterministic.
`;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            this.logger.error("AI Generation Failed: " + error.message);
            return "⚠️ **AI Engine Fault:** Could not analyze the threat vector due to an upstream API error.";
        }
    }

    // Phase 9: AI Auto-Mitigation Engine
    @Cron('0 */5 * * * *') // Run every 5 minutes
    async autonomousThreatHunting() {
        this.logger.log("🤖 Initiating AI Autonomous Threat Hunting Sweep...");

        if (!this.model) {
            this.logger.warn("AI Engine offline. Skipping autonomous mitigation.");
            return;
        }

        try {
            // Aggregate Top IPs globally (simulating an admin user query)
            const topIps = await this.analyticsService.getTopIPs({ role: 'admin' });
            if (!topIps || topIps.length === 0) return;

            // We only care about IPs attacking heavily
            const maliciousCandidates = topIps.filter(ip => Number(ip.count) > 50);
            if (maliciousCandidates.length === 0) return;

            const prompt = `
You are ShieldDOS Auto-Mitigation AI. Look at this list of IPs that hit the WAF heavily in the last interval:
${JSON.stringify(maliciousCandidates, null, 2)}

If you determine these IPs belong to a coordinated botnet or aggressive scanner, reply with a strict JSON array of objects containing the IP and a reason. If none are severe enough, return an empty array [].
Respond ONLY with valid JSON.
Format:
[
  { "ipAddress": "1.2.3.4", "reason": "Consistent high-velocity WAF blocking indicative of a dictionary attack." }
]
`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text().replace(/`|json/g, '').trim();
            const decisions = JSON.parse(responseText);

            for (const decision of decisions) {
                // Check if already banned
                const existing = await this.firewallRepository.findOne({ where: { value: decision.ipAddress, type: RuleType.BLOCK_IP } });

                if (!existing) {
                    this.logger.warn(`🚨 AI Mitigation Engaged! Banning IP: ${decision.ipAddress}. Reason: ${decision.reason}`);

                    // We assign it globally (siteId null means global, or we can just pick the first site for demo)
                    // In a true Phase 9 environment, we'd add an "isGlobal" flag or emit to Redis PUB/SUB.
                    // For now, attaching to a universally un-routable UUID or finding the first site.
                    // Instead of failing TypeORM constraints on 'site', we grab the first site to attach the rule to.
                    const firstSite = await this.firewallRepository.manager.query('SELECT id FROM site LIMIT 1');

                    if (firstSite.length > 0) {
                        const newRule = this.firewallRepository.create({
                            site: { id: firstSite[0].id },
                            value: decision.ipAddress,
                            type: RuleType.BLOCK_IP,
                            description: `[AI AUTO-BAN] ${decision.reason}`
                        });

                        await this.firewallRepository.save(newRule);
                        // TODO: Emit to Redis mesh `shield:ban` channel for instantaneous 0-ms edge dropping.
                    }
                }
            }
        } catch (error: any) {
            this.logger.error("Auto-Mitigation Engine encountered an error: " + error.message);
        }
    }
}
