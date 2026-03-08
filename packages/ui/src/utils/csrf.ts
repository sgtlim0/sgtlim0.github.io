/**
 * CSRF Protection Utilities
 *
 * Provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

const CSRF_TOKEN_KEY = 'csrf_token'

/**
 * Generates a new CSRF token using crypto.randomUUID()
 * @returns A new unique CSRF token
 */
export function generateCsrfToken(): string {
  // Use crypto.randomUUID for secure random token generation
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Gets the current CSRF token from session storage, generating a new one if needed
 * @returns The current session's CSRF token
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty string
    return ''
  }

  // Check if token exists in sessionStorage
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY)

  if (!token) {
    // Generate new token if not exists
    token = generateCsrfToken()
    sessionStorage.setItem(CSRF_TOKEN_KEY, token)
  }

  return token
}

/**
 * Validates a CSRF token against the current session token
 * @param token - The token to validate
 * @returns true if the token is valid, false otherwise
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof window === 'undefined') {
    return false
  }

  const sessionToken = sessionStorage.getItem(CSRF_TOKEN_KEY)

  // Constant-time comparison to prevent timing attacks
  if (!sessionToken || token.length !== sessionToken.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i)
  }

  return result === 0
}

/**
 * Clears the current CSRF token from session storage
 * Useful for logout or session reset scenarios
 */
export function clearCsrfToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY)
  }
}

/**
 * Adds CSRF token to request headers
 * @param headers - Existing headers object or Headers instance
 * @returns New headers with CSRF token added
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfToken()

  if (headers instanceof Headers) {
    const newHeaders = new Headers(headers)
    newHeaders.set('X-CSRF-Token', token)
    return newHeaders
  }

  return {
    ...headers,
    'X-CSRF-Token': token,
  }
}

/**
 * Hook for React components to use CSRF tokens
 * @returns Object with token and utility functions
 */
export function useCsrf() {
  if (typeof window === 'undefined') {
    return {
      token: '',
      validateToken: () => false,
      refreshToken: () => '',
      addToHeaders: (headers: HeadersInit) => headers,
    }
  }

  return {
    token: getCsrfToken(),
    validateToken: validateCsrfToken,
    refreshToken: () => {
      clearCsrfToken()
      return getCsrfToken()
    },
    addToHeaders: addCsrfHeader,
  }
}
