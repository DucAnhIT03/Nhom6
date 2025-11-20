import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BusCompanyRepository } from '../repositories/bus-company.repository';
import { CreateBusCompanyDto } from '../dtos/request/create-bus-company.dto';
import { UpdateBusCompanyDto } from '../dtos/request/update-bus-company.dto';
import { QueryBusCompanyDto } from '../dtos/request/query-bus-company.dto';
import { BusCompanyResponseDto } from '../dtos/response/bus-company-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';

@Injectable()
export class BusCompanyService {
  constructor(private readonly busCompanyRepository: BusCompanyRepository) {}

  async findAll(queryDto: QueryBusCompanyDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.busCompanyRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<BusCompanyResponseDto> = {
      items: data.map((company) => this.mapToResponseDto(company)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(paginatedResult, 'Lấy danh sách nhà xe thành công');
  }

  async findOne(id: number): Promise<any> {
    const company = await this.busCompanyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException('Không tìm thấy nhà xe');
    }

    return ResponseUtil.success<BusCompanyResponseDto>(
      this.mapToResponseDto(company),
      'Lấy thông tin nhà xe thành công',
    );
  }

  async create(createDto: CreateBusCompanyDto): Promise<any> {
    // Check if company name already exists
    const existing = await this.busCompanyRepository.findByName(createDto.companyName);
    if (existing) {
      throw new ConflictException('Tên nhà xe đã tồn tại');
    }

    const company = await this.busCompanyRepository.create(createDto);
    return ResponseUtil.success<BusCompanyResponseDto>(
      this.mapToResponseDto(company),
      'Tạo nhà xe thành công',
    );
  }

  async update(id: number, updateDto: UpdateBusCompanyDto): Promise<any> {
    const company = await this.busCompanyRepository.update(id, updateDto);
    return ResponseUtil.success<BusCompanyResponseDto>(
      this.mapToResponseDto(company),
      'Cập nhật nhà xe thành công',
    );
  }

  async delete(id: number): Promise<any> {
    await this.busCompanyRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa nhà xe thành công');
  }

  private mapToResponseDto(company: any): BusCompanyResponseDto {
    return {
      id: company.id,
      companyName: company.companyName,
      image: company.image,
      descriptions: company.descriptions,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
