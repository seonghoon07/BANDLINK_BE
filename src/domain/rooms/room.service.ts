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
    const kstDay = new Date(date);
    if (isNaN(kstDay.getTime())) throw new BadRequestException('Invalid date');

    const utcStartOfDay = new Date(
      Date.UTC(
        kstDay.getFullYear(),
        kstDay.getMonth(),
        kstDay.getDate(),
        0,
        0,
        0,
      ) -
        9 * 60 * 60 * 1000,
    );

    const utcEndOfDay = new Date(
      utcStartOfDay.getTime() + 24 * 60 * 60 * 1000 - 1,
    );

    const reservations = await this.roomReservationRepository.find({
      where: [
        {
          room: { id: roomId },
          startDate: Between(utcStartOfDay, utcEndOfDay),
        },
        { room: { id: roomId }, endDate: Between(utcStartOfDay, utcEndOfDay) },
        {
          room: { id: roomId },
          startDate: LessThanOrEqual(utcStartOfDay),
          endDate: MoreThanOrEqual(utcEndOfDay),
        },
      ],
    });

    const hours = new Set<number>();

    for (const res of reservations) {
      const start = new Date(
        Math.max(res.startDate.getTime(), utcStartOfDay.getTime()),
      );
      const end = new Date(
        Math.min(res.endDate.getTime(), utcEndOfDay.getTime()),
      );

      const startHour = start.getUTCHours();
      const endHour =
        end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0
          ? end.getUTCHours()
          : end.getUTCHours() + 1;

      for (let hour = startHour; hour < endHour; hour++) {
        hours.add(hour);
      }
    }

    return Array.from(hours)
      .map((h) => (h + 9) % 24)
      .sort((a, b) => a - b);
  }
}
