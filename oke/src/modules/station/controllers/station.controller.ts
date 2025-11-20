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
import { StationService } from '../services/station.service';
import { CreateStationDto } from '../dtos/request/create-station.dto';
import { UpdateStationDto } from '../dtos/request/update-station.dto';
import { QueryStationDto } from '../dtos/request/query-station.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('stations')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  // Công khai: Xem danh sách bến xe
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryStationDto) {
    return this.stationService.findAll(queryDto);
  }

  // Công khai: Xem chi tiết bến xe
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOne(id);
  }

  // Admin: Thêm bến xe
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateStationDto) {
    return this.stationService.create(createDto);
  }

  // Admin: Cập nhật bến xe
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStationDto,
  ) {
    return this.stationService.update(id, updateDto);
  }

  // Admin: Xóa bến xe
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.delete(id);
  }
}
