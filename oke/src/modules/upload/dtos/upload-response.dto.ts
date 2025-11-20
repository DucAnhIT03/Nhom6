export class UploadResponseDto {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export class RemoveImageResponseDto {
  result: string;
  publicId: string;
}












