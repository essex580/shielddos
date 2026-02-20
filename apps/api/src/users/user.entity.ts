
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Site } from '../sites/site.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ default: 'client' }) // 'admin' or 'client'
    role!: string;

    @OneToMany(() => Site, (site) => site.user)
    sites!: Site[];

    @CreateDateColumn()
    createdAt!: Date;
}
