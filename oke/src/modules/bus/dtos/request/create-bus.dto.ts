import { IsString, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên xe không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  descriptions?: string;

  @IsString()
  @IsNotEmpty({ message: 'Biển số xe không được để trống' })
  licensePlate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'Sức chứa không được để trống' })
  capacity: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'ID công ty không được để trống' })
  companyId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floors?: number;
}

