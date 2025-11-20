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
  Request,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/request/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/request/update-ticket.dto';
import { QueryTicketDto } from '../dtos/request/query-ticket.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // Tra cứu vé công khai (không cần đăng nhập)
  @Get('lookup')
  @Public()
  async lookupTicket(
    @Query('ticketCode') ticketCode: string,
    @Query('phone') phone: string,
  ) {
    return this.ticketService.lookupTicket(ticketCode, phone);
  }

  // Admin: Xem tất cả vé
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async findAll(@Query() queryDto: QueryTicketDto) {
    return this.ticketService.findAll(queryDto);
  }

  // User: Xem vé của mình
  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_USER)
  async getMyTickets(@Request() req) {
    const userId = req.user.id;
    return this.ticketService.getUserTickets(userId);
  }

  // User hoặc Admin: Xem chi tiết vé
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const ticketResponse = await this.ticketService.findOne(id);
    // User chỉ có thể xem vé của chính mình, Admin có thể xem tất cả
    const isUser = req.user.roles?.some((r) => r.roleName === RoleName.ROLE_USER);
    if (isUser && ticketResponse?.data?.userId !== req.user.id) {
      throw new Error('Bạn không có quyền xem vé này');
    }
    return ticketResponse;
  }

  // User: Đặt vé
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_USER)
  async create(@Body() createDto: CreateTicketDto, @Request() req) {
    // Đảm bảo userId từ token
    createDto.userId = req.user.id;
    return this.ticketService.create(createDto);
  }

  // Admin: Cập nhật vé
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, updateDto);
  }

  // Admin: Xóa vé
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.delete(id);
  }

  // User: Hủy vé
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_USER)
  async cancelTicket(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Kiểm tra vé thuộc về user
    const ticketResponse = await this.ticketService.findOne(id);
    if (ticketResponse?.data?.userId !== req.user.id) {
      throw new Error('Bạn không có quyền hủy vé này');
    }
    return this.ticketService.cancelTicket(id);
  }
}
