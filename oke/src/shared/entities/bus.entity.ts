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

@Entity('buses')
@Index(['companyId'])
@Index(['licensePlate'])
export class Bus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  descriptions?: string;

  @Column({ name: 'license_plate', length: 50, unique: true })
  licensePlate: string;

  @Column()
  capacity: number;

  @Column({ default: 2, comment: 'Số tầng: 1 hoặc 2' })
  floors: number;

  @Column({
    name: 'seat_layout_config',
    type: 'json',
    nullable: true,
    comment: 'Cấu hình layout ghế: { floors, floorConfigs: [{ floor, prefix, rows, columns, label }] }',
  })
  seatLayoutConfig?: any;

  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne('BusCompany', 'buses')
  @JoinColumn({ name: 'company_id' })
  company: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany('Schedule', 'bus')
  schedules: any[];

  @OneToMany('Seat', 'bus')
  seats: any[];
}
