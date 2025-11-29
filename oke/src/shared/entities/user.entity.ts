import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ nullable: true, length: 11 })
  phone?: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'BLOCKED';

  @Column({ name: 'bus_company_id', nullable: true })
  busCompanyId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToMany('Role', 'users')
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: any[];
}

