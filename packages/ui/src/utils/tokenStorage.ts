/**
 * 토큰 저장소 추상화
 * 현재: sessionStorage 사용 (XSS 완화)
 * 향후: httpOnly 쿠키로 전환 시 이 파일만 변경
 */

const TOKEN_KEY = 'hchat_admin_auth_token'
const USER_KEY = 'hchat_admin_user'

function getStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new Error('tokenStorage는 브라우저 환경에서만 사용 가능합니다')
  }
  return sessionStorage
}

export const tokenStorage = {
  getToken(): string | null {
    try {
      return getStorage().getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setToken(token: string): void {
    try {
      getStorage().setItem(TOKEN_KEY, token)
    } catch {
      // storage 접근 실패 시 무시
    }
  },

  removeToken(): void {
    try {
      getStorage().removeItem(TOKEN_KEY)
    } catch {
      // storage 접근 실패 시 무시
    }
  },

  getUser<T>(): T | null {
    try {
      const data = getStorage().getItem(USER_KEY)
      return data ? (JSON.parse(data) as T) : null
    } catch {
      return null
    }
  },

  setUser<T>(user: T): void {
    try {
      getStorage().setItem(USER_KEY, JSON.stringify(user))
    } catch {
      // storage 접근 실패 시 무시
    }
  },

  removeUser(): void {
    try {
      getStorage().removeItem(USER_KEY)
    } catch {
      // storage 접근 실패 시 무시
    }
  },

  clear(): void {
    this.removeToken()
    this.removeUser()
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null
  },
}
