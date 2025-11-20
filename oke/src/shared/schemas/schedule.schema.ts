import { BaseSchema } from './base.schema';
import { ScheduleStatus } from '../../common/constraints';

export class Schedule implements BaseSchema {
  id: number;
  routeId: number;
  busId: number;
  departureTime: Date;
  arrivalTime: Date;
  availableSeat: number;
  totalSeats: number;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

