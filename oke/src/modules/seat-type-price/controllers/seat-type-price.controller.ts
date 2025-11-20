import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SeatTypePriceService } from '../services/seat-type-price.service';
import { QuerySeatTypePriceDto } from '../dtos/request/query-seat-type-price.dto';
import { UpsertSeatTypePriceDto } from '../dtos/request/upsert-seat-type-price.dto';
import { BulkApplySeatTypePriceDto } from '../dtos/request/bulk-apply-seat-type-price.dto';
import { Public, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seat-type-prices')
export class SeatTypePriceController {
  constructor(private readonly seatTypePriceService: SeatTypePriceService) {}

  @Get()
  @Public()
  async find(@Query() query: QuerySeatTypePriceDto) {
    return this.seatTypePriceService.find(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async upsert(@Body() body: UpsertSeatTypePriceDto) {
    return this.seatTypePriceService.upsert(body);
  }

  @Post('bulk-apply')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async bulkApply(@Body() body: BulkApplySeatTypePriceDto) {
    return this.seatTypePriceService.bulkApply(body);
  }
}


