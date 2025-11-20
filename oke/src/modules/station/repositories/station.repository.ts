import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from '../../../shared/entities/station.entity';
import { CreateStationDto } from '../dtos/request/create-station.dto';
import { UpdateStationDto } from '../dtos/request/update-station.dto';
import { QueryStationDto } from '../dtos/request/query-station.dto';

@Injectable()
export class StationRepository {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async findAll(queryDto: QueryStationDto): Promise<{ data: Station[]; total: number }> {
    const { page = 1, limit = 10, search, location } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .where('station.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(station.name LIKE :search OR station.descriptions LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (location) {
      queryBuilder.andWhere('station.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    queryBuilder.skip(skip).take(limit).orderBy('station.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Station | null> {
    return this.stationRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateStationDto): Promise<Station> {
    const station = this.stationRepository.create(createDto);
    return this.stationRepository.save(station);
  }

  async update(id: number, updateDto: UpdateStationDto): Promise<Station> {
    await this.stationRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy bến xe sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const queryRunner = this.stationRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // delete relations and schedules referencing this station
      await queryRunner.query('DELETE FROM bus_station WHERE station_id = ?', [id]);
      await queryRunner.query('DELETE FROM schedules WHERE departure_station_id = ? OR arrival_station_id = ?', [id, id]);
      await queryRunner.query('DELETE FROM routes WHERE departure_station_id = ? OR arrival_station_id = ?', [id, id]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.stationRepository.delete(id);
  }
}










