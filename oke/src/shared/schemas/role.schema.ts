import { BaseSchema } from './base.schema';

export class Role implements BaseSchema {
  id: number;
  roleName: 'ROLE_ADMIN' | 'ROLE_USER';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

