import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BusStationService } from '../services/bus-station.service';
import { AddBusToStationDto } from '../dtos/request/add-bus-to-station.dto';
import { RemoveBusFromStationDto } from '../dtos/request/remove-bus-from-station.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';

@Controller('bus-stations')
export class BusStationController {
  constructor(private readonly busStationService: BusStationService) {}

  // Lấy tất cả quan hệ xe - bến
  @Get()
  @Public()
  async getAllRelations() {
    return this.busStationService.getAllRelations();
  }
}

@Controller('stations/:stationId/buses')
export class StationBusesController {
  constructor(private readonly busStationService: BusStationService) {}

  @Get()
  @Public()
  async getBusesByStation(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.busStationService.getBusesByStation(stationId);
  }

  @Post()
  @Roles(RoleName.ROLE_ADMIN)
  async addBusToStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Body() addBusDto: AddBusToStationDto,
  ) {
    return this.busStationService.addBusToStation(stationId, addBusDto);
  }

  @Delete(':busId')
  @Roles(RoleName.ROLE_ADMIN)
  async removeBusFromStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.busStationService.removeBusFromStation(stationId, { busId });
  }
}
