import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SeatTypePriceRepository } from '../repositories/seat-type-price.repository';
import { RouteRepository } from '../../route/repositories/route.repository';
import { UpsertSeatTypePriceDto } from '../dtos/request/upsert-seat-type-price.dto';
import { QuerySeatTypePriceDto } from '../dtos/request/query-seat-type-price.dto';
import { SeatTypePriceResponseDto } from '../dtos/response/seat-type-price-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { BulkApplySeatTypePriceDto } from '../dtos/request/bulk-apply-seat-type-price.dto';
import { SeatTypePrice } from '../../../shared/entities/seat-type-price.entity';

@Injectable()
export class SeatTypePriceService {
  constructor(
    private readonly seatTypePriceRepository: SeatTypePriceRepository,
    private readonly routeRepository: RouteRepository,
  ) {}

  private toResponse(
    entities: SeatTypePrice[],
  ): SeatTypePriceResponseDto[] {
    return entities.map((item) => SeatTypePriceResponseDto.fromEntity(item));
  }

  async find(query: QuerySeatTypePriceDto) {
    const queryBuilder =
      this.seatTypePriceRepository.createQueryBuilder('price');

    queryBuilder
      .leftJoinAndSelect('price.route', 'route', 'route.deletedAt IS NULL')
      .orderBy('price.seatType', 'ASC');

    if (query.routeId) {
      queryBuilder.andWhere('price.routeId = :routeId', {
        routeId: query.routeId,
      });
    }

    if (query.companyId) {
      queryBuilder.andWhere('route.busCompanyId = :companyId', {
        companyId: query.companyId,
      });
    }

    const items = await queryBuilder.getMany();
    return ResponseUtil.success(this.toResponse(items));
  }

  async upsert(dto: UpsertSeatTypePriceDto) {
    const route = await this.routeRepository.findOne(dto.routeId);
    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến đường');
    }

    if (!dto.seatTypePrices?.length) {
      throw new BadRequestException('Danh sách giá ghế không được để trống');
    }

    await this.seatTypePriceRepository.upsertForRoute(
      dto.routeId,
      dto.seatTypePrices,
    );

    const items = await this.seatTypePriceRepository.findByRoute(dto.routeId);
    return ResponseUtil.success(
      this.toResponse(items),
      'Cập nhật giá vé theo loại thành công',
    );
  }

  async bulkApply(dto: BulkApplySeatTypePriceDto) {
    if (!dto.seatTypePrices?.length) {
      throw new BadRequestException('Danh sách giá ghế không được để trống');
    }

    let targetRouteIds = Array.from(new Set(dto.routeIds?.filter(Boolean) || []));

    if (!targetRouteIds.length) {
      if (
        !dto.companyIds?.length ||
        !dto.departureStationId ||
        !dto.arrivalStationId
      ) {
        throw new BadRequestException(
          'Vui lòng chọn danh sách tuyến hoặc cung cấp nhà xe cùng tuyến đường',
        );
      }

      const routes = await this.routeRepository.findByCompaniesAndStations(
        dto.companyIds,
        dto.departureStationId,
        dto.arrivalStationId,
      );

      if (!routes.length) {
        throw new NotFoundException('Không tìm thấy tuyến đường phù hợp');
      }
      targetRouteIds = routes.map((route) => route.id);
    }

    for (const routeId of targetRouteIds) {
      await this.seatTypePriceRepository.upsertForRoute(
        routeId,
        dto.seatTypePrices,
      );
    }

    const items = await this.seatTypePriceRepository.findByRoutes(
      targetRouteIds,
    );

    return ResponseUtil.success(
      {
        routeIds: targetRouteIds,
        prices: this.toResponse(items),
      },
      `Đã áp dụng giá vé cho ${targetRouteIds.length} tuyến`,
    );
  }
}


