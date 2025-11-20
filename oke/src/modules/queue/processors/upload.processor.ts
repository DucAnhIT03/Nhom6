import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { UploadService } from '../../upload/services/upload.service';
import { QUEUE_NAMES, UPLOAD_JOBS } from '../constants/queue.constants';

@Processor(QUEUE_NAMES.UPLOAD)
export class UploadProcessor {
  constructor(private readonly uploadService: UploadService) {}

  @Process(UPLOAD_JOBS.UPLOAD_SINGLE)
  async handleUploadSingle(job: Job<{ file: Express.Multer.File; folder?: string }>) {
    const { data } = job;
    console.log(`Processing upload single job: ${job.id}`);
    return await this.uploadService.uploadSingle(data.file, data.folder);
  }

  @Process(UPLOAD_JOBS.UPLOAD_MULTIPLE)
  async handleUploadMultiple(job: Job<{ files: Express.Multer.File[]; folder?: string }>) {
    const { data } = job;
    console.log(`Processing upload multiple job: ${job.id}`);
    return await this.uploadService.uploadMultiple(data.files, data.folder);
  }

  @Process(UPLOAD_JOBS.REMOVE_IMAGE)
  async handleRemoveImage(job: Job<{ publicId: string }>) {
    const { data } = job;
    console.log(`Processing remove image job: ${job.id}`);
    return await this.uploadService.removeImage(data.publicId);
  }
}












