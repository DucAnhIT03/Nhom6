import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProviderType } from '../../../../shared/entities/payment-provider.entity';

export class QueryPaymentProviderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(PaymentProviderType)
  @IsOptional()
  providerType?: PaymentProviderType;
}







