import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BusCompany } from '../../../shared/entities/bus-company.entity';
import { CreateBusCompanyDto } from '../dtos/request/create-bus-company.dto';
import { UpdateBusCompanyDto } from '../dtos/request/update-bus-company.dto';
import { QueryBusCompanyDto } from '../dtos/request/query-bus-company.dto';

@Injectable()
export class BusCompanyRepository {
  constructor(
    @InjectRepository(BusCompany)
    private readonly busCompanyRepository: Repository<BusCompany>,
  ) {}

  async findAll(queryDto: QueryBusCompanyDto): Promise<{ data: BusCompany[]; total: number }> {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.busCompanyRepository
      .createQueryBuilder('company');
      // TypeORM automatically adds deletedAt IS NULL condition for @DeleteDateColumn
      // No need to add it manually

    if (search) {
      queryBuilder.where(
        '(company.companyName LIKE :search OR company.descriptions LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('company.createdAt', 'DESC')
      .addOrderBy('company.id', 'ASC')
      .skip(skip)
      .take(limit);

    // Clone query builder for count to avoid modifying the original
    const countQueryBuilder = this.busCompanyRepository
      .createQueryBuilder('company');

    if (search) {
      countQueryBuilder.where(
        '(company.companyName LIKE :search OR company.descriptions LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await Promise.all([
      queryBuilder.getMany(),
      countQueryBuilder.getCount(),
    ]);
    
    return { data, total };
  }

  async findOne(id: number): Promise<BusCompany | null> {
    // TypeORM automatically adds deletedAt IS NULL condition for @DeleteDateColumn
    return this.busCompanyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .getOne();
  }

  async findByName(companyName: string): Promise<BusCompany | null> {
    // TypeORM automatically adds deletedAt IS NULL condition for @DeleteDateColumn
    return this.busCompanyRepository
      .createQueryBuilder('company')
      .where('company.companyName = :companyName', { companyName })
      .getOne();
  }

  async create(createDto: CreateBusCompanyDto): Promise<BusCompany> {
    const company = this.busCompanyRepository.create({
      companyName: createDto.companyName,
      image: createDto.image,
      descriptions: createDto.descriptions,
    });
    return this.busCompanyRepository.save(company);
  }

  async update(id: number, updateDto: UpdateBusCompanyDto): Promise<BusCompany> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhà xe');
    }

    await this.busCompanyRepository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhà xe sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhà xe');
    }
    await this.busCompanyRepository.softDelete(id);
  }

  async findByIds(ids: number[]): Promise<BusCompany[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    // TypeORM automatically adds deletedAt IS NULL condition for @DeleteDateColumn
    return this.busCompanyRepository
      .createQueryBuilder('company')
      .where('company.id IN (:...ids)', { ids })
      .getMany();
  }
}
