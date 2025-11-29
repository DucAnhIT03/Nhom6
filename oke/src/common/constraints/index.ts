// System constraints and enums

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum RoleName {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER',
  ROLE_STAFF = 'ROLE_STAFF',
}

export enum SeatType {
  LUXURY = 'LUXURY',
  VIP = 'VIP',
  STANDARD = 'STANDARD',
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
}

export enum ScheduleStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
  CANCELLED = 'CANCELLED',
}

export enum TicketStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
}

export enum PaymentProviderType {
  CARD = 'CARD',
  E_WALLET = 'E-WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  QR_CODE = 'QR_CODE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

