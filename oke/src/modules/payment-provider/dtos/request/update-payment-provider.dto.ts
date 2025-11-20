import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentProviderType } from '../../../../shared/entities/payment-provider.entity';

export class UpdatePaymentProviderDto {
  @IsString()
  @IsOptional()
  providerName?: string;

  @IsEnum(PaymentProviderType)
  @IsOptional()
  providerType?: PaymentProviderType;

  @IsString()
  @IsOptional()
  apiEndpoint?: string;
}
