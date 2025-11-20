import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSeatDto {
  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsEnum(['LUXURY', 'VIP', 'STANDARD', 'DOUBLE'])
  @IsOptional()
  seatType?: 'LUXURY' | 'VIP' | 'STANDARD' | 'DOUBLE';

  @IsEnum(['AVAILABLE', 'BOOKED'])
  @IsOptional()
  status?: 'AVAILABLE' | 'BOOKED';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceForSeatType?: number;

  @Type(() => Boolean)
  @IsOptional()
  isHidden?: boolean;
}

