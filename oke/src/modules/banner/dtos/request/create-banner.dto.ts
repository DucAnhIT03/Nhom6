import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty({ message: 'URL banner không được để trống' })
  bannerUrl: string;

  @IsString()
  @IsNotEmpty({ message: 'Vị trí banner không được để trống' })
  position: string;
}












