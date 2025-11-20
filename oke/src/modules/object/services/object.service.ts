import { Injectable } from '@nestjs/common';
import { ObjectRepository } from '../repositories/object.repository';
import { CreateObjectDto } from '../dtos/request/create-object.dto';
import { ObjectResponseDto } from '../dtos/response/object-response.dto';

@Injectable()
export class ObjectService {
  constructor(private readonly objectRepository: ObjectRepository) {}

  async findAll(): Promise<ObjectResponseDto[]> {
    return this.objectRepository.findAll();
  }

  async findOne(id: string): Promise<ObjectResponseDto> {
    return this.objectRepository.findOne(id);
  }

  async create(createObjectDto: CreateObjectDto): Promise<ObjectResponseDto> {
    return this.objectRepository.create(createObjectDto);
  }

  async update(id: string, updateData: Partial<CreateObjectDto>): Promise<ObjectResponseDto> {
    return this.objectRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    return this.objectRepository.delete(id);
  }
}

