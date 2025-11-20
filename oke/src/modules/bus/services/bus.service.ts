import { Injectable, NotFoundException } from '@nestjs/common';
import { BusRepository } from '../repositories/bus.repository';
import { CreateBusDto } from '../dtos/request/create-bus.dto';
import { UpdateBusDto } from '../dtos/request/update-bus.dto';
import { QueryBusDto } from '../dtos/request/query-bus.dto';
import { BusResponseDto } from '../dtos/response/bus-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Bus } from '../../../shared/entities/bus.entity';

@Injectable()
export class BusService {
  constructor(private readonly busRepository: BusRepository) {}

  async findAll(queryDto: QueryBusDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.busRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<BusResponseDto> = {
      items: data.map((bus) => this.mapToResponseDto(bus)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách xe thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const bus = await this.busRepository.findOne(id);
    if (!bus) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    return ResponseUtil.success<BusResponseDto>(
      this.mapToResponseDto(bus),
      'Lấy thông tin xe thành công',
    );
  }

  async create(createDto: CreateBusDto): Promise<any> {
    const bus = await this.busRepository.create(createDto);
    return ResponseUtil.success<BusResponseDto>(
      this.mapToResponseDto(bus),
      'Tạo xe thành công',
    );
  }

  async update(id: number, updateDto: UpdateBusDto): Promise<any> {
    const existing = await this.busRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    const bus = await this.busRepository.update(id, updateDto);
    return ResponseUtil.success<BusResponseDto>(
      this.mapToResponseDto(bus),
      'Cập nhật xe thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.busRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    await this.busRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa xe thành công');
  }

  private mapToResponseDto(bus: Bus): BusResponseDto {
    return {
      id: bus.id,
      name: bus.name,
      descriptions: bus.descriptions,
      licensePlate: bus.licensePlate,
      capacity: bus.capacity,
      floors: bus.floors,
      companyId: bus.companyId,
      createdAt: bus.createdAt,
      updatedAt: bus.updatedAt,
      company: bus.company
        ? {
            id: bus.company.id,
            companyName: bus.company.companyName,
          }
        : undefined,
    };
  }
}


