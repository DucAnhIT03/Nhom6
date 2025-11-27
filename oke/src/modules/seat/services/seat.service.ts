import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SeatRepository } from '../repositories/seat.repository';
import { CreateSeatDto } from '../dtos/request/create-seat.dto';
import { UpdateSeatDto } from '../dtos/request/update-seat.dto';
import { QuerySeatDto } from '../dtos/request/query-seat.dto';
import { BulkUpdateSeatDto } from '../dtos/request/bulk-update-seat.dto';
import { SeatResponseDto, SeatMapResponseDto } from '../dtos/response/seat-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Seat } from '../../../shared/entities/seat.entity';

@Injectable()
export class SeatService {
  constructor(private readonly seatRepository: SeatRepository) {}

  // Màu sắc cho từng loại ghế
  private getSeatColor(seatType: string, status: string, isHidden: boolean = false): string {
    if (isHidden) {
      return '#e5e7eb'; // Màu xám nhạt cho ghế bị ẩn
    }

    if (status === 'BOOKED') {
      return '#9ca3af'; // Màu xám cho ghế đã bán
    }

    switch (seatType) {
      case 'VIP':
        return '#fef08a'; // Màu vàng nhạt cho ghế VIP
      case 'DOUBLE':
      case 'LUXURY':
        return '#fbcfe8'; // Màu hồng cho ghế đôi
      case 'STANDARD':
      default:
        return '#bfdbfe'; // Màu xanh nhạt cho ghế thường
    }
  }

