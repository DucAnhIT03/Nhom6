import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('schedules')
@Index(['routeId'])
@Index(['busId'])
@Index(['departureTime'])
@Index(['status'])
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'route_id' })
  routeId: number;

  @Column({ name: 'bus_id' })
  busId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'departure_time', type: 'datetime' })
  departureTime: Date;

  @Column({ name: 'arrival_time', type: 'datetime' })
  arrivalTime: Date;

  @Column({ name: 'available_seat', default: 0 })
  availableSeat: number;

  @Column({ name: 'total_seats' })
  totalSeats: number;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'FULL', 'CANCELLED'],
    default: 'AVAILABLE',
  })
  status: 'AVAILABLE' | 'FULL' | 'CANCELLED';

  @ManyToOne('Route', 'schedules')
  @JoinColumn({ name: 'route_id' })
  route: any;

  @ManyToOne('Bus', 'schedules')
  @JoinColumn({ name: 'bus_id' })
  bus: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}

