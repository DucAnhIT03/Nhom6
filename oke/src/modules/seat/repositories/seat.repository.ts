import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from '../../../shared/entities/seat.entity';
import { CreateSeatDto } from '../dtos/request/create-seat.dto';
import { UpdateSeatDto } from '../dtos/request/update-seat.dto';
import { QuerySeatDto } from '../dtos/request/query-seat.dto';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async findAll(queryDto: QuerySeatDto): Promise<{ data: Seat[]; total: number }> {
    const { page = 1, limit = 10, busId, seatType, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.seatRepository
      .createQueryBuilder('seat')
      .leftJoinAndSelect('seat.bus', 'bus');

    if (busId) {
      queryBuilder.andWhere('seat.busId = :busId', { busId });
    }

    if (seatType) {
      queryBuilder.andWhere('seat.seatType = :seatType', { seatType });
    }

    if (status) {
      queryBuilder.andWhere('seat.status = :status', { status });
    }

    queryBuilder.skip(skip).take(limit).orderBy('seat.seatNumber', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findByBusId(busId: number): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { busId },
      relations: ['bus'],
      order: { seatNumber: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Seat | null> {
    return this.seatRepository.findOne({
      where: { id },
      relations: ['bus'],
    });
  }

  async create(createDto: CreateSeatDto): Promise<Seat> {
    const seat = this.seatRepository.create(createDto);
    const saved = await this.seatRepository.save(seat);
    return saved;
  }

  async createMany(createDtos: CreateSeatDto[]): Promise<Seat[]> {
    const seats = this.seatRepository.create(createDtos);
    return this.seatRepository.save(seats);
  }

  async update(id: number, updateDto: UpdateSeatDto): Promise<Seat> {
    await this.seatRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy ghế sau khi cập nhật');
    }
    return updated;
  }

  async updateMany(updates: Array<{ id: number; data: UpdateSeatDto }>): Promise<Seat[]> {
    const updatedSeats: Seat[] = [];
    
    for (const { id, data } of updates) {
      await this.seatRepository.update(id, data);
      const updated = await this.findOne(id);
      if (updated) {
        updatedSeats.push(updated);
      }
    }
    
    return updatedSeats;
  }

  async delete(id: number): Promise<void> {
    await this.seatRepository.delete(id);
  }

  async deleteByBusId(busId: number): Promise<number> {
    const result = await this.seatRepository.delete({ busId });
    return result.affected || 0;
  }
}

