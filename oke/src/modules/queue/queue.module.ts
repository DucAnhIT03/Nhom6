import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { QueueController } from './controllers/queue.controller';
import { EmailProcessor } from './processors/email.processor';
import { UploadProcessor } from './processors/upload.processor';
import { QUEUE_NAMES } from './constants/queue.constants';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.UPLOAD },
    ),
    MailModule,
    forwardRef(() => UploadModule),
  ],
  controllers: [QueueController],
  providers: [QueueService, EmailProcessor, UploadProcessor],
  exports: [QueueService],
})
export class QueueModule {}

