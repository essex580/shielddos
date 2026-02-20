import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { FirewallRule } from './firewall-rule.entity';
import { User } from '../users/user.entity';

@Entity()
export class Site {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    domain: string;

    @Column({ type: 'jsonb', default: [] })
    targetIp: any; // e.g [{ ip: "1.1.1.1", region: "EU" }]

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

    @Column({ type: 'text', nullable: true })
    customErrorPage403: string;

    @Column({ type: 'text', nullable: true })
    customErrorPage404: string;

    @Column({ type: 'text', nullable: true })
    customErrorPage502: string;

    @Column({ type: 'varchar', nullable: true })
    turnstileSiteKey: string;

    @Column({ type: 'varchar', nullable: true })
    turnstileSecretKey: string;

    // --- PHASE 7 ENTERPRISE FEATURES ---

    @Column({ default: false })
    graphqlInspectionEnabled: boolean; // Analyzes AST Depth

    @Column({ default: false })
    autoWafEnabled: boolean; // ML Traffic Shaping

    @Column({ default: false })
    waitingRoomEnabled: boolean; // Virtual Queue System

    @Column({ type: 'int', default: 500 })
    waitingRoomThreshold: number; // Max connections before queuing

    @Column({ default: false })
    autoSslEnabled: boolean; // ACME HTTP-01 Let's Encrypt

    @Column({ type: 'text', nullable: true })
    sslCert: string;

    @Column({ type: 'text', nullable: true })
    sslKey: string;

    // --- PHASE 9 ENTERPRISE FEATURES ---

    @Column({ type: 'jsonb', default: [] })
    protectedRoutes: any; // e.g., ['/admin', '/api/private']

    @OneToMany(() => FirewallRule, (rule) => rule.site)
    firewallRules: FirewallRule[];

    @ManyToOne(() => User, (user) => user.sites, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
