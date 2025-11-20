import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from '../../../shared/entities/bus.entity';
import { CreateBusDto } from '../dtos/request/create-bus.dto';
import { UpdateBusDto } from '../dtos/request/update-bus.dto';
import { QueryBusDto } from '../dtos/request/query-bus.dto';

@Injectable()
export class BusRepository {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async findAll(queryDto: QueryBusDto): Promise<{ data: Bus[]; total: number }> {
    const { page = 1, limit = 10, search, companyId } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.company', 'company');

    if (search) {
      queryBuilder.andWhere(
        '(bus.name LIKE :search OR bus.descriptions LIKE :search OR bus.licensePlate LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (companyId) {
      queryBuilder.andWhere('bus.companyId = :companyId', { companyId });
    }

    queryBuilder.skip(skip).take(limit).orderBy('bus.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Bus | null> {
    return this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.company', 'company', 'company.deletedAt IS NULL')
      .where('bus.id = :id', { id })
      .andWhere('bus.deletedAt IS NULL')
      .getOne();
  }

  async create(createDto: CreateBusDto): Promise<Bus> {
    const bus = this.busRepository.create({
      ...createDto,
      floors: createDto.floors || 2, // Mặc định 2 tầng
    });
    return this.busRepository.save(bus);
  }

  async update(id: number, updateDto: UpdateBusDto): Promise<Bus> {
    await this.busRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy xe sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const queryRunner = this.busRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xóa quan hệ xe - bến
      await queryRunner.query('DELETE FROM bus_station WHERE bus_id = ?', [id]);
      // Xóa ghế thuộc xe này
      await queryRunner.query('DELETE FROM seats WHERE bus_id = ?', [id]);
      // Xóa lịch trình nếu có
      await queryRunner.query('DELETE FROM schedules WHERE bus_id = ?', [id]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.busRepository.delete(id);
  }
}

