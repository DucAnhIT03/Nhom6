import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusStationController, StationBusesController } from './controllers/bus-station.controller';
import { BusStationBusController } from './controllers/bus-station-bus.controller';
import { BusStationService } from './services/bus-station.service';
import { BusStationRepository } from './repositories/bus-station.repository';
import { BusStation } from '../../shared/entities/bus-station.entity';
import { Station } from '../../shared/entities/station.entity';
import { Bus } from '../../shared/entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusStation, Station, Bus])],
  controllers: [BusStationController, StationBusesController, BusStationBusController],
  providers: [BusStationService, BusStationRepository],
  exports: [BusStationService, BusStationRepository],
})
export class BusStationModule {}








