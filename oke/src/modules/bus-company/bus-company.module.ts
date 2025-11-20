import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusCompanyController } from './controllers/bus-company.controller';
import { BusCompanyService } from './services/bus-company.service';
import { BusCompanyRepository } from './repositories/bus-company.repository';
import { BusCompany } from '../../shared/entities/bus-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusCompany])],
  controllers: [BusCompanyController],
  providers: [BusCompanyService, BusCompanyRepository],
  exports: [BusCompanyService, BusCompanyRepository],
})
export class BusCompanyModule {}

