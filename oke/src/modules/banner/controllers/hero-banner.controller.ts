import { Controller, Get, Query } from '@nestjs/common';
import { BannerService } from '../services/banner.service';
import { Public } from '../../../common/decorators';
import { QueryBannerDto } from '../dtos/request/query-banner.dto';

@Controller('hero-images')
export class HeroBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @Public()
  async getHeroBanners(
    @Query('limit') limit = 1,
    @Query('position') position = 'HOME_TOP',
  ) {
    const queryDto: QueryBannerDto = {
      page: 1,
      limit: Number(limit) || 1,
      position,
    };

    return this.bannerService.findAll(queryDto);
  }
}

