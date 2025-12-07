import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../../shared/entities/ticket.entity';
import { CreateTicketDto } from '../dtos/request/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/request/update-ticket.dto';
import { QueryTicketDto } from '../dtos/request/query-ticket.dto';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findAll(queryDto: QueryTicketDto): Promise<{ data: Ticket[]; total: number }> {
    const { page = 1, limit = 10, userId, scheduleId, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.schedule', 'schedule')
      .leftJoinAndSelect('ticket.seat', 'seat');

    if (userId) {
      queryBuilder.andWhere('ticket.userId = :userId', { userId });
    }

    if (scheduleId) {
      queryBuilder.andWhere('ticket.scheduleId = :scheduleId', { scheduleId });
    }

    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    queryBuilder.skip(skip).take(limit).orderBy('ticket.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Ticket | null> {
    return this.ticketRepository.findOne({
      where: { id },
      relations: ['user', 'schedule', 'seat'],
    });
  }

  async create(createDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createDto,
      departureTime: new Date(createDto.departureTime),
      arrivalTime: new Date(createDto.arrivalTime),
      ticketCode: createDto.ticketCode,
    });
    return this.ticketRepository.save(ticket);
  }

  async update(id: number, updateDto: UpdateTicketDto): Promise<Ticket> {
    await this.ticketRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy vé sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.ticketRepository.delete(id);
  }

  async findByUserId(userId: number): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.schedule', 'schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('route.departureStation', 'departureStation')
      .leftJoinAndSelect('route.arrivalStation', 'arrivalStation')
      .leftJoinAndSelect('schedule.bus', 'bus')
      .leftJoinAndSelect('bus.company', 'company')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('ticket.userId = :userId', { userId })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async findByTicketCodeAndPhone(ticketCode: string, phone: string): Promise<Ticket | null> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.schedule', 'schedule')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('ticket.ticketCode = :ticketCode', { ticketCode })
      .andWhere('user.phone = :phone', { phone })
      .getOne();
  }
}
