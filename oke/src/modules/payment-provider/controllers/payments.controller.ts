import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { VnpayService } from '../services/vnpay.service';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Post('vnpay/create')
  async createVnpay(@Body() body: any) {
    const { amount, orderId, orderInfo, ipAddr } = body || {};
    if (!amount || !orderId) {
      throw new BadRequestException('amount và orderId là bắt buộc');
    }

    const paymentUrl = this.vnpayService.createPaymentUrl({
      amount: Number(amount),
      orderId: String(orderId),
      orderInfo:
        orderInfo || `Thanh toán đơn hàng ${orderId}`,
      ipAddr: ipAddr || '127.0.0.1',
    });

    return ResponseUtil.success({ paymentUrl });
  }

  @Post('vnpay/verify')
  async verifyVnpay(@Body() body: any) {
    if (!body || !body.vnp_SecureHash) {
      throw new BadRequestException('Thiếu tham số VNPAY');
    }

    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = body;
    const isValid = this.vnpayService.verifySignature(
      rest,
      vnp_SecureHash,
    );

    const isSuccess = isValid && rest.vnp_ResponseCode === '00';

    // TODO: cập nhật trạng thái đơn hàng / vé dựa vào vnp_TxnRef

    return ResponseUtil.success({
      isValid,
      isSuccess,
      responseCode: rest.vnp_ResponseCode,
      orderId: rest.vnp_TxnRef,
    });
  }
}


