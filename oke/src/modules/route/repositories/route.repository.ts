import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull } from 'typeorm';
import { Route } from '../../../shared/entities/route.entity';
import { CreateRouteDto } from '../dtos/request/create-route.dto';
import { UpdateRouteDto } from '../dtos/request/update-route.dto';
import { QueryRouteDto } from '../dtos/request/query-route.dto';

@Injectable()
export class RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async findAll(queryDto: QueryRouteDto): Promise<{ data: Route[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      departureStationId,
      arrivalStationId,
      minPrice,
      maxPrice,
      busCompanyId,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.departureStation', 'departureStation', 'departureStation.deletedAt IS NULL')
      .leftJoinAndSelect('route.arrivalStation', 'arrivalStation', 'arrivalStation.deletedAt IS NULL')
      .leftJoinAndSelect('route.busCompany', 'busCompany', 'busCompany.deletedAt IS NULL')
      .where('route.deletedAt IS NULL');

    if (departureStationId) {
      queryBuilder.andWhere('route.departureStationId = :departureStationId', {
        departureStationId,
      });
    }

    if (arrivalStationId) {
      queryBuilder.andWhere('route.arrivalStationId = :arrivalStationId', {
        arrivalStationId,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('route.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('route.price <= :maxPrice', { maxPrice });
    }

    if (busCompanyId) {
      queryBuilder.andWhere('route.busCompanyId = :busCompanyId', { busCompanyId });
    }

    queryBuilder
      .orderBy('route.createdAt', 'DESC')
      .addOrderBy('route.id', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Route | null> {
    return this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.departureStation', 'departureStation', 'departureStation.deletedAt IS NULL')
      .leftJoinAndSelect('route.arrivalStation', 'arrivalStation', 'arrivalStation.deletedAt IS NULL')
      .leftJoinAndSelect('route.busCompany', 'busCompany', 'busCompany.deletedAt IS NULL')
      .where('route.id = :id', { id })
      .andWhere('route.deletedAt IS NULL')
      .getOne();
  }

  async create(createDto: CreateRouteDto): Promise<Route> {
    const route = this.routeRepository.create({
      departureStationId: createDto.departureStationId,
      arrivalStationId: createDto.arrivalStationId,
      price: createDto.price ?? 0, // Mặc định là 0 nếu không có
      duration: createDto.duration,
      distance: createDto.distance,
      busCompanyId: createDto.busCompanyId,
    });
    const savedRoute = await this.routeRepository.save(route);
    // Load lại với relations để có đầy đủ thông tin
    const routeWithRelations = await this.findOne(savedRoute.id);
    return routeWithRelations || savedRoute;
  }

  async update(id: number, updateDto: UpdateRouteDto): Promise<Route> {
    await this.routeRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy tuyến đường sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.routeRepository.softDelete(id);
  }

  async bulkUpdatePrice(
    filters: {
      busCompanyId?: number;
      routeIds?: number[];
      busId?: number;
      busIds?: number[];
      departureStationId?: number;
      arrivalStationId?: number;
    },
    newPrice: number,
  ): Promise<{ affected: number; routeIds: number[] }> {
    const queryBuilder = this.routeRepository
      .createQueryBuilder('route')
      .where('route.deletedAt IS NULL');

    // Nếu có busId hoặc busIds, tìm các route thông qua schedule
    if (filters.busId) {
      queryBuilder
        .innerJoin('route.schedules', 'schedule', 'schedule.busId = :busId AND schedule.deletedAt IS NULL', {
          busId: filters.busId,
        })
        .distinct(true);
    } else if (filters.busIds && filters.busIds.length > 0) {
      queryBuilder
        .innerJoin('route.schedules', 'schedule', 'schedule.busId IN (:...busIds) AND schedule.deletedAt IS NULL', {
          busIds: filters.busIds,
        })
        .distinct(true);
    }

    if (filters.busCompanyId) {
      queryBuilder.andWhere('route.busCompanyId = :busCompanyId', {
        busCompanyId: filters.busCompanyId,
      });
    }

    if (filters.routeIds && filters.routeIds.length > 0) {
      queryBuilder.andWhere('route.id IN (:...routeIds)', {
        routeIds: filters.routeIds,
      });
    }

    if (filters.departureStationId) {
      queryBuilder.andWhere('route.departureStationId = :departureStationId', {
        departureStationId: filters.departureStationId,
      });
    }

    if (filters.arrivalStationId) {
      queryBuilder.andWhere('route.arrivalStationId = :arrivalStationId', {
        arrivalStationId: filters.arrivalStationId,
      });
    }

    // Lấy danh sách route IDs sẽ được cập nhật
    const routesToUpdate = await queryBuilder.select('route.id').getMany();
    const routeIds = routesToUpdate.map((r) => r.id);

    if (routeIds.length === 0) {
      return { affected: 0, routeIds: [] };
    }

    // Cập nhật giá vé
    const result = await this.routeRepository
      .createQueryBuilder()
      .update(Route)
      .set({ price: newPrice })
      .where('id IN (:...routeIds)', { routeIds })
      .andWhere('deletedAt IS NULL')
      .execute();

    return {
      affected: result.affected || 0,
      routeIds,
    };
  }

  async findByCompaniesAndStations(
    companyIds: number[],
    departureStationId: number,
    arrivalStationId: number,
  ): Promise<Route[]> {
    if (!companyIds.length) {
      return [];
    }

    return this.routeRepository.find({
      where: {
        busCompanyId: In(companyIds),
        departureStationId,
        arrivalStationId,
        deletedAt: IsNull(),
      },
    });
  }
}
