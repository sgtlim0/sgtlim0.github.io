export type UserRole = 'admin' | 'manager' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
