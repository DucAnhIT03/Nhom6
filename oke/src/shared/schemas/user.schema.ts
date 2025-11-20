import { BaseSchema } from './base.schema';

export class User implements BaseSchema {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

