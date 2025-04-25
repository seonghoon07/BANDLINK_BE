import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { User } from '@/src/domain/users/entities/user.entity';

@Entity('room_reservation')
export class RoomReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.roomReservation)
  room: Room;

  @ManyToOne(() => User, (user) => user.reservations)
  reservedBy: User;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: false })
  price: number;
}
