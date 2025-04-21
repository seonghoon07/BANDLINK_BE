import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/src/users/entities/user.entity';
import { Room } from '@/src/rooms/entities/room.entity';
import { PerformanceReservation } from '@/src/performanceReservation/entities/performanceReservation.entity';

@Entity('performances')
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.performance)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Room, (room) => room.performances)
  room: Room;

  @OneToMany(
    () => PerformanceReservation,
    (reservation) => reservation.performance,
  )
  reservations: PerformanceReservation[];
}
