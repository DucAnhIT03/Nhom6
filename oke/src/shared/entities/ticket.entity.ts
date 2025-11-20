import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('tickets')
@Index(['userId'])
@Index(['scheduleId'])
@Index(['seatId'])
@Index(['status'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @Column({ name: 'seat_id' })
  seatId: number;

  @Column({ name: 'departure_time', type: 'datetime' })
  departureTime: Date;

  @Column({ name: 'arrival_time', type: 'datetime' })
  arrivalTime: Date;

  @Column({
    name: 'seat_type',
    type: 'enum',
    enum: ['LUXURY', 'VIP', 'STANDARD'],
  })
  seatType: 'LUXURY' | 'VIP' | 'STANDARD';

  @Column({ type: 'double' })
  price: number;

  @Column({
    type: 'enum',
    enum: ['BOOKED', 'CANCELLED'],
    default: 'BOOKED',
  })
  status: 'BOOKED' | 'CANCELLED';

  @Column({ name: 'ticket_code', length: 50, unique: true, nullable: true })
  ticketCode?: string;

  @ManyToOne('User', 'tickets')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Schedule', 'tickets')
  @JoinColumn({ name: 'schedule_id' })
  schedule: any;

  @ManyToOne('Seat', 'tickets')
  @JoinColumn({ name: 'seat_id' })
  seat: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
