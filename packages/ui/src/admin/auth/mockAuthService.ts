import type { AuthService } from './authService';
import type { AuthUser, LoginCredentials } from './types';

const MOCK_USERS: Record<string, AuthUser> = {
  'admin@hchat.ai': {
    id: '1',
    email: 'admin@hchat.ai',
    name: '관리자',
    role: 'admin',
    organization: '현대자동차그룹',
    avatarUrl: undefined,
  },
  'manager@hchat.ai': {
    id: '2',
    email: 'manager@hchat.ai',
    name: '매니저',
    role: 'manager',
    organization: '현대자동차그룹',
    avatarUrl: undefined,
  },
};

const STORAGE_KEY = 'hchat_admin_auth_token';
const USER_KEY = 'hchat_admin_user';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(500);

    const user = MOCK_USERS[credentials.email];
    if (!user || !credentials.password) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const token = btoa(JSON.stringify({ email: credentials.email, timestamp: Date.now() }));

    if (credentials.rememberMe) {
      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(STORAGE_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return user;
  }

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(300);

    const token = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!token) {
      return null;
    }

    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      const user = JSON.parse(userStr) as AuthUser;
      return user;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return !!token;
  }
}

export const mockAuthService = new MockAuthService();
