import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('otp_codes')
@Index(['email'])
@Index(['code'])
export class OtpCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 6 })
  code: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ nullable: true, length: 50 })
  type?: string; // 'REGISTER', 'RESET_PASSWORD', etc.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}










