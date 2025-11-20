import { IsOptional, IsInt, Min, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleStatus } from '../../../../common/constraints';

export class QueryScheduleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  routeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId?: number;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departureStationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  arrivalStationId?: number;
}

