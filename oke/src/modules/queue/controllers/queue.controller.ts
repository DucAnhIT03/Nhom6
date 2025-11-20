import { Controller, Get, Post, Body } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import { SendEmailDto, SendTemplateEmailDto } from '../../mail/dtos/send-email.dto';
import { Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('email/send')
  @Roles(RoleName.ROLE_ADMIN)
  async addEmailJob(@Body() sendEmailDto: SendEmailDto) {
    return this.queueService.addEmailJob(sendEmailDto);
  }

  @Post('email/send-template')
  @Roles(RoleName.ROLE_ADMIN)
  async addTemplateEmailJob(@Body() sendTemplateEmailDto: SendTemplateEmailDto) {
    return this.queueService.addTemplateEmailJob(sendTemplateEmailDto);
  }

  @Post('email/welcome')
  @Roles(RoleName.ROLE_ADMIN)
  async addWelcomeEmailJob(@Body() body: { to: string; name: string }) {
    return this.queueService.addWelcomeEmailJob(body.to, body.name);
  }

  @Post('email/password-reset')
  async addPasswordResetEmailJob(@Body() body: { to: string; resetToken: string }) {
    return this.queueService.addPasswordResetEmailJob(body.to, body.resetToken);
  }

  @Get('email/status')
  @Roles(RoleName.ROLE_ADMIN)
  async getEmailQueueStatus() {
    return this.queueService.getEmailQueueStatus();
  }

  @Get('upload/status')
  @Roles(RoleName.ROLE_ADMIN)
  async getUploadQueueStatus() {
    return this.queueService.getUploadQueueStatus();
  }
}












