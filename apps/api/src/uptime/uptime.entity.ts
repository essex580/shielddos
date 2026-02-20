import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Site } from '../sites/site.entity';

@Entity()
export class Uptime {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Site, { onDelete: 'CASCADE' })
    site: Site;

    @Column()
    targetIp: string;

    @Column()
    status: 'up' | 'down';

    @Column({ type: 'int', nullable: true })
    latencyMs: number;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @CreateDateColumn()
    timestamp: Date;
}
