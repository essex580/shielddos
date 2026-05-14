
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ session: false }),
        JwtModule.register({
            secret: 'secretKey', // TODO: Move to .env
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }

