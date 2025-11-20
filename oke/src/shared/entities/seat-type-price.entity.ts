import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('seat_type_prices')
@Index(['routeId', 'seatType'], { unique: true })
export class SeatTypePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'route_id' })
  routeId: number;

  @Column({
    name: 'seat_type',
    type: 'enum',
    enum: ['STANDARD', 'VIP', 'DOUBLE', 'LUXURY'],
  })
  seatType: 'STANDARD' | 'VIP' | 'DOUBLE' | 'LUXURY';

  @Column({ type: 'double', default: 0 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Route', 'seatTypePrices')
  @JoinColumn({ name: 'route_id' })
  route: any;
}


