
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ username });
    }

    async create(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }

    async count(): Promise<number> {
        return this.usersRepository.count();
    }
}
