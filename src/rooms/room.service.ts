import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

    if (!room) throw new NotFoundException('Room not found');

    return {
      imageUrl: room.imageUrl,
      name: room.name,
      description: room.description,
      price: room.price,
      additionDescription: room.additionalDescription,
      businessDays: room.place.businessDays,
    };
  }

  async getUnavailableDates(
    roomId: number,
    year: number,
    month: number,
  ): Promise<string[]> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const unavailableDates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateCopy = new Date(d);
      const dayStart = new Date(dateCopy.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dateCopy.setHours(23, 59, 59, 999));

      const reservations = await this.roomReservationRepository.find({
        where: {
          room: { id: roomId },
          startDate: Between(dayStart, dayEnd),
          isConfirmed: true,
        },
      });

      const reservedHours = new Set<number>();
      for (const res of reservations) {
        const startHour = res.startDate.getHours();
        const endHour = res.endDate.getHours();
        for (let i = startHour; i < endHour; i++) {
          reservedHours.add(i);
        }
      }

      if (reservedHours.size >= 24) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }
    }

    return unavailableDates;
  }
}
