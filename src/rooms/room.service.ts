import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '@/src/rooms/entities/room.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';
import { Place } from '@/src/places/entities/place.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(RoomReservation)
    private roomReservationRepository: Repository<RoomReservation>,
  ) {}

  async getRoomDetail(roomId: number): Promise<any> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['place'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return {
      imageUrl: room.imageUrl,
      name: room.name,
      description: room.description,
      price: room.price,
      additionDescription: room.additionalDescription,
    };
  }
}
