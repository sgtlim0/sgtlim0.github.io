import type { AuthUser, LoginCredentials } from './types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): boolean;
}
