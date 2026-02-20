
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Helper: Seed admin user if none exists
    async onModuleInit() {
        const count = await this.usersService.count();
        if (count === 0) {
            this.logger.log('No users found. Seeding default admin user...');
            const admin = new User();
            admin.username = 'admin';
            admin.role = 'admin';
            // Hash "admin" password
            admin.password = await bcrypt.hash('admin', 10);
            await this.usersService.create(admin);
            this.logger.log('Default admin user created: admin / admin');
        }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                username: user.username,
                id: user.id,
                role: user.role
            }
        };
    }
}
