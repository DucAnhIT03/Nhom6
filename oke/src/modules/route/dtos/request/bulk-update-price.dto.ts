import { IsNumber, IsNotEmpty, Min, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdatePriceDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Giá vé mới không được để trống' })
  @Min(0, { message: 'Giá vé phải lớn hơn hoặc bằng 0' })
  newPrice: number;

  // Lọc theo nhà xe
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  busCompanyId?: number;

  // Lọc theo tuyến đường (có thể là một hoặc nhiều routeId)
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @Min(1, { each: true })
  routeIds?: number[];

  // Lọc theo loại xe (busId) - sẽ tìm các route thông qua schedule
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  busId?: number;

  // Lọc theo nhiều loại xe (busIds) - sẽ tìm các route thông qua schedule
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @Min(1, { each: true })
  busIds?: number[];

  // Lọc theo điểm đi
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  departureStationId?: number;

  // Lọc theo điểm đến
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  arrivalStationId?: number;
}

