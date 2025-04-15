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

  @Column({ length: 255, nullable: true })
  introdution: string;

  @Column()
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @ManyToOne(() => Place, (place) => place.rooms)
  place: Place;

  @OneToMany(() => RoomReservation, (reservation) => reservation.room)
  roomReservation: RoomReservation[];

  @OneToOne(() => Performance, (performance) => performance.room, {
    nullable: true,
  })
  performances: Performance[];
}
