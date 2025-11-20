import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentProviderRepository } from '../repositories/payment-provider.repository';
import { CreatePaymentProviderDto } from '../dtos/request/create-payment-provider.dto';
import { UpdatePaymentProviderDto } from '../dtos/request/update-payment-provider.dto';
import { QueryPaymentProviderDto } from '../dtos/request/query-payment-provider.dto';
import { PaymentProviderResponseDto } from '../dtos/response/payment-provider-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PaginatedResponse } from '../../../common/types';
import { PaymentProvider } from '../../../shared/entities/payment-provider.entity';

@Injectable()
export class PaymentProviderService {
  constructor(private readonly paymentProviderRepository: PaymentProviderRepository) {}

  async findAll(queryDto: QueryPaymentProviderDto): Promise<any> {
    const { page = 1, limit = 10 } = queryDto;
    const { data, total } = await this.paymentProviderRepository.findAll(queryDto);

    const paginatedResult: PaginatedResponse<PaymentProviderResponseDto> = {
      items: data.map((provider) => this.mapToResponseDto(provider)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ResponseUtil.success(
      paginatedResult,
      'Lấy danh sách nhà cung cấp thanh toán thành công',
    );
  }

  async findOne(id: number): Promise<any> {
    const provider = await this.paymentProviderRepository.findOne(id);
    if (!provider) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp thanh toán');
    }

    return ResponseUtil.success<PaymentProviderResponseDto>(
      this.mapToResponseDto(provider),
      'Lấy thông tin nhà cung cấp thanh toán thành công',
    );
  }

  async create(createDto: CreatePaymentProviderDto): Promise<any> {
    // Validate provider name is unique (case-insensitive)
    const existing = await this.paymentProviderRepository.findAll({
      page: 1,
      limit: 100, // Get more to check for exact match
    });

    const duplicate = existing.data.find(
      (p) => p.providerName.toLowerCase() === createDto.providerName.toLowerCase(),
    );

    if (duplicate) {
      throw new BadRequestException('Tên nhà cung cấp thanh toán đã tồn tại');
    }

    const provider = await this.paymentProviderRepository.create(createDto);
    return ResponseUtil.success<PaymentProviderResponseDto>(
      this.mapToResponseDto(provider),
      'Tạo nhà cung cấp thanh toán thành công',
    );
  }

  async update(id: number, updateDto: UpdatePaymentProviderDto): Promise<any> {
    const existing = await this.paymentProviderRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp thanh toán');
    }

    // Validate provider name is unique if being updated (case-insensitive)
    if (updateDto.providerName && updateDto.providerName !== existing.providerName) {
      const allProviders = await this.paymentProviderRepository.findAll({
        page: 1,
        limit: 100, // Get more to check for exact match
      });

      const newProviderName = updateDto.providerName;
      const duplicate = allProviders.data.find(
        (p) => p.id !== id && p.providerName.toLowerCase() === newProviderName.toLowerCase(),
      );

      if (duplicate) {
        throw new BadRequestException('Tên nhà cung cấp thanh toán đã tồn tại');
      }
    }

    const provider = await this.paymentProviderRepository.update(id, updateDto);
    return ResponseUtil.success<PaymentProviderResponseDto>(
      this.mapToResponseDto(provider),
      'Cập nhật nhà cung cấp thanh toán thành công',
    );
  }

  async delete(id: number): Promise<any> {
    const existing = await this.paymentProviderRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp thanh toán');
    }

    // TODO: Check if provider is being used in payments before deleting
    // For now, we allow deletion but should add this check in the future

    await this.paymentProviderRepository.delete(id);
    return ResponseUtil.success(null, 'Xóa nhà cung cấp thanh toán thành công');
  }

  private mapToResponseDto(provider: PaymentProvider): PaymentProviderResponseDto {
    return {
      id: provider.id,
      providerName: provider.providerName,
      providerType: provider.providerType,
      apiEndpoint: provider.apiEndpoint,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}

