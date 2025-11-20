class StationInfo {
  id: number;
  name: string;
  location: string;
}

class BusCompanyInfo {
  id: number;
  companyName: string;
  image?: string;
  descriptions?: string;
}

export class RouteResponseDto {
  id: number;
  departureStationId: number;
  arrivalStationId: number;
  busCompanyId?: number;
  price: number;
  duration: number;
  distance: number;
  createdAt: Date;
  updatedAt: Date;
  departureStation?: StationInfo;
  arrivalStation?: StationInfo;
  busCompany?: BusCompanyInfo;
}
