export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    roles: string[];
  };
}

