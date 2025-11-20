import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('seats')
@Index(['busId'])
@Index(['seatType'])
@Index(['status'])
@Index(['isHidden'])
@Unique(['busId', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bus_id' })
  busId: number;

  @Column({ name: 'seat_number', length: 20 })
  seatNumber: string;

  @Column({
    name: 'seat_type',
    type: 'enum',
    enum: ['LUXURY', 'VIP', 'STANDARD', 'DOUBLE'],
    default: 'STANDARD',
  })
  seatType: 'LUXURY' | 'VIP' | 'STANDARD' | 'DOUBLE';

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'BOOKED'],
    default: 'AVAILABLE',
  })
  status: 'AVAILABLE' | 'BOOKED';

  @Column({
    name: 'price_for_seat_type',
    type: 'double',
    default: 0,
    comment: 'Giá cộng thêm cho loại ghế',
  })
  priceForSeatType: number;

  @Column({
    name: 'is_hidden',
    type: 'boolean',
    default: false,
    comment: 'Ghế bị ẩn (hiển thị dấu X)',
  })
  isHidden: boolean;

  @ManyToOne('Bus', 'seats')
  @JoinColumn({ name: 'bus_id' })
  bus: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
