import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const port = configService.get<number>('MAIL_PORT', 587);
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        
        // Validate required email configuration
        // Support both MAIL_PASS and MAIL_PASSWORD for backward compatibility
        const mailUser = configService.get<string>('MAIL_USER');
        const mailPassword = configService.get<string>('MAIL_PASSWORD') || configService.get<string>('MAIL_PASS');
        
        if (!mailUser || !mailPassword) {
          console.warn(
            '\n⚠️  WARNING: Email configuration is missing!\n' +
            'Please set MAIL_USER and MAIL_PASSWORD in your .env file.\n' +
            'For Gmail:\n' +
            '  1. Enable 2-Step Verification: https://myaccount.google.com/security\n' +
            '  2. Generate App Password: https://myaccount.google.com/apppasswords\n' +
            '  3. Use the App Password as MAIL_PASSWORD\n' +
            '  4. Copy .env.example to .env and fill in your email credentials\n\n' +
            'Email features (OTP, password reset) will not work until configured.\n'
          );
          // Use dummy values to allow app to start, but email will fail when sending
          // This allows other features to work while email is being configured
          const transportConfig: any = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: 'not-configured',
              pass: 'not-configured',
            },
          };
          return {
            transport: transportConfig,
            defaults: {
              from: '"Bus Booking System" <noreply@example.com>',
            },
            template: {
              dir: join(__dirname, 'templates'),
              adapter: new HandlebarsAdapter(),
              options: {
                strict: true,
              },
            },
          };
        }
        

        const secure = port === 465;
        
        const transportConfig: any = {
          host: configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
          port: port,
          secure: secure, // true for 465, false for 587
          auth: {
            user: mailUser,
            pass: mailPassword,
          },
        };


        if (port === 587 && nodeEnv !== 'production') {
          transportConfig.tls = {
            rejectUnauthorized: false,
          };
        }
        
        return {
          transport: transportConfig,
        defaults: {
          from: `"${configService.get<string>('MAIL_FROM_NAME', 'Bus Booking System')}" <${configService.get<string>('MAIL_FROM')}>`,
        },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}




