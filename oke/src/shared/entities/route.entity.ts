import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SeatTypePrice } from './seat-type-price.entity';

@Entity('routes')
@Index(['departureStationId'])
@Index(['arrivalStationId'])
@Index(['price'])
@Index(['busCompanyId'])
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'departure_station_id' })
  departureStationId: number;

  @Column({ name: 'arrival_station_id' })
  arrivalStationId: number;

  @Column({ type: 'double' })
  price: number;

  @Column({ comment: 'Thời gian tính bằng phút' })
  duration: number;

  @Column({ comment: 'Khoảng cách tính bằng km' })
  distance: number;

  @Column({ name: 'bus_company_id', nullable: true })
  busCompanyId?: number;

  @ManyToOne('Station', 'departureRoutes')
  @JoinColumn({ name: 'departure_station_id' })
  departureStation: any;

  @ManyToOne('Station', 'arrivalRoutes')
  @JoinColumn({ name: 'arrival_station_id' })
  arrivalStation: any;

  @ManyToOne('BusCompany', 'routes')
  @JoinColumn({ name: 'bus_company_id' })
  busCompany: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany('Schedule', 'route')
  schedules: any[];

  @OneToMany(() => SeatTypePrice, (price) => price.route)
  seatTypePrices: SeatTypePrice[];
}

