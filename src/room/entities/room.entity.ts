import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '@/src/places/entities/place.entity';
import { Performance } from '@/src/performances/entities/performance.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column()
  price: number;

  @ManyToOne(() => Place, (place) => place.rooms)
  place: Place;

  @OneToMany(() => RoomReservation, (reservation) => reservation.room)
  roomReservation: RoomReservation[];

  @OneToOne(() => Performance, (performance) => performance.room, {
    nullable: true,
  })
  performances: Performance[];
}
