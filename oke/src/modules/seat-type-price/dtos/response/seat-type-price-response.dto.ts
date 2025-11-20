import { SeatTypePrice } from '../../../../shared/entities/seat-type-price.entity';

export class SeatTypePriceResponseDto {
  id: number;
  routeId: number;
  seatType: string;
  price: number;
  busCompanyId?: number;
  departureStationId?: number;
  arrivalStationId?: number;

  static fromEntity(entity: SeatTypePrice): SeatTypePriceResponseDto {
    return {
      id: entity.id,
      routeId: entity.routeId,
      seatType: entity.seatType,
      price: entity.price,
      busCompanyId: entity.route?.busCompanyId,
      departureStationId: entity.route?.departureStationId,
      arrivalStationId: entity.route?.arrivalStationId,
    };
  }
}


