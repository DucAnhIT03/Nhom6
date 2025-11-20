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

@Entity('stations')
@Index(['name'])
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, length: 255 })
  image?: string;

  @Column({ nullable: true, length: 255 })
  wallpaper?: string;

  @Column({ type: 'longtext', nullable: true })
  descriptions?: string;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany('Route', 'departureStation')
  departureRoutes: any[];

  @OneToMany('Route', 'arrivalStation')
  arrivalRoutes: any[];
}

