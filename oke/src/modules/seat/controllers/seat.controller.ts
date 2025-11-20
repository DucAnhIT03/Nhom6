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
import { SeatService } from '../services/seat.service';
import { CreateSeatDto } from '../dtos/request/create-seat.dto';
import { UpdateSeatDto } from '../dtos/request/update-seat.dto';
import { BulkUpdateSeatDto } from '../dtos/request/bulk-update-seat.dto';
import { QuerySeatDto } from '../dtos/request/query-seat.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  // Công khai: Xem danh sách ghế
  @Get()
  @Public()
  async findAll(@Query() queryDto: QuerySeatDto) {
    return this.seatService.findAll(queryDto);
  }

  // Công khai: Xem sơ đồ ghế theo xe
  @Get('bus/:busId')
  @Public()
  async findByBusId(@Param('busId', ParseIntPipe) busId: number) {
    return this.seatService.findByBusId(busId);
  }

  // Công khai: Xem chi tiết ghế
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.findOne(id);
  }

  // Admin: Thêm ghế
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateSeatDto) {
    return this.seatService.create(createDto);
  }

  // Admin: Thêm nhiều ghế
  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async createMany(@Body() createDtos: CreateSeatDto[]) {
    return this.seatService.createMany(createDtos);
  }

  // Admin: Cập nhật nhiều ghế
  @Put('bulk')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async updateMany(@Body() bulkUpdateDto: BulkUpdateSeatDto) {
    return this.seatService.updateMany(bulkUpdateDto);
  }

  // Admin: Cập nhật ghế
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSeatDto,
  ) {
    return this.seatService.update(id, updateDto);
  }

  // Admin: Xóa ghế
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.delete(id);
  }

  // Admin: Xóa toàn bộ sơ đồ ghế của một xe
  @Delete('bus/:busId')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async deleteByBus(@Param('busId', ParseIntPipe) busId: number) {
    return this.seatService.deleteByBusId(busId);
  }
}





