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

    @Column({ default: 'lenient' }) // 'lenient', 'normal', 'strict', 'under_attack'
    securityLevel: string;

    @OneToMany(() => FirewallRule, (rule) => rule.site)
    firewallRules: FirewallRule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
