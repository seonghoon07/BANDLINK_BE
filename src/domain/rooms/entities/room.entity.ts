import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '@/src/domain/places/entities/place.entity';
import { Performance } from '@/src/domain/performances/entities/performance.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  additionalDescription: string;

  @Column()
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @ManyToOne(() => Place, (place) => place.rooms)
  place: Place;

  @OneToMany(() => RoomReservation, (reservation) => reservation.room)
  roomReservation: RoomReservation[];

  @OneToMany(() => Performance, (performance) => performance.room)
  performances: Performance[];
}
