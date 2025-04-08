import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomReservationService } from './roomReservation.service';
import { CreateRoomReservationDto } from './dto/create-room-reservation.dto';
import { UpdateRoomReservationDto } from './dto/update-room-reservation.dto';

@Controller('roomReservation')
export class RoomReservationController {
  constructor(private readonly roomReservationService: RoomReservationService) {}

  @Post()
  create(@Body() createRoomReservationDto: CreateRoomReservationDto) {
    return this.roomReservationService.create(createRoomReservationDto);
  }

  @Get()
  findAll() {
    return this.roomReservationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomReservationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomReservationDto: UpdateRoomReservationDto) {
    return this.roomReservationService.update(+id, updateRoomReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomReservationService.remove(+id);
  }
}
