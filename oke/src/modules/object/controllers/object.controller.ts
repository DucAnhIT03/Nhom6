import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ObjectService } from '../services/object.service';
import { CreateObjectDto } from '../dtos/request/create-object.dto';
import { ObjectResponseDto } from '../dtos/response/object-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';

@Controller('objects')
@UseGuards(AuthGuard)
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Get()
  async findAll(): Promise<ObjectResponseDto[]> {
    return this.objectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ObjectResponseDto> {
    return this.objectService.findOne(id);
  }

  @Post()
  async create(@Body() createObjectDto: CreateObjectDto): Promise<ObjectResponseDto> {
    return this.objectService.create(createObjectDto);
  }
}

