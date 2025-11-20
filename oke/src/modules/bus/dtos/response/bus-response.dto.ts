export interface CompanyInfo {
  id: number;
  companyName: string;
}

export interface BusResponseDto {
  id: number;
  name: string;
  descriptions?: string;
  licensePlate: string;
  capacity: number;
  floors: number;
  companyId: number;
  company?: CompanyInfo;
  createdAt: Date;
  updatedAt: Date;
}












