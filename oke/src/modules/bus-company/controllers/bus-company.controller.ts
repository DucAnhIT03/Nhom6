import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BusCompanyService } from '../services/bus-company.service';
import { CreateBusCompanyDto } from '../dtos/request/create-bus-company.dto';
import { UpdateBusCompanyDto } from '../dtos/request/update-bus-company.dto';
import { QueryBusCompanyDto } from '../dtos/request/query-bus-company.dto';
import { Roles, Public } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('bus-companies')
export class BusCompanyController {
  constructor(private readonly busCompanyService: BusCompanyService) {}

  // Công khai: Xem danh sách nhà xe
  @Get()
  @Public()
  async findAll(@Query() queryDto: QueryBusCompanyDto) {
    return this.busCompanyService.findAll(queryDto);
  }

  // Công khai: Xem chi tiết nhà xe
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busCompanyService.findOne(id);
  }

  // Admin: Thêm nhà xe
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() createDto: CreateBusCompanyDto) {
    return this.busCompanyService.create(createDto);
  }

  // Admin: Cập nhật nhà xe
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBusCompanyDto,
  ) {
    return this.busCompanyService.update(id, updateDto);
  }

  // Admin: Xóa nhà xe
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.busCompanyService.delete(id);
  }
}

