import { IsString, IsOptional } from 'class-validator';

export class UpdateBusCompanyDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  descriptions?: string;
}

