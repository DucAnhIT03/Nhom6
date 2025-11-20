import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BusStationService } from '../services/bus-station.service';

@Controller('buses/:busId/stations')
export class BusStationBusController {
  constructor(private readonly busStationService: BusStationService) {}

  @Get()
  async getStationsByBus(@Param('busId', ParseIntPipe) busId: number) {
    return this.busStationService.getStationsByBus(busId);
  }
}












