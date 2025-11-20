import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusStation } from '../../../shared/entities/bus-station.entity';
import { Station } from '../../../shared/entities/station.entity';
import { Bus } from '../../../shared/entities/bus.entity';

@Injectable()
export class BusStationRepository {
  constructor(
    @InjectRepository(BusStation)
    private readonly busStationRepository: Repository<BusStation>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async addBusToStation(stationId: number, busId: number): Promise<BusStation> {
    // Check if station exists
    const station = await this.stationRepository.findOne({
      where: { id: stationId },
    });
    if (!station) {
      throw new Error('Không tìm thấy bến xe');
    }

    // Check if bus exists
    const bus = await this.busRepository.findOne({ where: { id: busId } });
    if (!bus) {
      throw new Error('Không tìm thấy xe');
    }

    // Check if relationship already exists
    const existing = await this.busStationRepository.findOne({
      where: { stationId, busId },
    });
    if (existing) {
      throw new Error('Xe đã được thêm vào bến xe này');
    }

    const busStation = this.busStationRepository.create({ stationId, busId });
    return this.busStationRepository.save(busStation);
  }

  async removeBusFromStation(
    stationId: number,
    busId: number,
  ): Promise<void> {
    await this.busStationRepository.delete({ stationId, busId });
  }

  async getBusesByStation(stationId: number): Promise<Bus[]> {
    const busStations = await this.busStationRepository.find({
      where: { stationId },
      relations: ['bus', 'bus.company'],
    });

    return busStations.map((bs) => bs.bus).filter((bus) => bus);
  }

  async getStationsByBus(busId: number): Promise<Station[]> {
    const busStations = await this.busStationRepository.find({
      where: { busId },
      relations: ['station'],
    });

    return busStations.map((bs) => bs.station).filter((station) => station);
  }

  async getAllRelations(): Promise<BusStation[]> {
    return await this.busStationRepository.find({
      relations: ['station', 'bus', 'bus.company'],
    });
  }

  async getCompaniesByStation(stationId: number): Promise<number[]> {
    const busStations = await this.busStationRepository.find({
      where: { stationId },
      relations: ['bus'],
    });
    const companyIds = busStations
      .map((bs) => bs.bus?.companyId)
      .filter((id) => id !== undefined && id !== null);
    return Array.from(new Set(companyIds));
  }
}








