import { ScheduleStatus } from '../../../../common/constraints';

export class ScheduleResponseDto {
  id: number;
  routeId: number;
  busId: number;
  startDate: Date;
  endDate: Date;
  departureTime: Date;
  arrivalTime: Date;
  availableSeat: number;
  totalSeats: number;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
  route?: any; // Route details if included
  bus?: any; // Bus details if included
}

