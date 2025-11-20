import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthController } from './controllers/user-auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../../shared/entities/user.entity';
import { Role } from '../../shared/entities/role.entity';
import { OtpCode } from '../../shared/entities/otp.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Role, OtpCode]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        return {
          secret: configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserAuthController, AdminAuthController],
  providers: [AuthService, OtpService, AuthRepository, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, OtpService, JwtAuthGuard],
})
export class AuthModule {}

