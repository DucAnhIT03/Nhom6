import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteController } from './controllers/route.controller';
import { RouteService } from './services/route.service';
import { RouteRepository } from './repositories/route.repository';
import { Route } from '../../shared/entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository],
  exports: [RouteService, RouteRepository],
})
export class RouteModule {}



