import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '@/src/domain/places/entities/place.entity';
import { Performance } from '@/src/domain/performances/entities/performance.entity';
import { PerformanceReservation } from '@/src/domain/performanceReservation/entities/performanceReservation.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  googleUid: string;

  @Column()
  nickname: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ nullable: true })
  bandname: string;

  @Column({ type: 'enum', enum: ['FAN', 'BAND', 'PLACE_OWNER'], array: true })
  roles: ('FAN' | 'BAND' | 'PLACE_OWNER')[];

  @OneToOne(() => Place, (place) => place.user)
  place: Place;

  @OneToMany(() => Performance, (performance) => performance.user)
  performance: Performance;

  @OneToMany(() => PerformanceReservation, (reservation) => reservation.user)
  reservations: PerformanceReservation[];

  @OneToMany(() => RoomReservation, (reservation) => reservation.reservedBy)
  roomReservations: RoomReservation[];
}
