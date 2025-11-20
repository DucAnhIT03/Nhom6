import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySeatDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  busId?: number;

  @IsEnum(['LUXURY', 'VIP', 'STANDARD', 'DOUBLE'])
  @IsOptional()
  seatType?: 'LUXURY' | 'VIP' | 'STANDARD' | 'DOUBLE';

  @IsEnum(['AVAILABLE', 'BOOKED'])
  @IsOptional()
  status?: 'AVAILABLE' | 'BOOKED';
}



