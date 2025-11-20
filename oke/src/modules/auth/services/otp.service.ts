import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { OtpCode } from '../../../shared/entities/otp.entity';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    private readonly mailService: MailService,
  ) {}

  generateOtpCode(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendOtp(email: string, type: string = 'REGISTER'): Promise<string> {
    // Delete old unused OTPs for this email
    await this.otpRepository.delete({
      email,
      used: false,
      type,
    });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 60); // OTP expires in 60 seconds

    // Save OTP to database
    const otp = this.otpRepository.create({
      email,
      code,
      expiresAt,
      used: false,
      type,
    });

    await this.otpRepository.save(otp);

    // Send OTP via email
    try {
      await this.mailService.sendEmail({
        to: email,
        subject: 'Mã OTP xác thực đăng ký',
        html: `
          <h2>Mã OTP xác thực</h2>
          <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
          <p>Mã này có hiệu lực trong 60 giây.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (error) {
      // If email fails, delete the OTP and throw error
      await this.otpRepository.delete({ email, code, type });
      
      // Log detailed error for debugging
      console.error('Failed to send OTP email:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      
      // Provide more specific error message
      let errorMessage = 'Không thể gửi mã OTP. ';
      if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
        errorMessage += 'Lỗi kết nối email (SSL/TLS). Vui lòng kiểm tra cấu hình email server.';
      } else if (error.message?.includes('auth') || error.message?.includes('Authentication')) {
        errorMessage += 'Lỗi xác thực email. Vui lòng kiểm tra thông tin đăng nhập email.';
      } else {
        errorMessage += 'Vui lòng kiểm tra lại email hoặc thử lại sau.';
      }
      
      throw new BadRequestException(errorMessage);
    }

    return code;
  }

  async verifyOtp(email: string, code: string, type: string = 'REGISTER'): Promise<boolean> {
    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        code,
        used: false,
        type,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    // Mark OTP as used
    otp.used = true;
    await this.otpRepository.save(otp);

    return true;
  }

  async cleanupExpiredOtps(): Promise<void> {
    // Delete expired OTPs older than 1 hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    await this.otpRepository.delete({
      expiresAt: LessThan(oneHourAgo),
    });
  }
}

