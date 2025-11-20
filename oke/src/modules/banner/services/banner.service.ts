import { Injectable, NotFoundException } from '@nestjs/common';
import { BannerRepository } from '../repositories/banner.repository';
import { CreateBannerDto } from '../dtos/request/create-banner.dto';
import { UpdateBannerDto } from '../dtos/request/update-banner.dto';
import { QueryBannerDto } from '../dtos/request/query-banner.dto';
import { BannerResponseDto } from '../dtos/response/banner-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { Banner } from '../../../shared/entities/banner.entity';

@Injectable()
export class BannerService {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async findAll(queryDto: QueryBannerDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.bannerRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<BannerResponseDto> = {
      items: data.map((banner) => this.mapToResponseDto(banner)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách banner thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const banner = await this.bannerRepository.findOne(id);
    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    return ResponseUtil.success<BannerResponseDto>(
      this.mapToResponseDto(banner),
      'Lấy thông tin banner thành công',
    );
  }

  async create(createDto: CreateBannerDto): Promise<any> {
    const banner = await this.bannerRepository.create(createDto);
    return ResponseUtil.success<BannerResponseDto>(
      this.mapToResponseDto(banner),
      'Tạo banner thành công',
    );
  }

  async update(id: number, updateDto: UpdateBannerDto): Promise<any> {
    const existing = await this.bannerRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    const banner = await this.bannerRepository.update(id, updateDto);
    return ResponseUtil.success<BannerResponseDto>(
      this.mapToResponseDto(banner),
      'Cập nhật banner thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.bannerRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    await this.bannerRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa banner thành công');
  }

  private mapToResponseDto(banner: Banner): BannerResponseDto {
    return {
      id: banner.id,
      bannerUrl: banner.bannerUrl,
      position: banner.position,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}

