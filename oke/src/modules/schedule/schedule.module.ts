import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from './services/schedule.service';
import { ScheduleRepository } from './repositories/schedule.repository';
import { Schedule } from '../../shared/entities/schedule.entity';
import { RouteModule } from '../route/route.module';
import { BusModule } from '../bus/bus.module';
import { BusStationModule } from '../bus-station/bus-station.module';
import { StationModule } from '../station/station.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    RouteModule,
    BusModule,
    BusStationModule,
    StationModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
  exports: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}

