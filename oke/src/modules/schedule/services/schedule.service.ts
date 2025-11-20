import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/request/create-schedule.dto';
import { UpdateScheduleDto } from '../dtos/request/update-schedule.dto';
import { QueryScheduleDto } from '../dtos/request/query-schedule.dto';
import { ScheduleResponseDto } from '../dtos/response/schedule-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { ScheduleStatus } from '../../../common/constraints';
import { RouteRepository } from '../../route/repositories/route.repository';
import { BusRepository } from '../../bus/repositories/bus.repository';
import { BusStationRepository } from '../../bus-station/repositories/bus-station.repository';
import { StationRepository } from '../../station/repositories/station.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly routeRepository: RouteRepository,
    private readonly busRepository: BusRepository,
    private readonly busStationRepository: BusStationRepository,
    private readonly stationRepository: StationRepository,
  ) {}

  async findAll(queryDto: QueryScheduleDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.scheduleRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<ScheduleResponseDto> = {
      items: data.map((schedule) => this.mapToResponseDto(schedule)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(paginatedResult, 'Lấy danh sách lịch trình thành công');
  }

  async findOne(id: number): Promise<any> {
    const schedule = await this.scheduleRepository.findOne(id);
    if (!schedule) {
      throw new NotFoundException('Không tìm thấy lịch trình');
    }

    return ResponseUtil.success<ScheduleResponseDto>(
      this.mapToResponseDto(schedule),
      'Lấy thông tin lịch trình thành công',
    );
  }

  async create(createDto: CreateScheduleDto): Promise<any> {
    // Validate startDate and endDate
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    }

    // Validate departure time is within startDate and endDate range
    const departureTime = new Date(createDto.departureTime);
    const departureDate = new Date(departureTime);
    departureDate.setHours(0, 0, 0, 0);
    
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);

    if (departureDate < startDateOnly || departureDate > endDateOnly) {
      throw new BadRequestException(
        `Thời gian khởi hành phải nằm trong khoảng từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}`
      );
    }

    // Validate arrival time is after departure time
    const arrivalTime = new Date(createDto.arrivalTime);
    if (arrivalTime <= departureTime) {
      throw new BadRequestException('Thời gian đến nơi phải sau thời gian khởi hành');
    }

    // Validate bus belongs to the same company as the route
    const route = await this.routeRepository.findOne(createDto.routeId);
    const bus = await this.busRepository.findOne(createDto.busId);
    
    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến đường');
    }
    if (!bus) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    // Check if bus belongs to the same company as route
    if (bus.companyId !== route.busCompanyId) {
      throw new BadRequestException(
        'Xe phải thuộc cùng nhà xe với tuyến đường. Xe này thuộc nhà xe khác với tuyến đường đã chọn.',
      );
    }

    // Validate totalSeats matches bus capacity
    if (createDto.totalSeats > bus.capacity) {
      throw new BadRequestException(
        `Số ghế không được vượt quá sức chứa của xe (${bus.capacity} ghế)`,
      );
    }

    // Ensure bus is registered at departure & arrival stations
    await this.ensureBusAssignedToStation(route.departureStationId, route.busCompanyId, bus.id);
    if (route.arrivalStationId && route.arrivalStationId !== route.departureStationId) {
      await this.ensureBusAssignedToStation(route.arrivalStationId, route.busCompanyId, bus.id);
    }

    const schedule = await this.scheduleRepository.create(createDto);
    return ResponseUtil.success<ScheduleResponseDto>(
      this.mapToResponseDto(schedule),
      'Tạo lịch trình thành công',
    );
  }

  async update(id: number, updateDto: UpdateScheduleDto): Promise<any> {
    const existing = await this.scheduleRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy lịch trình');
    }

    // Validate startDate and endDate if provided
    const startDate = updateDto.startDate ? new Date(updateDto.startDate) : existing.startDate;
    const endDate = updateDto.endDate ? new Date(updateDto.endDate) : existing.endDate;
    
    if (endDate < startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    }

    // Validate departure time is within startDate and endDate range if provided
    if (updateDto.departureTime) {
      const departureTime = new Date(updateDto.departureTime);
      const departureDate = new Date(departureTime);
      departureDate.setHours(0, 0, 0, 0);
      
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      
      const endDateOnly = new Date(endDate);
      endDateOnly.setHours(0, 0, 0, 0);

      if (departureDate < startDateOnly || departureDate > endDateOnly) {
        throw new BadRequestException(
          `Thời gian khởi hành phải nằm trong khoảng từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}`
        );
      }
    }

    // Validate times if provided
    if (updateDto.departureTime && updateDto.arrivalTime) {
      const departureTime = new Date(updateDto.departureTime);
      const arrivalTime = new Date(updateDto.arrivalTime);
      if (arrivalTime <= departureTime) {
        throw new BadRequestException('Thời gian đến nơi phải sau thời gian khởi hành');
      }
    }

    // Validate bus and route if being updated
    const routeId = updateDto.routeId || existing.routeId;
    const busId = updateDto.busId || existing.busId;

    if (updateDto.routeId || updateDto.busId) {
      const route = await this.routeRepository.findOne(routeId);
      const bus = await this.busRepository.findOne(busId);

      if (route && bus) {
        // Check if bus belongs to the same company as route
        if (bus.companyId !== route.busCompanyId) {
          throw new BadRequestException(
            'Xe phải thuộc cùng nhà xe với tuyến đường. Xe này thuộc nhà xe khác với tuyến đường đã chọn.',
          );
        }

        await this.ensureBusAssignedToStation(route.departureStationId, route.busCompanyId, bus.id);
        if (route.arrivalStationId && route.arrivalStationId !== route.departureStationId) {
          await this.ensureBusAssignedToStation(route.arrivalStationId, route.busCompanyId, bus.id);
        }
      }

      // Validate totalSeats if being updated
      if (updateDto.totalSeats && bus) {
        if (updateDto.totalSeats > bus.capacity) {
          throw new BadRequestException(
            `Số ghế không được vượt quá sức chứa của xe (${bus.capacity} ghế)`,
          );
        }
      }
    }

    const schedule = await this.scheduleRepository.update(id, updateDto);
    return ResponseUtil.success<ScheduleResponseDto>(
      this.mapToResponseDto(schedule),
      'Cập nhật lịch trình thành công',
    );
  }

  async delete(id: number): Promise<any> {
    await this.scheduleRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa lịch trình thành công');
  }

  async updateAvailableSeats(id: number, seatsToBook: number): Promise<any> {
    const schedule = await this.scheduleRepository.updateAvailableSeats(id, seatsToBook);
    return ResponseUtil.success<ScheduleResponseDto>(
      this.mapToResponseDto(schedule),
      'Cập nhật số ghế trống thành công',
    );
  }

  async findUpcomingSchedules(limit: number = 10): Promise<any> {
    const schedules = await this.scheduleRepository.findUpcomingSchedules(limit);
    return ResponseUtil.success(
      schedules.map((s) => this.mapToResponseDto(s)),
      'Lấy danh sách lịch trình sắp tới thành công',
    );
  }

  async findByRouteAndDate(routeId: number, date: string): Promise<any> {
    const schedules = await this.scheduleRepository.findByRouteAndDate(routeId, date);
    return ResponseUtil.success(
      schedules.map((s) => this.mapToResponseDto(s)),
      'Lấy lịch trình theo tuyến và ngày thành công',
    );
  }

  async cancelSchedule(id: number): Promise<any> {
    const schedule = await this.scheduleRepository.update(id, {
      status: ScheduleStatus.CANCELLED,
    });
    return ResponseUtil.success<ScheduleResponseDto>(
      this.mapToResponseDto(schedule),
      'Hủy lịch trình thành công',
    );
  }

  private async ensureBusAssignedToStation(
    stationId: number,
    busCompanyId: number,
    busId: number,
  ): Promise<void> {
    if (!stationId || !busId) return;

    const station = await this.stationRepository.findOne(stationId);
    if (!station) {
      throw new BadRequestException('Bến xe đã bị xóa hoặc không tồn tại');
    }

    const existingStationCompanies = await this.busStationRepository.getCompaniesByStation(stationId);
    if (
      existingStationCompanies.length > 0 &&
      !existingStationCompanies.includes(busCompanyId)
    ) {
      throw new BadRequestException(
        `Bến ${station.name} không thuộc nhà xe của tuyến, không thể tự động thêm xe.`,
      );
    }

    try {
      await this.busStationRepository.addBusToStation(stationId, busId);
    } catch (error: any) {
      const message = error?.message || '';
      if (message.includes('Xe đã được thêm vào bến xe này')) {
        return;
      }
      throw error;
    }
  }

  private mapToResponseDto(schedule: any): ScheduleResponseDto {
    return {
      id: schedule.id,
      routeId: schedule.routeId,
      busId: schedule.busId,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      availableSeat: schedule.availableSeat,
      totalSeats: schedule.totalSeats,
      status: schedule.status,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      // Include relations if available
      route: schedule.route,
      bus: schedule.bus,
    };
  }
}
