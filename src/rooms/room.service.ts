import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '@/src/rooms/entities/room.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';
import { Place } from '@/src/places/entities/place.entity';

interface ReservedTime {
  startTime: number;
  endTime: number;
}

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
      throw new Error('Room not found');
    }

    return {
      imageUrl: room.imageUrl,
      name: room.name,
      description: room.description,
      price: room.price,
      additionDescription: room.additionalDescription,
    };
  }

  private async getReservedTimesForRoom(roomId: number, selectedDate: Date) {
    const reservations = await this.roomReservationRepository.find({
      where: {
        room: { id: roomId },
        startDate: new Date(selectedDate),
        isConfirmed: true,
      },
    });

    return reservations.map((reservation) => ({
      startTime: reservation.startDate.getHours(),
      endTime: reservation.endDate.getHours(),
    }));
  }

  private getAvailableTimes(reservedTimes: ReservedTime[]): number[] {
    const availableTimes: number[] = [];
    const availableSlots: number[] = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23,
    ];

    availableSlots.forEach((slot) => {
      const isReserved = reservedTimes.some(
        (reservation) =>
          reservation.startTime <= slot && reservation.endTime > slot,
      );
      if (!isReserved) {
        availableTimes.push(slot);
      }
    });

    return availableTimes;
  }
}
