import { IsString, IsOptional } from 'class-validator';

export class UpdateStationDto {
  @IsString()
  @IsOptional()
  name?: string;

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












