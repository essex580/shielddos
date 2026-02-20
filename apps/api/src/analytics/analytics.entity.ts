import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Analytics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    siteId: string;

    @Column({ nullable: true })
    userId: string;

    @Column()
    path: string;

    @Column()
    method: string;

    @Column()
    ipAddress: string;

    @Column()
    statusCode: number;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    country: string;

    @Column({ default: false })
    blocked: boolean;

    @CreateDateColumn()
    timestamp: Date;
}
