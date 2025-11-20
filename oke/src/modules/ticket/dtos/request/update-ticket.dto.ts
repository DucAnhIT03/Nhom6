import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../../../../common/constraints';

export class UpdateTicketDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}











