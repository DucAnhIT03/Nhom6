import { IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SeatTypePriceItemDto {
  @IsEnum(['STANDARD', 'VIP', 'DOUBLE', 'LUXURY'])
  seatType: 'STANDARD' | 'VIP' | 'DOUBLE' | 'LUXURY';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}


