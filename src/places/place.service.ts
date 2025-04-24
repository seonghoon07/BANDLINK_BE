import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '@/src/places/entities/place.entity';
import { Repository } from 'typeorm';
import { User } from '@/src/users/entities/user.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RoomReservation)
    private readonly roomReservationRepository: Repository<RoomReservation>,
  ) {}

  async getRecommendedPlaces(): Promise<Place[]> {
    return await this.placesRepository
      .createQueryBuilder('place')
      .where('place.isRecommended = :isRecommended', { isRecommended: true })
      .limit(5)
      .getMany();
  }

  async getPlaces(): Promise<Place[]> {
    return await this.placesRepository.find();
  }

  async getPlaceById(id: number): Promise<Place | null> {
    return await this.placesRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.rooms', 'room')
      .where('place.id = :id', { id })
      .getOne();
  }

  async getDashboard(
    googleUid: string,
  ): Promise<{ todayReservationCount: number }> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const count = await this.roomReservationRepository
      .createQueryBuilder('reservation')
      .innerJoin('reservation.room', 'room')
      .innerJoin('room.place', 'place')
      .where('place.userId = :userId', { userId: user.id })
      .andWhere('reservation.startDate BETWEEN :start AND :end', { start, end })
      .getCount();

    return { todayReservationCount: count };
  }
}
