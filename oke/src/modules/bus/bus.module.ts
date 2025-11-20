import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusController } from './controllers/bus.controller';
import { BusService } from './services/bus.service';
import { BusRepository } from './repositories/bus.repository';
import { Bus } from '../../shared/entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
  controllers: [BusController],
  providers: [BusService, BusRepository],
  exports: [BusService, BusRepository],
})
export class BusModule {}










