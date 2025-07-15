import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { Room } from '@/src/domain/rooms/entities/room.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 100 })
  address: string;

  @Column('simple-json')
  type: string[];

  @Column({ length: 100, name: 'businessRegistrationNumber' })
  businessRegistrationNumber: string;

  @Column({ default: false })
  isRecommended: boolean;

  @Column('simple-json', { nullable: true })
  businessDays: string[];

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @ManyToOne(() => User, (user) => user.place, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Room, (room) => room.place)
  rooms: Room[];
}
