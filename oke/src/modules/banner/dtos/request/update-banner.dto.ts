import { IsString, IsOptional } from 'class-validator';

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  position?: string;
}












