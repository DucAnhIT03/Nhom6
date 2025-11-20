import { Controller, Post, Body, Get, Put, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { RegisterDto } from '../dtos/request/register.dto';
import { RegisterWithOtpDto } from '../dtos/request/register-with-otp.dto';
import { LoginDto } from '../dtos/request/login.dto';
import { VerifyOtpDto } from '../dtos/request/verify-otp.dto';
import { UpdateProfileDto } from '../dtos/request/update-profile.dto';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { UserProfileDto } from '../dtos/response/user-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../../../common/decorators';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Controller('user/auth')
export class UserAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.authService.checkUserExists(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Generate and send OTP
    await this.otpService.generateAndSendOtp(registerDto.email, 'REGISTER');
    return ResponseUtil.success(
      { email: registerDto.email },
      'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và xác thực.',
    );
  }

  @Public()
  @Post('verify-otp')
  async verifyOtpAndRegister(@Body() registerWithOtpDto: RegisterWithOtpDto) {
    // Verify OTP first (will throw exception if invalid)
    await this.otpService.verifyOtp(
      registerWithOtpDto.email,
      registerWithOtpDto.otpCode,
      'REGISTER',
    );

    // If OTP is valid, proceed with registration
    const registerDto: RegisterDto = {
      firstName: registerWithOtpDto.firstName,
      lastName: registerWithOtpDto.lastName,
      email: registerWithOtpDto.email,
      password: registerWithOtpDto.password,
      phone: registerWithOtpDto.phone,
    };

    const result = await this.authService.register(registerDto);
    return ResponseUtil.success<AuthResponseDto>(result, 'Đăng ký thành công');
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseUtil.success<AuthResponseDto>(result, 'Đăng nhập thành công');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<any> {
    const userId = req.user.id;
    const profile = await this.authService.getProfile(userId);
    return ResponseUtil.success<UserProfileDto>(profile, 'Lấy thông tin thành công');
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    await this.otpService.generateAndSendOtp(body.email, 'REGISTER');
    return ResponseUtil.success(
      { email: body.email },
      'Mã OTP mới đã được gửi đến email của bạn',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    const profile = await this.authService.updateProfile(userId, updateProfileDto);
    return ResponseUtil.success<UserProfileDto>(profile, 'Cập nhật thông tin thành công');
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    await this.authService.changePassword(userId, changePasswordDto);
    return ResponseUtil.success(null, 'Đổi mật khẩu thành công');
  }
}

