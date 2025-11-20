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
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto } from '../dtos/request/create-schedule.dto';
import { UpdateScheduleDto } from '../dtos/request/update-schedule.dto';
import { QueryScheduleDto } from '../dtos/request/query-schedule.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Công khai: Xem danh sách lịch trình
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryScheduleDto) {
    return this.scheduleService.findAll(queryDto);
  }

  // Công khai: Xem lịch trình sắp tới
  @Get('upcoming')
  @Public()
  async findUpcomingSchedules(@Query('limit') limit?: number) {
    return this.scheduleService.findUpcomingSchedules(limit ? parseInt(limit.toString()) : 10);
  }

  // Công khai: Tìm lịch trình theo tuyến và ngày
  @Get('route/:routeId/date/:date')
  @Public()
  async findByRouteAndDate(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('date') date: string,
  ) {
    return this.scheduleService.findByRouteAndDate(routeId, date);
  }

  // Công khai: Xem chi tiết lịch trình
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  // Admin: Thêm lịch trình
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateScheduleDto) {
    return this.scheduleService.create(createDto);
  }

  // Admin: Cập nhật lịch trình
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateDto);
  }

  // Admin: Hủy lịch trình
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async cancelSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.cancelSchedule(id);
  }

  // Admin: Cập nhật số ghế
  @Patch(':id/seats')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async updateAvailableSeats(
    @Param('id', ParseIntPipe) id: number,
    @Body('seatsToBook', ParseIntPipe) seatsToBook: number,
  ) {
    return this.scheduleService.updateAvailableSeats(id, seatsToBook);
  }

  // Admin: Xóa lịch trình
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.delete(id);
  }
}
