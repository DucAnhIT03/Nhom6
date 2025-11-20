import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bến xe không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  wallpaper?: string;

  @IsString()
  @IsOptional()
  descriptions?: string;

  @IsString()
  @IsOptional()
  location?: string;
}












