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
import { BusService } from '../services/bus.service';
import { CreateBusDto } from '../dtos/request/create-bus.dto';
import { UpdateBusDto } from '../dtos/request/update-bus.dto';
import { QueryBusDto } from '../dtos/request/query-bus.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('buses')
export class BusController {
  constructor(private readonly busService: BusService) {}

  // Công khai: Xem danh sách xe
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryBusDto) {
    return this.busService.findAll(queryDto);
  }

  // Công khai: Xem chi tiết xe
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busService.findOne(id);
  }

  // Admin: Thêm xe
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateBusDto) {
    return this.busService.create(createDto);
  }

  // Admin: Cập nhật xe
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBusDto,
  ) {
    return this.busService.update(id, updateDto);
  }

  // Admin: Xóa xe
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.busService.delete(id);
  }
}








