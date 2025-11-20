import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { SeatTypePriceItemDto } from './seat-type-price-item.dto';

export class UpsertSeatTypePriceDto {
  @Type(() => Number)
  @IsInt()
  routeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatTypePriceItemDto)
  seatTypePrices: SeatTypePriceItemDto[];
}


