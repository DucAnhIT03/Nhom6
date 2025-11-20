import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusStationRepository } from '../repositories/bus-station.repository';
import { Station } from '../../../shared/entities/station.entity';
import { AddBusToStationDto } from '../dtos/request/add-bus-to-station.dto';
import { RemoveBusFromStationDto } from '../dtos/request/remove-bus-from-station.dto';
import {
  BusStationResponseDto,
  StationBusesResponseDto,
} from '../dtos/response/bus-station-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class BusStationService {
  constructor(
    private readonly busStationRepository: BusStationRepository,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async addBusToStation(
    stationId: number,
    addBusDto: AddBusToStationDto,
  ): Promise<any> {
    try {
      const busStation = await this.busStationRepository.addBusToStation(
        stationId,
        addBusDto.busId,
      );
      return ResponseUtil.success<BusStationResponseDto>(
        this.mapToResponseDto(busStation),
        'Thêm xe vào bến thành công',
      );
    } catch (error) {
      if (error.message.includes('Không tìm thấy')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async removeBusFromStation(
    stationId: number,
    removeBusDto: RemoveBusFromStationDto,
  ): Promise<any> {
    try {
      await this.busStationRepository.removeBusFromStation(
        stationId,
        removeBusDto.busId,
      );
      return ResponseUtil.success(null, 'Xóa xe khỏi bến thành công');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getBusesByStation(stationId: number): Promise<any> {
    const buses = await this.busStationRepository.getBusesByStation(stationId);
    const station = await this.stationRepository.findOne({
      where: { id: stationId },
    });

    const response: StationBusesResponseDto = {
      stationId,
      stationName: station?.name || '',
      buses: buses.map((bus) => ({
        id: bus.id,
        name: bus.name,
        licensePlate: bus.licensePlate,
        capacity: bus.capacity,
        companyName: bus.company?.companyName,
      })),
    };

    return ResponseUtil.success(
      response,
      'Lấy danh sách xe theo bến thành công',
    );
  }

  async getStationsByBus(busId: number): Promise<any> {
    const stations = await this.busStationRepository.getStationsByBus(busId);

    return ResponseUtil.success(
      stations.map((station) => ({
        id: station.id,
        name: station.name,
        location: station.location,
      })),
      'Lấy danh sách bến theo xe thành công',
    );
  }

  async getAllRelations(): Promise<any> {
    const relations = await this.busStationRepository.getAllRelations();
    return ResponseUtil.success(
      relations.map((rel) => this.mapToResponseDto(rel)),
      'Lấy danh sách quan hệ xe - bến thành công',
    );
  }

  private mapToResponseDto(busStation: any): BusStationResponseDto {
    return {
      stationId: busStation.stationId,
      busId: busStation.busId,
      station: busStation.station
        ? {
            id: busStation.station.id,
            name: busStation.station.name,
            location: busStation.station.location,
          }
        : undefined,
      bus: busStation.bus
        ? {
            id: busStation.bus.id,
            name: busStation.bus.name,
            licensePlate: busStation.bus.licensePlate,
            capacity: busStation.bus.capacity,
            companyName: busStation.bus.company?.companyName,
          }
        : undefined,
    };
  }
}

