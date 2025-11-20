import { IsString, IsNotEmpty, IsOptional, Matches, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((o) => o.firstName !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  firstName?: string;

  @IsOptional()
  @ValidateIf((o) => o.lastName !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'Họ không được để trống' })
  lastName?: string;

  @IsOptional()
  @ValidateIf((o) => o.phone !== undefined && o.phone !== null && o.phone !== '')
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;
}

