import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';
import { CreateRouteDto } from '../dtos/request/create-route.dto';
import { UpdateRouteDto } from '../dtos/request/update-route.dto';
import { BulkUpdatePriceDto } from '../dtos/request/bulk-update-price.dto';
import { QueryRouteDto } from '../dtos/request/query-route.dto';
import { RouteResponseDto } from '../dtos/response/route-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Route } from '../../../shared/entities/route.entity';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepository: RouteRepository) {}

  async findAll(queryDto: QueryRouteDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.routeRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<RouteResponseDto> = {
      items: data.map((route) => this.mapToResponseDto(route)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách tuyến đường thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const route = await this.routeRepository.findOne(id);
    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến đường');
    }

    return ResponseUtil.success<RouteResponseDto>(
      this.mapToResponseDto(route),
      'Lấy thông tin tuyến đường thành công',
    );
  }

  async create(createDto: CreateRouteDto): Promise<any> {
    // Validate departure and arrival stations are different
    if (createDto.departureStationId === createDto.arrivalStationId) {
      throw new BadRequestException('Điểm đi và điểm đến không được trùng nhau');
    }

    const route = await this.routeRepository.create(createDto);
    return ResponseUtil.success<RouteResponseDto>(
      this.mapToResponseDto(route),
      'Tạo tuyến đường thành công',
    );
  }

  async update(id: number, updateDto: UpdateRouteDto): Promise<any> {
    const existing = await this.routeRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tuyến đường');
    }

    // Validate departure and arrival stations are different if both are provided
    if (
      updateDto.departureStationId !== undefined &&
      updateDto.arrivalStationId !== undefined &&
      updateDto.departureStationId === updateDto.arrivalStationId
    ) {
      throw new BadRequestException('Điểm đi và điểm đến không được trùng nhau');
    }

    const route = await this.routeRepository.update(id, updateDto);
    return ResponseUtil.success<RouteResponseDto>(
      this.mapToResponseDto(route),
      'Cập nhật tuyến đường thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.routeRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tuyến đường');
    }

    await this.routeRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa tuyến đường thành công');
  }

  async bulkUpdatePrice(bulkUpdateDto: BulkUpdatePriceDto): Promise<any> {
    // Validate: Phải có ít nhất một điều kiện lọc
    if (
      !bulkUpdateDto.busCompanyId &&
      !bulkUpdateDto.routeIds?.length &&
      !bulkUpdateDto.busId &&
      !bulkUpdateDto.busIds?.length &&
      !bulkUpdateDto.departureStationId &&
      !bulkUpdateDto.arrivalStationId
    ) {
      throw new BadRequestException(
        'Phải có ít nhất một điều kiện lọc (nhà xe, tuyến đường, loại xe, điểm đi, hoặc điểm đến)',
      );
    }

    const filters = {
      busCompanyId: bulkUpdateDto.busCompanyId,
      routeIds: bulkUpdateDto.routeIds,
      busId: bulkUpdateDto.busId,
      busIds: bulkUpdateDto.busIds,
      departureStationId: bulkUpdateDto.departureStationId,
      arrivalStationId: bulkUpdateDto.arrivalStationId,
    };

    const result = await this.routeRepository.bulkUpdatePrice(
      filters,
      bulkUpdateDto.newPrice,
    );

    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy tuyến đường nào phù hợp với điều kiện lọc');
    }

    return ResponseUtil.success(
      {
        affected: result.affected,
        routeIds: result.routeIds,
        newPrice: bulkUpdateDto.newPrice,
      },
      `Cập nhật giá vé thành công cho ${result.affected} tuyến đường`,
    );
  }

  private mapToResponseDto(route: Route): RouteResponseDto {
    return {
      id: route.id,
      departureStationId: route.departureStationId,
      arrivalStationId: route.arrivalStationId,
      busCompanyId: route.busCompanyId,
      price: route.price,
      duration: route.duration,
      distance: route.distance,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
      departureStation: route.departureStation
        ? {
            id: route.departureStation.id,
            name: route.departureStation.name,
            location: route.departureStation.location,
          }
        : undefined,
      arrivalStation: route.arrivalStation
        ? {
            id: route.arrivalStation.id,
            name: route.arrivalStation.name,
            location: route.arrivalStation.location,
          }
        : undefined,
      busCompany: route.busCompany
        ? {
            id: route.busCompany.id,
            companyName: route.busCompany.companyName,
            image: route.busCompany.image,
            descriptions: route.busCompany.descriptions,
          }
        : undefined,
    };
  }
}
