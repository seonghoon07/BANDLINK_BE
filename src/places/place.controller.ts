import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
