import { IsInt, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateRouteDto {
  @IsInt()
  @IsNotEmpty({ message: 'Điểm đi không được để trống' })
  @Min(1)
  departureStationId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Điểm đến không được để trống' })
  @Min(1)
  arrivalStationId: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @IsNotEmpty({ message: 'Thời gian không được để trống' })
  @Min(1)
  duration: number;

  @IsInt()
  @IsNotEmpty({ message: 'Khoảng cách không được để trống' })
  @Min(1)
  distance: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  busCompanyId?: number;
}
