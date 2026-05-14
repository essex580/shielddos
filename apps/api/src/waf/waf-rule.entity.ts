import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('waf_rules')
export class WafRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    field: string; // 'ip', 'country', 'path', 'user_agent', 'method'

    @Column()
    operator: string; // 'equals', 'contains', 'in', 'not_equals'

    @Column()
    value: string;

    @Column()
    action: string; // 'block', 'challenge', 'bypass'

    @Column({ default: 0 })
    priority: number;

    @Column({ default: true })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
