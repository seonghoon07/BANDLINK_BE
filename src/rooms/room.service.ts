import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Room } from '@/src/rooms/entities/room.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';
import { Place } from '@/src/places/entities/place.entity';
import { User } from '@/src/users/entities/user.entity';
import { ReserveRoomRequestDto } from '@/src/rooms/dto/reserveRoomRequest.dto';

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
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const unavailableDates: string[] = [];

    for (
      let time = new Date(start);
      time <= end;
      time.setDate(time.getDate() + 1)
    ) {
      const d = new Date(time);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const reservations = await this.roomReservationRepository.find({
        where: {
          room: { id: roomId },
          startDate: Between(dayStart, dayEnd),
        },
      });

      const reservedHours = new Set<number>();
      for (const res of reservations) {
        const startHour = res.startDate.getHours();
        const endHour = res.endDate.getHours();
        const actualEnd = endHour === 0 ? 24 : endHour;

        for (let i = startHour; i < actualEnd; i++) {
          reservedHours.add(i);
        }
      }

      if (reservedHours.size >= 24) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }
    }

    return unavailableDates;
  }

  async reserveRoom(dto: ReserveRoomRequestDto): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: dto.roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    const user = await this.placeRepository.manager
      .getRepository(User)
      .findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const overlapping = await this.roomReservationRepository.findOne({
      where: [
        {
          room: { id: dto.roomId },
          startDate: Between(dto.startDate, dto.endDate),
        },
        {
          room: { id: dto.roomId },
          endDate: Between(dto.startDate, dto.endDate),
        },
      ],
    });

    if (overlapping) {
      throw new BadRequestException('The selected time is already reserved.');
    }

    const reservation = this.roomReservationRepository.create({
      room,
      reservedBy: user,
      startDate: dto.startDate,
      endDate: dto.endDate,
      price: dto.price,
    });

    await this.roomReservationRepository.save(reservation);
  }

  async getUnavailableHours(
    roomId: number,
    date: string,
  ): Promise<{ am: number[]; pm: number[] }> {
    const day = new Date(date);
    if (isNaN(day.getTime())) throw new BadRequestException('Invalid date');

    const startOfDay = new Date(day.setHours(0, 0, 0, 0));
    const endOfDay = new Date(day.setHours(23, 59, 59, 999));

    const reservations = await this.roomReservationRepository.find({
      where: {
        room: { id: roomId },
        startDate: Between(startOfDay, endOfDay),
      },
    });

    const hours = new Set<number>();
    for (const res of reservations) {
      const startHour = res.startDate.getHours();
      const endHour = res.endDate.getHours();
      const actualEnd = endHour === 0 ? 24 : endHour;

      for (let i = startHour; i < actualEnd; i++) {
        hours.add(i);
      }
    }

    const am: number[] = [];
    const pm: number[] = [];

    Array.from(hours)
      .sort((a, b) => a - b)
      .forEach((hour) => {
        if (hour < 12) am.push(hour);
        else pm.push(hour);
      });

    return { am, pm };
  }
}
