import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySeatTypePriceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  routeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}


