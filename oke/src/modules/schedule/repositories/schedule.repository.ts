import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Schedule } from '../../../shared/entities/schedule.entity';
import { CreateScheduleDto } from '../dtos/request/create-schedule.dto';
import { UpdateScheduleDto } from '../dtos/request/update-schedule.dto';
import { QueryScheduleDto } from '../dtos/request/query-schedule.dto';
import { ScheduleStatus } from '../../../common/constraints';

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(queryDto: QueryScheduleDto): Promise<{ data: Schedule[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      routeId,
      busId,
      departureDate,
      status,
      departureStationId,
      arrivalStationId,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('route.departureStation', 'departureStation')
      .leftJoinAndSelect('route.arrivalStation', 'arrivalStation')
      .leftJoinAndSelect('schedule.bus', 'bus')
      .leftJoinAndSelect('bus.company', 'company');

    // Filter by routeId
    if (routeId) {
      queryBuilder.andWhere('schedule.routeId = :routeId', { routeId });
    }

    // Filter by busId
    if (busId) {
      queryBuilder.andWhere('schedule.busId = :busId', { busId });
    }

    // Filter by departure date
    if (departureDate) {
      const startDate = new Date(departureDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(departureDate);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('schedule.departureTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    // Filter by departure station
    if (departureStationId) {
      queryBuilder.andWhere('route.departureStationId = :departureStationId', {
        departureStationId,
      });
    }

    // Filter by arrival station
    if (arrivalStationId) {
      queryBuilder.andWhere('route.arrivalStationId = :arrivalStationId', {
        arrivalStationId,
      });
    }

    // Order by departure time
    queryBuilder.orderBy('schedule.departureTime', 'ASC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    return { data, total };
  }

  async findOne(id: number): Promise<Schedule | null> {
    return await this.scheduleRepository.findOne({
      where: { id },
      relations: ['route', 'route.departureStation', 'route.arrivalStation', 'bus', 'bus.company'],
    });
  }

  async create(createDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create({
      routeId: createDto.routeId,
      busId: createDto.busId,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      departureTime: new Date(createDto.departureTime),
      arrivalTime: new Date(createDto.arrivalTime),
      availableSeat: createDto.totalSeats, // Initially all seats are available
      totalSeats: createDto.totalSeats,
      status: createDto.status || ScheduleStatus.AVAILABLE,
    });

    return await this.scheduleRepository.save(schedule);
  }

  async update(id: number, updateDto: UpdateScheduleDto): Promise<Schedule> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy lịch trình');
    }

    const updateData: any = {};
    if (updateDto.routeId) updateData.routeId = updateDto.routeId;
    if (updateDto.busId) updateData.busId = updateDto.busId;
    if (updateDto.startDate) updateData.startDate = new Date(updateDto.startDate);
    if (updateDto.endDate) updateData.endDate = new Date(updateDto.endDate);
    if (updateDto.departureTime) updateData.departureTime = new Date(updateDto.departureTime);
    if (updateDto.arrivalTime) updateData.arrivalTime = new Date(updateDto.arrivalTime);
    if (updateDto.availableSeat !== undefined) updateData.availableSeat = updateDto.availableSeat;
    if (updateDto.totalSeats) updateData.totalSeats = updateDto.totalSeats;
    if (updateDto.status) updateData.status = updateDto.status;

    // Auto-update status based on available seats
    const availableSeat = updateDto.availableSeat !== undefined ? updateDto.availableSeat : existing.availableSeat;
    if (availableSeat === 0) {
      updateData.status = ScheduleStatus.FULL;
    } else if (existing.status === ScheduleStatus.FULL && availableSeat > 0) {
      updateData.status = ScheduleStatus.AVAILABLE;
    }

    await this.scheduleRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Schedule not found after update');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy lịch trình');
    }
    await this.scheduleRepository.softDelete(id);
  }

  async updateAvailableSeats(id: number, seatsToBook: number): Promise<Schedule> {
    const schedule = await this.findOne(id);
    if (!schedule) {
      throw new NotFoundException('Không tìm thấy lịch trình');
    }

    const newAvailableSeats = schedule.availableSeat - seatsToBook;
    if (newAvailableSeats < 0) {
      throw new Error('Không đủ ghế trống');
    }

    return this.update(id, {
      availableSeat: newAvailableSeats,
      status: newAvailableSeats === 0 ? ScheduleStatus.FULL : (schedule.status as ScheduleStatus),
    });
  }

  async findUpcomingSchedules(limit: number = 10): Promise<Schedule[]> {
    const now = new Date();
    return await this.scheduleRepository.find({
      where: {
        departureTime: MoreThanOrEqual(now),
        status: ScheduleStatus.AVAILABLE,
      },
      relations: ['route', 'route.departureStation', 'route.arrivalStation', 'bus', 'bus.company'],
      order: {
        departureTime: 'ASC',
      },
      take: limit,
    });
  }

  async findByRouteAndDate(routeId: number, date: string): Promise<Schedule[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return await this.scheduleRepository.find({
      where: {
        routeId,
        departureTime: Between(startDate, endDate),
        status: ScheduleStatus.AVAILABLE as any, // Only available schedules
      },
      relations: ['route', 'route.departureStation', 'route.arrivalStation', 'bus', 'bus.company'],
      order: {
        departureTime: 'ASC',
      },
    });
  }
}

