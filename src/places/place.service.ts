import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '@/src/places/entities/place.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
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
}
