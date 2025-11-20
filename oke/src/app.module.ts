import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectModule } from './modules/object/object.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusCompanyModule } from './modules/bus-company/bus-company.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { BannerModule } from './modules/banner/banner.module';
import { UploadModule } from './modules/upload/upload.module';
import { MailModule } from './modules/mail/mail.module';
import { QueueModule } from './modules/queue/queue.module';
import { StationModule } from './modules/station/station.module';
import { BusStationModule } from './modules/bus-station/bus-station.module';
import { BusModule } from './modules/bus/bus.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { RouteModule } from './modules/route/route.module';
import { PaymentProviderModule } from './modules/payment-provider/payment-provider.module';
import { SeatModule } from './modules/seat/seat.module';
import { SeatTypePriceModule } from './modules/seat-type-price/seat-type-price.module';
import { PostModule } from './modules/post/post.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { getDatabaseConfig } from './shared/providers/database.provider';
import * as entities from './shared/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      entities.User,
      entities.Role,
      entities.BusCompany,
      entities.Bus,
      entities.Station,
      entities.BusStation,
      entities.Route,
      entities.Schedule,
      entities.Seat,
      entities.SeatTypePrice,
      entities.Post,
      entities.Ticket,
      entities.OtpCode,
      entities.Banner,
      entities.PaymentProvider,
    ]),
    ObjectModule,
    AuthModule,
    BusCompanyModule,
    ScheduleModule,
    BannerModule,
    UploadModule,
    MailModule,
    QueueModule,
    StationModule,
    BusStationModule,
    BusModule,
    TicketModule,
    RouteModule,
    PaymentProviderModule,
    SeatModule,
    SeatTypePriceModule,
    PostModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
