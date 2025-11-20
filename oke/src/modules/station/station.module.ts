import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './controllers/station.controller';
import { StationService } from './services/station.service';
import { StationRepository } from './repositories/station.repository';
import { Station } from '../../shared/entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station])],
  controllers: [StationController],
  providers: [StationService, StationRepository],
  exports: [StationService, StationRepository],
})
export class StationModule {}








