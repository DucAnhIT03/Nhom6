import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentProviderType } from '../../../../shared/entities/payment-provider.entity';

export class CreatePaymentProviderDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà cung cấp thanh toán không được để trống' })
  providerName: string;

  @IsEnum(PaymentProviderType, {
    message: 'Loại thanh toán không hợp lệ. Các giá trị hợp lệ: CARD, E-WALLET, BANK_TRANSFER, QR_CODE',
  })
  @IsNotEmpty({ message: 'Loại thanh toán không được để trống' })
  providerType: PaymentProviderType;

  @IsString()
  @IsOptional()
  apiEndpoint?: string;
}

