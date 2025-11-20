import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatController } from './controllers/seat.controller';
import { SeatService } from './services/seat.service';
import { SeatRepository } from './repositories/seat.repository';
import { Seat } from '../../shared/entities/seat.entity';
import { BusModule } from '../bus/bus.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), BusModule],
  controllers: [SeatController],
  providers: [SeatService, SeatRepository],
  exports: [SeatService, SeatRepository],
})
export class SeatModule {}



