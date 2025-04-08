import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/src/users/entities/user.entity';
import { Performance } from '@/src/performances/entities/performance.entity';

@Entity('performance_reservation')
export class PerformanceReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Performance, (performance) => performance.reservations)
  performance: Performance;

  @CreateDateColumn({ name: 'reserved_at' })
  reservedAt: Date;
}
