import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/src/users/entities/user.entity';

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

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.performance)
  user: User;
}
