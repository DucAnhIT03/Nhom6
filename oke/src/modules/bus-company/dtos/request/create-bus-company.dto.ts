import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBusCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà xe không được để trống' })
  companyName: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  descriptions?: string;
}

