export interface StationInfo {
  id: number;
  name: string;
  location: string;
}

export interface BusInfo {
  id: number;
  name: string;
  licensePlate: string;
  capacity: number;
  companyName?: string;
}

export interface BusStationResponseDto {
  stationId: number;
  busId: number;
  station?: StationInfo;
  bus?: BusInfo;
}

export interface StationBusesResponseDto {
  stationId: number;
  stationName: string;
  buses: BusInfo[];
}








