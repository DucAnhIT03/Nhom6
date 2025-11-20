import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SeatTypePrice } from '../../../shared/entities/seat-type-price.entity';
import { SeatTypePriceItemDto } from '../dtos/request/seat-type-price-item.dto';

@Injectable()
export class SeatTypePriceRepository {
  constructor(
    @InjectRepository(SeatTypePrice)
    private readonly repository: Repository<SeatTypePrice>,
  ) {}

  async findByRoute(routeId: number): Promise<SeatTypePrice[]> {
    return this.repository.find({
      where: { routeId },
      order: { seatType: 'ASC' },
      relations: ['route'],
    });
  }

  async findByRoutes(routeIds: number[]): Promise<SeatTypePrice[]> {
    if (!routeIds.length) return [];
    return this.repository.find({
      where: { routeId: In(routeIds) },
      relations: ['route'],
    });
  }

  async upsertForRoute(
    routeId: number,
    seatTypePrices: SeatTypePriceItemDto[],
  ): Promise<void> {
    const values = seatTypePrices.map((item) => ({
      routeId,
      seatType: item.seatType,
      price: item.price,
    }));
    await this.repository.upsert(values, ['routeId', 'seatType']);
  }

  async removeByRoute(routeId: number): Promise<void> {
    await this.repository.delete({ routeId });
  }

  createQueryBuilder(alias = 'price') {
    return this.repository.createQueryBuilder(alias);
  }
}


