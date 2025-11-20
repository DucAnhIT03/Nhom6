import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { SendEmailDto, SendTemplateEmailDto } from '../dtos/send-email.dto';
import { Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @Roles(RoleName.ROLE_ADMIN)
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.mailService.sendEmail(sendEmailDto);
  }

  @Post('send-template')
  @Roles(RoleName.ROLE_ADMIN)
  async sendTemplateEmail(@Body() sendTemplateEmailDto: SendTemplateEmailDto) {
    return this.mailService.sendTemplateEmail(sendTemplateEmailDto);
  }

  @Post('welcome')
  @Roles(RoleName.ROLE_ADMIN)
  async sendWelcomeEmail(@Body() body: { to: string; name: string }) {
    return this.mailService.sendWelcomeEmail(body.to, body.name);
  }

  @Post('password-reset')
  async sendPasswordResetEmail(@Body() body: { to: string; resetToken: string }) {
    return this.mailService.sendPasswordResetEmail(body.to, body.resetToken);
  }
}












