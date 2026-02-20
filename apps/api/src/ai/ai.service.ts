import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
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
}
