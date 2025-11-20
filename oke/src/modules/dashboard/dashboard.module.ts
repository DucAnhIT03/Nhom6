import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { User } from '../../shared/entities/user.entity';
import { Station } from '../../shared/entities/station.entity';
import { BusCompany } from '../../shared/entities/bus-company.entity';
import { Bus } from '../../shared/entities/bus.entity';
import { Route } from '../../shared/entities/route.entity';
import { Post } from '../../shared/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Station,
      BusCompany,
      Bus,
      Route,
      Post,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

