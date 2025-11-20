import { BaseSchema } from './base.schema';

export class Route implements BaseSchema {
  id: number;
  departureStationId: number;
  arrivalStationId: number;
  price: number;
  duration: number; // minutes
  distance: number; // km
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

