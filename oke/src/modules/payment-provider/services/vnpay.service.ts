import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { vnpayConfig } from '../vnpay.config';

@Injectable()
export class VnpayService {
  private buildSignature(params: Record<string, string>): string {
    const signData = qs.stringify(params, { encode: false });
    return crypto
      .createHmac('sha512', vnpayConfig.vnp_HashSecret)
      .update(signData)
      .digest('hex');
  }

  createPaymentUrl(payload: {
    amount: number;
    orderId: string;
    orderInfo: string;
    ipAddr: string;
  }): string {
    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14); // yyyyMMddHHmmss

    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payload.orderId,
      vnp_OrderInfo: payload.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: String(payload.amount * 100),
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: payload.ipAddr,
      vnp_CreateDate: createDate,
    };

    const sorted = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {} as Record<string, string>);

    const vnp_SecureHash = this.buildSignature(sorted);
    sorted.vnp_SecureHash = vnp_SecureHash;

    const query = qs.stringify(sorted, { encode: true });
    return `${vnpayConfig.vnp_Url}?${query}`;
  }

  verifySignature(
    params: Record<string, string>,
    secureHash: string,
  ): boolean {
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, string>);

    const signed = this.buildSignature(sorted);
    return signed === secureHash;
  }
}


