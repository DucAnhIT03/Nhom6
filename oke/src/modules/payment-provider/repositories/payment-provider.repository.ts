import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from '../../../shared/entities/payment-provider.entity';
import { CreatePaymentProviderDto } from '../dtos/request/create-payment-provider.dto';
import { UpdatePaymentProviderDto } from '../dtos/request/update-payment-provider.dto';
import { QueryPaymentProviderDto } from '../dtos/request/query-payment-provider.dto';

@Injectable()
export class PaymentProviderRepository {
  constructor(
    @InjectRepository(PaymentProvider)
    private readonly paymentProviderRepository: Repository<PaymentProvider>,
  ) {}

  async findAll(queryDto: QueryPaymentProviderDto): Promise<{ data: PaymentProvider[]; total: number }> {
    const { page = 1, limit = 10, search, providerType } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentProviderRepository.createQueryBuilder('paymentProvider');

    // Tìm kiếm theo providerName hoặc apiEndpoint
    if (search) {
      queryBuilder.where(
        '(paymentProvider.providerName LIKE :search OR paymentProvider.apiEndpoint LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Lọc theo providerType
    if (providerType) {
      if (search) {
        queryBuilder.andWhere('paymentProvider.providerType = :providerType', { providerType });
      } else {
        queryBuilder.where('paymentProvider.providerType = :providerType', { providerType });
      }
    }

    // Đếm tổng số bản ghi
    const total = await queryBuilder.getCount();

    // Lấy dữ liệu với phân trang
    const data = await queryBuilder
      .orderBy('paymentProvider.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number): Promise<PaymentProvider | null> {
    return await this.paymentProviderRepository.findOne({
      where: { id },
    });
  }

  async create(createDto: CreatePaymentProviderDto): Promise<PaymentProvider> {
    const paymentProvider = this.paymentProviderRepository.create({
      providerName: createDto.providerName,
      providerType: createDto.providerType,
      apiEndpoint: createDto.apiEndpoint,
    });

    return await this.paymentProviderRepository.save(paymentProvider);
  }

  async update(id: number, updateDto: UpdatePaymentProviderDto): Promise<PaymentProvider> {
    await this.paymentProviderRepository.update(id, updateDto);
    const paymentProvider = await this.findOne(id);
    if (!paymentProvider) {
      throw new Error('Payment provider not found after update');
    }
    return paymentProvider;
  }

  async delete(id: number): Promise<void> {
    await this.paymentProviderRepository.delete(id);
  }
}

