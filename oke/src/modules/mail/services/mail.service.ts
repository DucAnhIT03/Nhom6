import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto, SendTemplateEmailDto } from '../dtos/send-email.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<any> {
    try {
      const { to, subject, text, html, from, cc, bcc } = sendEmailDto;

      const mailOptions: any = {
        to,
        subject,
        ...(text && { text }),
        ...(html && { html }),
        ...(from && { from }),
        ...(cc && { cc }),
        ...(bcc && { bcc }),
      };

      const result = await this.mailerService.sendMail(mailOptions);
      return ResponseUtil.success(result, 'Gửi email thành công');
    } catch (error) {
      throw new Error(`Lỗi gửi email: ${error.message}`);
    }
  }

  async sendTemplateEmail(sendTemplateEmailDto: SendTemplateEmailDto): Promise<any> {
    try {
      const { to, template, subject, context } = sendTemplateEmailDto;

      const result = await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: context || {},
      });

      return ResponseUtil.success(result, 'Gửi email template thành công');
    } catch (error) {
      throw new Error(`Lỗi gửi email template: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<any> {
    return this.sendTemplateEmail({
      to,
      template: 'welcome',
      subject: 'Chào mừng bạn đến với hệ thống đặt vé xe',
      context: {
        name,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<any> {
    return this.sendTemplateEmail({
      to,
      template: 'password-reset',
      subject: 'Đặt lại mật khẩu',
      context: {
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
    });
  }
}












