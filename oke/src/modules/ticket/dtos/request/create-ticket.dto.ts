import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from '../../../../common/constraints';

export class CreateTicketDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'Schedule ID không được để trống' })
  scheduleId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'Seat ID không được để trống' })
  seatId: number;

  @IsDateString({}, { message: 'Thời gian khởi hành không hợp lệ' })
  @IsNotEmpty({ message: 'Thời gian khởi hành không được để trống' })
  departureTime: string;

  @IsDateString({}, { message: 'Thời gian đến nơi không hợp lệ' })
  @IsNotEmpty({ message: 'Thời gian đến nơi không được để trống' })
  arrivalTime: string;

  @IsEnum(SeatType)
  @IsNotEmpty({ message: 'Loại ghế không được để trống' })
  seatType: SeatType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'Giá vé không được để trống' })
  price: number;

  @IsOptional()
  @IsString()
  ticketCode?: string;
}
