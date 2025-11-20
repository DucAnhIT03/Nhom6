import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Station } from '../../../shared/entities/station.entity';
import { BusCompany } from '../../../shared/entities/bus-company.entity';
import { Bus } from '../../../shared/entities/bus.entity';
import { Route } from '../../../shared/entities/route.entity';
import { Post } from '../../../shared/entities/post.entity';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(BusCompany)
    private readonly busCompanyRepository: Repository<BusCompany>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalStations,
      totalCompanies,
      totalBuses,
      totalRoutes,
      totalPosts,
    ] = await Promise.all([
      this.userRepository
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL')
        .getCount(),
      this.stationRepository
        .createQueryBuilder('station')
        .where('station.deletedAt IS NULL')
        .getCount(),
      this.busCompanyRepository
        .createQueryBuilder('company')
        .where('company.deletedAt IS NULL')
        .getCount(),
      this.busRepository
        .createQueryBuilder('bus')
        .where('bus.deletedAt IS NULL')
        .getCount(),
      this.routeRepository
        .createQueryBuilder('route')
        .where('route.deletedAt IS NULL')
        .getCount(),
      this.postRepository.count(),
    ]);

    return ResponseUtil.success({
      totalUsers,
      totalStations,
      totalCompanies,
      totalBuses,
      totalRoutes,
      totalPosts,
    });
  }
}


