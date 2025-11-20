import {
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ScheduleStatus } from '../../../../common/constraints';

export class UpdateScheduleDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  routeId?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  busId?: number;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  @IsOptional()
  endDate?: string;

  @IsDateString({}, { message: 'Thời gian khởi hành không hợp lệ' })
  @IsOptional()
  departureTime?: string;

  @IsDateString({}, { message: 'Thời gian đến nơi không hợp lệ' })
  @IsOptional()
  arrivalTime?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  availableSeat?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  totalSeats?: number;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;
}

