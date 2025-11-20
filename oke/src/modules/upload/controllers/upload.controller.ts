import {
  Controller,
  Post,
  Delete,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseArrayPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../services/upload.service';
import { QueueService } from '../../queue/services/queue.service';
import { Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly queueService: QueueService,
  ) {}

  @Post('single')
  @Roles(RoleName.ROLE_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Query('async') async?: string,
  ) {
    // Nếu async=true, sử dụng queue
    if (async === 'true') {
      return this.queueService.addUploadSingleJob(file, folder);
    }
    // Ngược lại, upload trực tiếp
    return this.uploadService.uploadSingle(file, folder);
  }

  @Post('multiple')
  @Roles(RoleName.ROLE_ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
    @Query('async') async?: string,
  ) {
    // Nếu async=true, sử dụng queue
    if (async === 'true') {
      return this.queueService.addUploadMultipleJob(files, folder);
    }
    // Ngược lại, upload trực tiếp
    return this.uploadService.uploadMultiple(files, folder);
  }

  @Delete('remove')
  @Roles(RoleName.ROLE_ADMIN)
  async removeImage(@Body('publicId') publicId: string) {
    return this.uploadService.removeImage(publicId);
  }

  @Delete('remove-multiple')
  @Roles(RoleName.ROLE_ADMIN)
  async removeMultiple(
    @Body('publicIds', new ParseArrayPipe({ items: String, separator: ',' }))
    publicIds: string[],
  ) {
    return this.uploadService.removeMultiple(publicIds);
  }
}

