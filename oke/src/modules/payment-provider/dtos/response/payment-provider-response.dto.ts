import { PaymentProviderType } from '../../../../shared/entities/payment-provider.entity';

export class PaymentProviderResponseDto {
  id: number;
  providerName: string;
  providerType: PaymentProviderType;
  apiEndpoint?: string;
  createdAt: Date;
  updatedAt: Date;
}

