import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentProviderController } from './controllers/payment-provider.controller';
import { PaymentProviderService } from './services/payment-provider.service';
import { PaymentProviderRepository } from './repositories/payment-provider.repository';
import { PaymentProvider } from '../../shared/entities/payment-provider.entity';
import { VnpayService } from './services/vnpay.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentProvider])],
  controllers: [PaymentProviderController, PaymentsController],
  providers: [PaymentProviderService, PaymentProviderRepository, VnpayService],
  exports: [PaymentProviderService, PaymentProviderRepository, VnpayService],
})
export class PaymentProviderModule {}

