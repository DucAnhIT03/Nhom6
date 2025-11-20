import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES, EMAIL_JOBS, UPLOAD_JOBS } from '../constants/queue.constants';
import { SendEmailDto, SendTemplateEmailDto } from '../../mail/dtos/send-email.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.UPLOAD) private readonly uploadQueue: Queue,
  ) {}

  // Email Queue Methods
  async addEmailJob(data: SendEmailDto) {
    const job = await this.emailQueue.add(EMAIL_JOBS.SEND_EMAIL, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Email đã được thêm vào hàng đợi');
  }

  async addTemplateEmailJob(data: SendTemplateEmailDto) {
    const job = await this.emailQueue.add(EMAIL_JOBS.SEND_TEMPLATE_EMAIL, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Email template đã được thêm vào hàng đợi');
  }

  async addWelcomeEmailJob(to: string, name: string) {
    const job = await this.emailQueue.add(EMAIL_JOBS.SEND_WELCOME_EMAIL, { to, name }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Welcome email đã được thêm vào hàng đợi');
  }

  async addPasswordResetEmailJob(to: string, resetToken: string) {
    const job = await this.emailQueue.add(EMAIL_JOBS.SEND_PASSWORD_RESET_EMAIL, { to, resetToken }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Password reset email đã được thêm vào hàng đợi');
  }

  // Upload Queue Methods
  async addUploadSingleJob(file: Express.Multer.File, folder?: string) {
    const job = await this.uploadQueue.add(UPLOAD_JOBS.UPLOAD_SINGLE, { file, folder }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Upload job đã được thêm vào hàng đợi');
  }

  async addUploadMultipleJob(files: Express.Multer.File[], folder?: string) {
    const job = await this.uploadQueue.add(UPLOAD_JOBS.UPLOAD_MULTIPLE, { files, folder }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Upload multiple job đã được thêm vào hàng đợi');
  }

  async addRemoveImageJob(publicId: string) {
    const job = await this.uploadQueue.add(UPLOAD_JOBS.REMOVE_IMAGE, { publicId }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return ResponseUtil.success({ jobId: job.id }, 'Remove image job đã được thêm vào hàng đợi');
  }

  // Queue Status Methods
  async getEmailQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return ResponseUtil.success({
      waiting,
      active,
      completed,
      failed,
      delayed,
    }, 'Lấy trạng thái email queue thành công');
  }

  async getUploadQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.uploadQueue.getWaitingCount(),
      this.uploadQueue.getActiveCount(),
      this.uploadQueue.getCompletedCount(),
      this.uploadQueue.getFailedCount(),
      this.uploadQueue.getDelayedCount(),
    ]);

    return ResponseUtil.success({
      waiting,
      active,
      completed,
      failed,
      delayed,
    }, 'Lấy trạng thái upload queue thành công');
  }
}












