import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('explain-threat')
    @UseGuards(AuthGuard('jwt'))
    async explainThreat(@Body() logData: any): Promise<{ explanation: string }> {
        if (!logData || !logData.ip) {
            throw new HttpException('Invalid Threat Log Payload', HttpStatus.BAD_REQUEST);
        }

        const explanation = await this.aiService.explainThreat(logData);
        return { explanation };
    }

    @Post('query-logs')
    @UseGuards(AuthGuard('jwt'))
    async queryLogs(@Body() payload: { prompt: string }): Promise<any> {
        // Future iteration: AI parsing Natural Language to SQL
        return {
            message: "Natural Language SQL compilation is currently under construction.",
            filters: []
        };
    }
}
