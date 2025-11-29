import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('bus_companies')
@Index(['companyName'])
export class BusCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_name', length: 255 })
  companyName: string;

  @Column({ nullable: true, length: 255 })
  image?: string;

  @Column({ nullable: true, length: 500 })
  address?: string;

  @Column({ type: 'longtext', nullable: true })
  descriptions?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany('Bus', 'company')
  buses: any[];

  @OneToMany('Route', 'busCompany')
  routes: any[];
}
