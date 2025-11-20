import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  descriptions?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  companyId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  floors?: number;
}








