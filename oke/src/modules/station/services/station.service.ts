import { Injectable, NotFoundException } from '@nestjs/common';
import { StationRepository } from '../repositories/station.repository';
import { CreateStationDto } from '../dtos/request/create-station.dto';
import { UpdateStationDto } from '../dtos/request/update-station.dto';
import { QueryStationDto } from '../dtos/request/query-station.dto';
import { StationResponseDto } from '../dtos/response/station-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Station } from '../../../shared/entities/station.entity';

@Injectable()
export class StationService {
  constructor(private readonly stationRepository: StationRepository) {}

  async findAll(queryDto: QueryStationDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.stationRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<StationResponseDto> = {
      items: data.map((station) => this.mapToResponseDto(station)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách bến xe thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const station = await this.stationRepository.findOne(id);
    if (!station) {
      throw new NotFoundException('Không tìm thấy bến xe');
    }

    return ResponseUtil.success<StationResponseDto>(
      this.mapToResponseDto(station),
      'Lấy thông tin bến xe thành công',
    );
  }

  async create(createDto: CreateStationDto): Promise<any> {
    const station = await this.stationRepository.create(createDto);
    return ResponseUtil.success<StationResponseDto>(
      this.mapToResponseDto(station),
      'Tạo bến xe thành công',
    );
  }

  async update(id: number, updateDto: UpdateStationDto): Promise<any> {
    const existing = await this.stationRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bến xe');
    }

    const station = await this.stationRepository.update(id, updateDto);
    return ResponseUtil.success<StationResponseDto>(
      this.mapToResponseDto(station),
      'Cập nhật bến xe thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.stationRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bến xe');
    }

    await this.stationRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa bến xe thành công');
  }

  private mapToResponseDto(station: Station): StationResponseDto {
    return {
      id: station.id,
      name: station.name,
      image: station.image,
      wallpaper: station.wallpaper,
      descriptions: station.descriptions,
      location: station.location,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };
  }
}

