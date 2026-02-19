import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './sites/site.entity';
import { SitesModule } from './sites/sites.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Analytics } from './analytics/analytics.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'postgres',
            port: 5432,
            username: process.env.DB_USER || 'shield_user',
            password: process.env.DB_PASSWORD || 'shield_password',
            database: process.env.DB_NAME || 'shield_db',
            entities: [Site, Analytics, User],
            synchronize: true, // Auto-create tables (dev only)
        }),
        SitesModule,
        AnalyticsModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
