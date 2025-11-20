import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentProviderService } from '../services/payment-provider.service';
import { CreatePaymentProviderDto } from '../dtos/request/create-payment-provider.dto';
import { UpdatePaymentProviderDto } from '../dtos/request/update-payment-provider.dto';
import { QueryPaymentProviderDto } from '../dtos/request/query-payment-provider.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('payment-providers')
export class PaymentProviderController {
  constructor(private readonly paymentProviderService: PaymentProviderService) {}

  // Công khai: Xem danh sách nhà cung cấp thanh toán
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryPaymentProviderDto) {
    return this.paymentProviderService.findAll(queryDto);
  }

  // Công khai: Xem chi tiết nhà cung cấp thanh toán
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentProviderService.findOne(id);
  }

  // Admin: Thêm nhà cung cấp thanh toán
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreatePaymentProviderDto) {
    return this.paymentProviderService.create(createDto);
  }

  // Admin: Cập nhật nhà cung cấp thanh toán
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentProviderDto,
  ) {
    return this.paymentProviderService.update(id, updateDto);
  }

  // Admin: Xóa nhà cung cấp thanh toán
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.paymentProviderService.delete(id);
  }
}

