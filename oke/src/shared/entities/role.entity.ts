import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  Index,
} from 'typeorm';

@Entity('roles')
@Index(['roleName'])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_name',
    type: 'enum',
    enum: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF'],
    unique: true,
  })
  roleName: 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_STAFF';

  @ManyToMany('User', 'roles')
  users: any[];
}