  async findAll(queryDto: QuerySeatDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.seatRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<SeatResponseDto> = {
      items: data.map((seat) => this.mapToResponseDto(seat)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách ghế thành công',
    );
  }

  async findByBusId(busId: number): Promise<any> {
    const seats = await this.seatRepository.findByBusId(busId);
    
    const seatMap: SeatMapResponseDto = {
      busId,
      busName: seats[0]?.bus?.name,
      seats: seats.map((seat) => this.mapToResponseDto(seat)),
      seatMap: {},
    };

    // Tạo map với màu sắc
    seats.forEach((seat) => {
      seatMap.seatMap[seat.seatNumber] = {
        seat: this.mapToResponseDto(seat),
        color: this.getSeatColor(seat.seatType, seat.status, seat.isHidden || false),
      };
    });

    // Thêm layout config từ bus nếu có
    if (seats[0]?.bus?.seatLayoutConfig) {
      (seatMap as any).layoutConfig = seats[0].bus.seatLayoutConfig;
    }

    return ResponseUtil.success(seatMap, 'Lấy sơ đồ ghế thành công');
  }

  async findOne(id: number): Promise<any> {
    const seat = await this.seatRepository.findOne(id);
    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    return ResponseUtil.success<SeatResponseDto>(
      this.mapToResponseDto(seat),
      'Lấy thông tin ghế thành công',
    );
  }

  async create(createDto: CreateSeatDto): Promise<any> {
    // Kiểm tra ghế đã tồn tại
    const existing = await this.seatRepository.findAll({
      busId: createDto.busId,
      page: 1,
      limit: 1000,
    });

    const duplicate = existing.data.find(
      (s) => s.seatNumber === createDto.seatNumber && s.busId === createDto.busId,
    );

    if (duplicate) {
      throw new BadRequestException('Số ghế đã tồn tại cho xe này');
    }

    const seat = await this.seatRepository.create(createDto);
    return ResponseUtil.success<SeatResponseDto>(
      this.mapToResponseDto(seat),
      'Tạo ghế thành công',
    );
  }

  async createMany(createDtos: CreateSeatDto[]): Promise<any> {
    if (!createDtos || createDtos.length === 0) {
      throw new BadRequestException('Danh sách ghế không được để trống');
    }

    // Validate và loại bỏ duplicate trong danh sách đầu vào
    const seen = new Set<string>();
    const uniqueDtos: CreateSeatDto[] = [];
    
    for (const dto of createDtos) {
      const key = `${dto.busId}-${dto.seatNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDtos.push(dto);
      }
    }

    if (uniqueDtos.length !== createDtos.length) {
      console.warn(`Phát hiện ${createDtos.length - uniqueDtos.length} ghế trùng lặp đã được loại bỏ`);
    }

    // Kiểm tra ghế đã tồn tại trong database
    const busId = uniqueDtos[0]?.busId;
    if (!busId) {
      throw new BadRequestException('BusId không hợp lệ');
    }

    const existingSeats = await this.seatRepository.findAll({
      busId,
      page: 1,
      limit: 10000,
    });

    // Lọc ra các ghế chưa tồn tại
    const newDtos = uniqueDtos.filter((dto) => {
      return !existingSeats.data.some(
        (s) => s.seatNumber === dto.seatNumber && s.busId === dto.busId,
      );
    });

    if (newDtos.length === 0) {
      throw new BadRequestException('Tất cả ghế đã tồn tại');
    }

    if (newDtos.length !== uniqueDtos.length) {
      console.warn(`${uniqueDtos.length - newDtos.length} ghế đã tồn tại, chỉ tạo ${newDtos.length} ghế mới`);
    }

    const seats = await this.seatRepository.createMany(newDtos);
    return ResponseUtil.success(
      seats.map((seat) => this.mapToResponseDto(seat)),
      `Tạo ${seats.length} ghế thành công`,
    );
  }

  async update(id: number, updateDto: UpdateSeatDto): Promise<any> {
    const existing = await this.seatRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    // Nếu cập nhật seatNumber, kiểm tra trùng
    if (updateDto.seatNumber && updateDto.seatNumber !== existing.seatNumber) {
      const existingSeats = await this.seatRepository.findAll({
        busId: existing.busId,
        page: 1,
        limit: 1000,
      });

      const duplicate = existingSeats.data.find(
        (s) => s.seatNumber === updateDto.seatNumber && s.id !== id,
      );

      if (duplicate) {
        throw new BadRequestException('Số ghế đã tồn tại cho xe này');
      }
    }

    const seat = await this.seatRepository.update(id, updateDto);
    return ResponseUtil.success<SeatResponseDto>(
      this.mapToResponseDto(seat),
      'Cập nhật ghế thành công',
    );
  }

  async updateMany(bulkUpdateDto: BulkUpdateSeatDto): Promise<any> {
    if (!bulkUpdateDto.seats || bulkUpdateDto.seats.length === 0) {
      throw new BadRequestException('Danh sách ghế cần cập nhật không được để trống');
    }

    // Validate tất cả các ghế tồn tại và kiểm tra trùng seatNumber
    const seatIds = bulkUpdateDto.seats.map((item) => item.id);
    const existingSeats = await Promise.all(
      seatIds.map((id) => this.seatRepository.findOne(id)),
    );

    const notFoundIds: number[] = [];
    existingSeats.forEach((seat, index) => {
      if (!seat) {
        notFoundIds.push(seatIds[index]);
      }
    });

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy các ghế với ID: ${notFoundIds.join(', ')}`,
      );
    }

    // Kiểm tra trùng seatNumber trong danh sách cập nhật
    const seatNumberUpdates = new Map<number, string>();
    for (const item of bulkUpdateDto.seats) {
      const existing = existingSeats.find((s) => s?.id === item.id);
      if (existing && item.data.seatNumber && item.data.seatNumber !== existing.seatNumber) {
        seatNumberUpdates.set(item.id, item.data.seatNumber);
      }
    }

    // Kiểm tra trùng seatNumber với các ghế khác
    for (const [id, newSeatNumber] of seatNumberUpdates.entries()) {
      const existing = existingSeats.find((s) => s?.id === id);
      if (existing) {
        const allSeats = await this.seatRepository.findAll({
          busId: existing.busId,
          page: 1,
          limit: 10000,
        });

        const duplicate = allSeats.data.find(
          (s) => s.seatNumber === newSeatNumber && s.id !== id && !seatIds.includes(s.id),
        );

        if (duplicate) {
          throw new BadRequestException(
            `Số ghế "${newSeatNumber}" đã tồn tại cho xe này (ghế ID: ${duplicate.id})`,
          );
        }

        // Kiểm tra trùng trong chính danh sách cập nhật
        const duplicateInUpdate = bulkUpdateDto.seats.find(
          (item) => item.data.seatNumber === newSeatNumber && item.id !== id,
        );
        if (duplicateInUpdate) {
          throw new BadRequestException(
            `Số ghế "${newSeatNumber}" bị trùng trong danh sách cập nhật`,
          );
        }
      }
    }

    // Thực hiện cập nhật
    const updates = bulkUpdateDto.seats.map((item) => ({
      id: item.id,
      data: item.data,
    }));

    const updatedSeats = await this.seatRepository.updateMany(updates);

    return ResponseUtil.success(
      updatedSeats.map((seat) => this.mapToResponseDto(seat)),
      `Cập nhật ${updatedSeats.length} ghế thành công`,
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.seatRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    await this.seatRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa ghế thành công');
  }

  async deleteByBusId(busId: number): Promise<any> {
    if (!busId) {
      throw new BadRequestException('BusId không hợp lệ');
    }
    const seats = await this.seatRepository.findByBusId(busId);
    if (!seats.length) {
      return ResponseUtil.success(
        { deleted: 0 },
        'Xe này hiện chưa có ghế để xóa',
      );
    }
    const deleted = await this.seatRepository.deleteByBusId(busId);
    return ResponseUtil.success(
      { deleted },
      `Đã xóa ${deleted} ghế khỏi xe`,
    );
  }

  private mapToResponseDto(seat: Seat): SeatResponseDto {
    return {
      id: seat.id,
      busId: seat.busId,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      status: seat.status,
      priceForSeatType: seat.priceForSeatType,
      isHidden: seat.isHidden || false,
      createdAt: seat.createdAt,
      updatedAt: seat.updatedAt,
      bus: seat.bus
        ? {
            id: seat.bus.id,
            name: seat.bus.name,
            licensePlate: seat.bus.licensePlate,
            capacity: seat.bus.capacity,
          }
        : undefined,
    };
  }
}







