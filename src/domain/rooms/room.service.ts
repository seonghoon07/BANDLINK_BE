import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { Place } from '@/src/domain/places/entities/place.entity';
import { User } from '@/src/domain/users/entities/user.entity';
import { ReserveRoomRequestDto } from '@/src/domain/rooms/dto/reserveRoomRequest.dto';

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
      openTime: room.place.openTime,
      closeTime: room.place.closeTime,
    };
  }

  async getUnavailableDates(
    roomId: number,
    year: number,
    month: number,
  ): Promise<string[]> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const unavailableDates: string[] = [];

    for (
      let time = new Date(start);
      time <= end;
      time.setDate(time.getDate() + 1)
    ) {
      const d = new Date(time);
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0,
        0,
      );
      const dayEnd = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999,
      );

      const reservations = await this.roomReservationRepository.find({
        where: {
          room: { id: roomId },
          startDate: LessThanOrEqual(dayEnd),
          endDate: MoreThanOrEqual(dayStart),
        },
      });

      const reservedHours = new Set<number>();

      for (const res of reservations) {
        const startHour = res.startDate.getHours();
        const endHour =
          res.endDate.getMinutes() === 59
            ? res.endDate.getHours()
            : res.endDate.getHours() - 1;
        const actualEnd = endHour < startHour ? 24 : endHour;

        for (let i = startHour; i <= actualEnd; i++) {
          reservedHours.add(i);
        }
      }

      function formatDate(d: Date) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate(),
        ).padStart(2, '0')}`;
      }

      if (reservedHours.size >= 24) {
        unavailableDates.push(formatDate(d));
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

  async getUnavailableHours(roomId: number, date: string): Promise<number[]> {
    const day = new Date(date);
    if (isNaN(day.getTime())) throw new BadRequestException('Invalid date');

    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstDay = new Date(day.getTime() + KST_OFFSET);

    const startOfDay = new Date(
      kstDay.getFullYear(),
      kstDay.getMonth(),
      kstDay.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      kstDay.getFullYear(),
      kstDay.getMonth(),
      kstDay.getDate(),
      23,
      59,
      59,
      999,
    );

    const reservations = await this.roomReservationRepository.find({
      where: [
        { room: { id: roomId }, startDate: Between(startOfDay, endOfDay) },
        { room: { id: roomId }, endDate: Between(startOfDay, endOfDay) },
        {
          room: { id: roomId },
          startDate: LessThanOrEqual(startOfDay),
          endDate: MoreThanOrEqual(endOfDay),
        },
      ],
    });

    const hours = new Set<number>();

    for (const res of reservations) {
      const start = new Date(
        Math.max(res.startDate.getTime(), startOfDay.getTime()),
      );
      const end = new Date(Math.min(res.endDate.getTime(), endOfDay.getTime()));

      const startHour = start.getHours();
      const endHour =
        end.getMinutes() === 0 && end.getSeconds() === 0
          ? end.getHours()
          : end.getHours() + 1;

      for (let hour = startHour; hour < endHour; hour++) {
        hours.add(hour);
      }
    }

    return Array.from(hours).sort((a, b) => a - b);
  }
}
