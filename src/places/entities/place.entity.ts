import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/src/users/entities/user.entity';
import { Room } from '@/src/room/entities/room.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 100 })
  address: string;

  @Column({ length: 5 })
  type: string;

  @Column({ length: 100, name: 'business_registration_number' })
  businessRegistrationNumber: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.places)
  user: User;

  @OneToMany(() => Room, (room) => room.place)
  rooms: Room[];
}
