import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatTypePrice } from '../../shared/entities/seat-type-price.entity';
import { SeatTypePriceController } from './controllers/seat-type-price.controller';
import { SeatTypePriceService } from './services/seat-type-price.service';
import { SeatTypePriceRepository } from './repositories/seat-type-price.repository';
import { Route } from '../../shared/entities/route.entity';
import { RouteRepository } from '../route/repositories/route.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SeatTypePrice, Route])],
  controllers: [SeatTypePriceController],
  providers: [SeatTypePriceService, SeatTypePriceRepository, RouteRepository],
  exports: [SeatTypePriceService],
})
export class SeatTypePriceModule {}


