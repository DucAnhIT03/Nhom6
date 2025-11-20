import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email người nhận không được để trống' })
  to: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề email không được để trống' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung email không được để trống' })
  text?: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsEmail()
  @IsOptional()
  from?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];
}

export class SendTemplateEmailDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email người nhận không được để trống' })
  to: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên template không được để trống' })
  template: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề email không được để trống' })
  subject: string;

  @IsOptional()
  context?: Record<string, any>;
}












