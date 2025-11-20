import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateRouteDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  departureStationId?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  arrivalStationId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  distance?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  busCompanyId?: number;
}



