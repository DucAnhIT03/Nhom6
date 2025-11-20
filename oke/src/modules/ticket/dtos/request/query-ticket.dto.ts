import { IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '../../../../common/constraints';

export class QueryTicketDto {
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
  userId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  scheduleId?: number;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}

