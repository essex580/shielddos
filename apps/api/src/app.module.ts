import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './sites/site.entity';
import { FirewallRule } from './sites/firewall-rule.entity';
import { SitesModule } from './sites/sites.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Analytics } from './analytics/analytics.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { EventsModule } from './events/events.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UptimeModule } from './uptime/uptime.module';
import { Uptime } from './uptime/uptime.entity';
import { AiModule } from './ai/ai.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WafModule } from './waf/waf.module';
import { WafRule } from './waf/waf-rule.entity';
import { SslModule } from './ssl/ssl.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: true, // Enable GraphQL Playground IDE
            csrfPrevention: false, // Ease of use for Edge analytics testing
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://shield_user:shield_password@localhost:5432/shield_db',
            entities: [Site, Analytics, User, FirewallRule, Uptime, WafRule],
            synchronize: true, // Auto-create tables (dev only)
        }),
        SitesModule,
        AnalyticsModule,
        AuthModule,
        UsersModule,
        EventsModule,
        UptimeModule,
        AiModule,
        WafModule,
        SslModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
