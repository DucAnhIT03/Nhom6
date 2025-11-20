import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../../shared/entities/banner.entity';
import { CreateBannerDto } from '../dtos/request/create-banner.dto';
import { UpdateBannerDto } from '../dtos/request/update-banner.dto';
import { QueryBannerDto } from '../dtos/request/query-banner.dto';

@Injectable()
export class BannerRepository {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async findAll(queryDto: QueryBannerDto): Promise<{ data: Banner[]; total: number }> {
    const { page = 1, limit = 10, search, position } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bannerRepository.createQueryBuilder('banner');

    // Tìm kiếm theo bannerUrl hoặc position
    if (search) {
      queryBuilder.where(
        '(banner.bannerUrl LIKE :search OR banner.position LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Lọc theo position
    if (position) {
      if (search) {
        queryBuilder.andWhere('banner.position = :position', { position });
      } else {
        queryBuilder.where('banner.position = :position', { position });
      }
    }

    // Đếm tổng số bản ghi
    const total = await queryBuilder.getCount();

    // Lấy dữ liệu với phân trang
    const data = await queryBuilder
      .orderBy('banner.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number): Promise<Banner | null> {
    return await this.bannerRepository.findOne({
      where: { id },
    });
  }

  async create(createDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create({
      bannerUrl: createDto.bannerUrl,
      position: createDto.position,
    });

    return await this.bannerRepository.save(banner);
  }

  async update(id: number, updateDto: UpdateBannerDto): Promise<Banner> {
    await this.bannerRepository.update(id, updateDto);
    const banner = await this.findOne(id);
    if (!banner) {
      throw new Error('Banner not found after update');
    }
    return banner;
  }

  async delete(id: number): Promise<void> {
    await this.bannerRepository.delete(id);
  }
}

