import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '@/src/room/entities/room.entity';
import { User } from '@/src/users/entities/user.entity';

@Entity('room_reservation')
export class RoomReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.roomReservation)
  room: Room;

  @ManyToOne(() => User, (user) => user.reservations)
  band: User;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;
}
