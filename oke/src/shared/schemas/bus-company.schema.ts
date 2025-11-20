import { BaseSchema } from './base.schema';

export class BusCompany implements BaseSchema {
  id: number;
  companyName: string;
  image?: string;
  descriptions?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

