import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeatTypePriceItemDto } from './seat-type-price-item.dto';

export class BulkApplySeatTypePriceDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  routeIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  companyIds?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departureStationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arrivalStationId?: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SeatTypePriceItemDto)
  seatTypePrices: SeatTypePriceItemDto[];
}


