import { Controller, Post, Body, Get, Put, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { RegisterDto } from '../dtos/request/register.dto';
import { RegisterWithOtpDto } from '../dtos/request/register-with-otp.dto';
import { LoginDto } from '../dtos/request/login.dto';
import { VerifyOtpDto } from '../dtos/request/verify-otp.dto';
import { UpdateUserStatusDto } from '../dtos/request/update-user-status.dto';
import { CreateAdminDto } from '../dtos/request/create-admin.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { UserProfileDto } from '../dtos/response/user-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../../../common/decorators';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Controller('admin/auth')
export class AdminAuthController {
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

    // Generate and send OTP for admin registration
    await this.otpService.generateAndSendOtp(registerDto.email, 'REGISTER_ADMIN');
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
      'REGISTER_ADMIN',
    );

    // If OTP is valid, proceed with registration and assign ADMIN role
    const registerDto: RegisterDto = {
      firstName: registerWithOtpDto.firstName,
      lastName: registerWithOtpDto.lastName,
      email: registerWithOtpDto.email,
      password: registerWithOtpDto.password,
      phone: registerWithOtpDto.phone,
    };

    const result = await this.authService.registerAdmin(registerDto);
    return ResponseUtil.success<AuthResponseDto>(result, 'Đăng ký admin thành công');
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.loginAdmin(loginDto);
    return ResponseUtil.success<AuthResponseDto>(result, 'Đăng nhập admin thành công');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<any> {
    const userId = req.user.id;
    const profile = await this.authService.getProfile(userId);
    return ResponseUtil.success<UserProfileDto>(profile, 'Lấy thông tin admin thành công');
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    await this.otpService.generateAndSendOtp(body.email, 'REGISTER_ADMIN');
    return ResponseUtil.success(
      { email: body.email },
      'Mã OTP mới đã được gửi đến email của bạn',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers() {
    const users = await this.authService.getAllUsers();
    return ResponseUtil.success(users, 'Lấy danh sách người dùng thành công');
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    const result = await this.authService.updateUserStatus(userId, updateStatusDto);
    const message = updateStatusDto.status === 'BLOCKED' 
      ? 'Khóa tài khoản thành công' 
      : 'Mở khóa tài khoản thành công';
    return ResponseUtil.success<UserProfileDto>(result, message);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    // Check if user already exists
    const existingUser = await this.authService.checkUserExists(createAdminDto.email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Create admin without OTP verification (only for existing admins)
    const registerDto: RegisterDto = {
      firstName: createAdminDto.firstName,
      lastName: createAdminDto.lastName,
      email: createAdminDto.email,
      password: createAdminDto.password,
      phone: createAdminDto.phone,
    };

    const result = await this.authService.registerAdmin(registerDto);
    return ResponseUtil.success<AuthResponseDto>(result, 'Tạo tài khoản admin thành công');
  }
}

