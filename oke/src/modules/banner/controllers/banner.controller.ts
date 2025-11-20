import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from '../services/banner.service';
import { CreateBannerDto } from '../dtos/request/create-banner.dto';
import { UpdateBannerDto } from '../dtos/request/update-banner.dto';
import { QueryBannerDto } from '../dtos/request/query-banner.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // Công khai: Xem danh sách banner
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryBannerDto) {
    return this.bannerService.findAll(queryDto);
  }

  // Công khai: Xem chi tiết banner
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  // Admin: Thêm banner
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateBannerDto) {
    return this.bannerService.create(createDto);
  }

  // Admin: Cập nhật banner
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBannerDto,
  ) {
    return this.bannerService.update(id, updateDto);
  }

  // Admin: Xóa banner
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.delete(id);
  }
}
