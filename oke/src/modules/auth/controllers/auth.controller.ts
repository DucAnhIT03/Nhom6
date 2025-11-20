import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/request/register.dto';
import { LoginDto } from '../dtos/request/login.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { UserProfileDto } from '../dtos/response/user-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../../../common/decorators';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
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
}

