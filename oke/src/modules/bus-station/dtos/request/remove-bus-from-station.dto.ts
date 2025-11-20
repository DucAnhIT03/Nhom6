import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveBusFromStationDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'Bus ID không được để trống' })
  busId: number;
}












