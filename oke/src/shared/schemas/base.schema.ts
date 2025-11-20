// Base schema for all entities
// TODO: Implement base schema class if using Mongoose, TypeORM, etc.

export interface BaseSchema {
  id: number | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

