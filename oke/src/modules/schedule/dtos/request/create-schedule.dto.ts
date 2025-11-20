import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ScheduleStatus } from '../../../../common/constraints';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsInt()
  @IsNotEmpty({ message: 'Route ID không được để trống' })
  @Min(1)
  routeId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Bus ID không được để trống' })
  @Min(1)
  busId: number;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;

  @IsDateString({}, { message: 'Thời gian khởi hành không hợp lệ' })
  @IsNotEmpty({ message: 'Thời gian khởi hành không được để trống' })
  departureTime: string;

  @IsDateString({}, { message: 'Thời gian đến nơi không hợp lệ' })
  @IsNotEmpty({ message: 'Thời gian đến nơi không được để trống' })
  arrivalTime: string;

  @IsInt()
  @IsNotEmpty({ message: 'Tổng số ghế không được để trống' })
  @Min(1)
  totalSeats: number;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;
}

