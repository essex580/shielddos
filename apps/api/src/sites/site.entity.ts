import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Site {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    domain: string;

    @Column()
    targetIp: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 'lenient' }) // 'lenient', 'normal', 'strict', 'under_attack'
    securityLevel: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
