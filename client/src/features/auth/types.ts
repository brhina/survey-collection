export type UserRole = 'admin' | 'creator' | 'respondent';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
}
