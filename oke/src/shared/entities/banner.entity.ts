import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('banners')
@Index(['position'])
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'banner_url', length: 255 })
  bannerUrl: string;

  @Column({ length: 100 })
  position: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}












