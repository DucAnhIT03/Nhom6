import { IsArray, IsInt, ValidateNested, IsOptional, IsString, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSeatDto } from './update-seat.dto';

export class BulkUpdateSeatItemDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @ValidateNested()
  @Type(() => UpdateSeatDto)
  data: UpdateSeatDto;
}

export class BulkUpdateSeatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateSeatItemDto)
  seats: BulkUpdateSeatItemDto[];
}


