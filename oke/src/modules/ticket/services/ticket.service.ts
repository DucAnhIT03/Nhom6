import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/request/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/request/update-ticket.dto';
import { QueryTicketDto } from '../dtos/request/query-ticket.dto';
import { TicketResponseDto } from '../dtos/response/ticket-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Ticket } from '../../../shared/entities/ticket.entity';
import { TicketStatus, SeatType } from '../../../common/constraints';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async findAll(queryDto: QueryTicketDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.ticketRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<TicketResponseDto> = {
      items: data.map((ticket) => this.mapToResponseDto(ticket)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách vé thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const ticket = await this.ticketRepository.findOne(id);
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    return ResponseUtil.success<TicketResponseDto>(
      this.mapToResponseDto(ticket),
      'Lấy thông tin vé thành công',
    );
  }

  async create(createDto: CreateTicketDto): Promise<any> {
    // Validate departure time is in the future
    const departureTime = new Date(createDto.departureTime);
    const now = new Date();
    if (departureTime <= now) {
      throw new BadRequestException('Thời gian khởi hành phải trong tương lai');
    }

    // Validate arrival time is after departure time
    const arrivalTime = new Date(createDto.arrivalTime);
    if (arrivalTime <= departureTime) {
      throw new BadRequestException('Thời gian đến nơi phải sau thời gian khởi hành');
    }

    // Generate ticket code if not provided
    if (!createDto.ticketCode) {
      createDto.ticketCode = this.generateTicketCode();
    }

    const ticket = await this.ticketRepository.create(createDto);
    return ResponseUtil.success<TicketResponseDto>(
      this.mapToResponseDto(ticket),
      'Tạo vé thành công',
    );
  }

  private generateTicketCode(): string {
    // Generate unique ticket code: TICKET + timestamp + random
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TICKET${timestamp}${random}`;
  }

  async update(id: number, updateDto: UpdateTicketDto): Promise<any> {
    const existing = await this.ticketRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    const ticket = await this.ticketRepository.update(id, updateDto);
    return ResponseUtil.success<TicketResponseDto>(
      this.mapToResponseDto(ticket),
      'Cập nhật vé thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.ticketRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    await this.ticketRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa vé thành công');
  }

  async cancelTicket(id: number): Promise<any> {
    const ticket = await this.ticketRepository.update(id, {
      status: TicketStatus.CANCELLED,
    });
    return ResponseUtil.success<TicketResponseDto>(
      this.mapToResponseDto(ticket),
      'Hủy vé thành công',
    );
  }

  async getUserTickets(userId: number): Promise<any> {
    const tickets = await this.ticketRepository.findByUserId(userId);
    return ResponseUtil.success(
      tickets.map((ticket) => this.mapToResponseDto(ticket)),
      'Lấy danh sách vé của người dùng thành công',
    );
  }

  async lookupTicket(ticketCode: string, phone: string): Promise<any> {
    const ticket = await this.ticketRepository.findByTicketCodeAndPhone(ticketCode, phone);
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé với mã vé và số điện thoại này');
    }

    return ResponseUtil.success<TicketResponseDto>(
      this.mapToResponseDto(ticket),
      'Tra cứu vé thành công',
    );
  }

  private mapToResponseDto(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      userId: ticket.userId,
      scheduleId: ticket.scheduleId,
      seatId: ticket.seatId,
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      seatType: ticket.seatType as SeatType,
      price: ticket.price,
      status: ticket.status as TicketStatus,
      ticketCode: ticket.ticketCode,
      user: ticket.user
        ? {
            id: ticket.user.id,
            firstName: ticket.user.firstName,
            lastName: ticket.user.lastName,
            email: ticket.user.email,
          }
        : undefined,
      schedule: ticket.schedule
        ? {
            id: ticket.schedule.id,
            departureTime: ticket.schedule.departureTime,
            arrivalTime: ticket.schedule.arrivalTime,
            route: ticket.schedule.route,
            bus: ticket.schedule.bus,
          }
        : undefined,
      seat: ticket.seat
        ? {
            id: ticket.seat.id,
            seatNumber: ticket.seat.seatNumber,
            seatType: ticket.seat.seatType,
          }
        : undefined,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}



