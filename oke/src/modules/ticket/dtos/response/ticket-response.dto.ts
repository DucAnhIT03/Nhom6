import { SeatType } from '../../../../common/constraints';
import { TicketStatus } from '../../../../common/constraints';

export class TicketResponseDto {
  id: number;
  userId: number;
  scheduleId: number;
  seatId: number;
  departureTime: Date;
  arrivalTime: Date;
  seatType: SeatType;
  price: number;
  status: TicketStatus;
  ticketCode?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  schedule?: {
    id: number;
    departureTime: Date;
    arrivalTime: Date;
    route?: any;
    bus?: any;
  };
  seat?: {
    id: number;
    seatNumber: string;
    seatType: SeatType;
  };
  createdAt: Date;
  updatedAt: Date;
}

