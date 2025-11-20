import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentProviderType {
  CARD = 'CARD',
  E_WALLET = 'E-WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  QR_CODE = 'QR_CODE',
}

@Entity('payment_providers')
@Index(['providerType'])
export class PaymentProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider_name', length: 255 })
  providerName: string;

  @Column({
    name: 'provider_type',
    type: 'enum',
    enum: PaymentProviderType,
  })
  providerType: PaymentProviderType;

  @Column({ name: 'api_endpoint', length: 255, nullable: true })
  apiEndpoint?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}








