import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/recommend')
  @UseGuards(JwtAuthGuard)
  getRecommendedPlaces() {
    return this.placeService.getRecommendedPlaces();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getPlaces() {
    return this.placeService.getPlaces();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPlaceDetails(@Param('id') id: string) {
    const place = await this.placeService.getPlaceById(Number(id));

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return {
      ...place,
      businessDays: place.businessDays ?? [],
    };
  }
}
