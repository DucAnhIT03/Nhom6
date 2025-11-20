import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ConfigModule, forwardRef(() => QueueModule)],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}

