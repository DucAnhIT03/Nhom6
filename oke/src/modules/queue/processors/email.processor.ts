import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from '../../mail/services/mail.service';
import { QUEUE_NAMES, EMAIL_JOBS } from '../constants/queue.constants';
import { SendEmailDto, SendTemplateEmailDto } from '../../mail/dtos/send-email.dto';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process(EMAIL_JOBS.SEND_EMAIL)
  async handleSendEmail(job: Job<SendEmailDto>) {
    const { data } = job;
    console.log(`Processing email job: ${job.id}`);
    return await this.mailService.sendEmail(data);
  }

  @Process(EMAIL_JOBS.SEND_TEMPLATE_EMAIL)
  async handleSendTemplateEmail(job: Job<SendTemplateEmailDto>) {
    const { data } = job;
    console.log(`Processing template email job: ${job.id}`);
    return await this.mailService.sendTemplateEmail(data);
  }

  @Process(EMAIL_JOBS.SEND_WELCOME_EMAIL)
  async handleSendWelcomeEmail(job: Job<{ to: string; name: string }>) {
    const { data } = job;
    console.log(`Processing welcome email job: ${job.id}`);
    return await this.mailService.sendWelcomeEmail(data.to, data.name);
  }

  @Process(EMAIL_JOBS.SEND_PASSWORD_RESET_EMAIL)
  async handleSendPasswordResetEmail(job: Job<{ to: string; resetToken: string }>) {
    const { data } = job;
    console.log(`Processing password reset email job: ${job.id}`);
    return await this.mailService.sendPasswordResetEmail(data.to, data.resetToken);
  }
}












