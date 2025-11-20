import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Station } from './station.entity';
import { Bus } from './bus.entity';

@Entity('bus_station')
@Index(['stationId'])
@Index(['busId'])
export class BusStation {
  @PrimaryColumn({ name: 'station_id' })
  stationId: number;

  @PrimaryColumn({ name: 'bus_id' })
  busId: number;

  @ManyToOne('Station')
  @JoinColumn({ name: 'station_id' })
  station: any;

  @ManyToOne('Bus')
  @JoinColumn({ name: 'bus_id' })
  bus: any;
}

