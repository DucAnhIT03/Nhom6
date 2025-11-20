import { IsString, IsEnum, IsNumber, IsNotEmpty, Min, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSeatDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'ID xe không được để trống' })
  busId: number;

  @IsString()
  @IsNotEmpty({ message: 'Số ghế không được để trống' })
  seatNumber: string;

  @IsEnum(['LUXURY', 'VIP', 'STANDARD', 'DOUBLE'])
  @IsOptional()
  seatType?: 'LUXURY' | 'VIP' | 'STANDARD' | 'DOUBLE';

  @IsEnum(['AVAILABLE', 'BOOKED'])
  @IsOptional()
  status?: 'AVAILABLE' | 'BOOKED';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceForSeatType?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;
}

