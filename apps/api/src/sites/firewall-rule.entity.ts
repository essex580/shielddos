
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Site } from '../sites/site.entity';

export enum RuleType {
    BLOCK_IP = 'BLOCK_IP',
    BLOCK_COUNTRY = 'BLOCK_COUNTRY',
    RATE_LIMIT = 'RATE_LIMIT',
    ALLOW_IP = 'ALLOW_IP',
    CHALLENGE = 'CHALLENGE', // JS Challenge / Captcha
    CUSTOM_RULE = 'CUSTOM_RULE' // JSON based advanced rule
}

@Entity()
export class FirewallRule {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'enum',
        enum: RuleType,
        default: RuleType.BLOCK_IP
    })
    type!: RuleType;

    @Column()
    value!: string; // IP, Country Code, etc.

    @Column({ nullable: true })
    description?: string;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ default: 0 })
    hits!: number;

    @ManyToOne(() => Site, (site) => site.firewallRules, { onDelete: 'CASCADE' })
    site!: Site;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
