import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '@/src/places/entities/place.entity';
import { Performance } from '@/src/performances/entities/performance.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column()
  price: number;

  @Column()
  place_id: number;

  @Column()
  performance_id: number;

  @ManyToOne(() => Place, (place) => place.rooms)
  place: Place;

  @OneToMany(() => Performance, (performance) => performance.room)
  performances: Performance[];
}
