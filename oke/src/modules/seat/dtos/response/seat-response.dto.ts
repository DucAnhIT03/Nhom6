export interface BusInfo {
  id: number;
  name: string;
  licensePlate: string;
  capacity: number;
}

export interface SeatResponseDto {
  id: number;
  busId: number;
  seatNumber: string;
  seatType: 'LUXURY' | 'VIP' | 'STANDARD' | 'DOUBLE';
  status: 'AVAILABLE' | 'BOOKED';
  priceForSeatType: number;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  bus?: BusInfo;
}

export interface SeatMapItem {
  seat: SeatResponseDto;
  color: string;
}

export interface SeatMapResponseDto {
  busId: number;
  busName?: string;
  seats: SeatResponseDto[];
  seatMap: Record<string, SeatMapItem>;
}








