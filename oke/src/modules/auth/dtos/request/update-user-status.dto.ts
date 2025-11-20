import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../../../common/constraints';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Trạng thái phải là ACTIVE hoặc BLOCKED' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: UserStatus;
}

