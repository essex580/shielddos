import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FirewallRule } from './firewall-rule.entity';

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

    @Column({ default: false })
    botProtection: boolean; // Enable User-Agent filtering

    @Column({ default: 'lenient' }) // 'lenient', 'normal', 'strict', 'under_attack'
    securityLevel: string;

    @Column({ default: false })
    wafEnabled: boolean;

    @Column({ type: 'int', default: 200 })
    rateLimit: number; // requests per minute

    @OneToMany(() => FirewallRule, (rule) => rule.site)
    firewallRules: FirewallRule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
