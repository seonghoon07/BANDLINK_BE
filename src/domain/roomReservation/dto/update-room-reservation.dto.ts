import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomReservationDto } from './create-room-reservation.dto';

export class UpdateRoomReservationDto extends PartialType(CreateRoomReservationDto) {}
