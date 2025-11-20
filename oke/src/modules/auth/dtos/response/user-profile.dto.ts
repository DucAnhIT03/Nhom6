export class UserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

