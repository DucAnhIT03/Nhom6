import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerController } from './controllers/banner.controller';
import { BannerService } from './services/banner.service';
import { BannerRepository } from './repositories/banner.repository';
import { Banner } from '../../shared/entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannerController],
  providers: [BannerService, BannerRepository],
  exports: [BannerService, BannerRepository],
})
export class BannerModule {}












