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
import { RouteService } from '../services/route.service';
import { CreateRouteDto } from '../dtos/request/create-route.dto';
import { UpdateRouteDto } from '../dtos/request/update-route.dto';
import { BulkUpdatePriceDto } from '../dtos/request/bulk-update-price.dto';
import { QueryRouteDto } from '../dtos/request/query-route.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // Công khai: Xem danh sách tuyến đường
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryRouteDto) {
    return this.routeService.findAll(queryDto);
  }

  // Admin: Thêm tuyến đường
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateRouteDto) {
    return this.routeService.create(createDto);
  }

  // Admin: Cập nhật giá vé hàng loạt (phải đặt trước route :id để tránh conflict)
  @Put('prices/bulk')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async bulkUpdatePrice(@Body() bulkUpdateDto: BulkUpdatePriceDto) {
    return this.routeService.bulkUpdatePrice(bulkUpdateDto);
  }

  // Công khai: Xem chi tiết tuyến đường
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.findOne(id);
  }

  // Admin: Cập nhật tuyến đường
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRouteDto,
  ) {
    return this.routeService.update(id, updateDto);
  }

  // Admin: Xóa tuyến đường
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.delete(id);
  }
}



