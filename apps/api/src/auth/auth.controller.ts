
import { Controller, Post, Request, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('login')
    async login(@Body() req: any) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() req: any) {
        if (!req.username || !req.password) throw new BadRequestException('Missing credentials');
        const exists = await this.usersService.findOne(req.username);
        if (exists) throw new BadRequestException('User already exists');

        const user = new User();
        user.username = req.username;
        user.password = await bcrypt.hash(req.password, 10);
        user.role = 'client'; // explicit role default

        await this.usersService.create(user);
        return this.authService.login(user); // Auto-login after register
    }
}
