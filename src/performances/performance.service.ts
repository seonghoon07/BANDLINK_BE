import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from '@/src/performances/entities/performance.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}

  async getMyPerformances(userId: number): Promise<Performance[]> {
    return this.performanceRepository.find({
      where: { user: { id: userId } },
    });
  }
}
