import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadResponseDto, RemoveImageResponseDto } from '../dtos/upload-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class UploadService {

  async uploadSingle(file: Express.Multer.File, folder?: string): Promise<any> {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'auto',
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(new BadRequestException(`Lỗi upload ảnh: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new BadRequestException('Không nhận được kết quả từ Cloudinary'));
            return;
          }

          const response: UploadResponseDto = {
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          };

          resolve(ResponseUtil.success(response, 'Upload ảnh thành công'));
        })
        .end(file.buffer);
    });
  }

  async uploadMultiple(files: Express.Multer.File[], folder?: string): Promise<any> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file được upload');
    }

    const uploadPromises = files.map((file) => this.uploadSingle(file, folder));

    try {
      const results = await Promise.all(uploadPromises);
      const uploadedImages = results.map((result) => result.data);

      return ResponseUtil.success(
        uploadedImages,
        `Upload thành công ${files.length} ảnh`,
      );
    } catch (error) {
      throw new BadRequestException(`Lỗi upload nhiều ảnh: ${error.message}`);
    }
  }

  async removeImage(publicId: string): Promise<any> {
    if (!publicId) {
      throw new BadRequestException('Public ID không được để trống');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new BadRequestException(`Lỗi xóa ảnh: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new BadRequestException('Không nhận được kết quả từ Cloudinary'));
          return;
        }

        if (result.result === 'not found') {
          reject(new BadRequestException('Không tìm thấy ảnh để xóa'));
          return;
        }

        const response: RemoveImageResponseDto = {
          result: result.result,
          publicId: publicId,
        };

        resolve(ResponseUtil.success(response, 'Xóa ảnh thành công'));
      });
    });
  }

  async removeMultiple(publicIds: string[]): Promise<any> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Danh sách Public ID không được để trống');
    }

    const removePromises = publicIds.map((publicId) => this.removeImage(publicId));

    try {
      const results = await Promise.all(removePromises);
      const removedImages = results.map((result) => result.data);

      return ResponseUtil.success(
        removedImages,
        `Xóa thành công ${publicIds.length} ảnh`,
      );
    } catch (error) {
      throw new BadRequestException(`Lỗi xóa nhiều ảnh: ${error.message}`);
    }
  }
}

