import { Injectable } from '@nestjs/common';
import { CreateRoomReservationDto } from './dto/create-room-reservation.dto';
import { UpdateRoomReservationDto } from './dto/update-room-reservation.dto';

@Injectable()
export class RoomReservationService {
  create(createRoomReservationDto: CreateRoomReservationDto) {
    return 'This action adds a new roomReservation';
  }

  findAll() {
    return `This action returns all roomReservation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roomReservation`;
  }

  update(id: number, updateRoomReservationDto: UpdateRoomReservationDto) {
    return `This action updates a #${id} roomReservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} roomReservation`;
  }
}
