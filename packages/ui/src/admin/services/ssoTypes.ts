/**
 * SSO/SAML types for real integration
 */

export type SSOProvider = 'okta' | 'azure-ad' | 'google' | 'custom-saml'

export interface SSOConnection {
  readonly id: string
  readonly provider: SSOProvider
  readonly name: string
  readonly entityId: string
  readonly ssoUrl: string
  readonly sloUrl?: string
  readonly certificate: string
  readonly metadataUrl?: string
  readonly attributeMapping: AttributeMapping
  readonly status: 'active' | 'inactive' | 'testing'
  readonly createdAt: string
  readonly lastTestedAt?: string
  readonly lastLoginAt?: string
}

export interface AttributeMapping {
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly department?: string
  readonly role?: string
}

export interface JWTConfig {
  readonly algorithm: 'RS256' | 'HS256'
  readonly accessTokenTTL: number
  readonly refreshTokenTTL: number
  readonly issuer: string
  readonly audience: string
}

export interface SessionConfig {
  readonly maxDuration: number
  readonly idleTimeout: number
  readonly maxConcurrentSessions: number
  readonly forceReauthInterval: number
}

export interface SSOTestResult {
  readonly success: boolean
  readonly provider: SSOProvider
  readonly responseTime: number
  readonly assertions: SSOAssertion[]
  readonly errors: string[]
  readonly testedAt: string
}

export interface SSOAssertion {
  readonly attribute: string
  readonly value: string
  readonly mapped: boolean
}

export interface SSOAuditLog {
  readonly id: string
  readonly action: 'login' | 'logout' | 'token_refresh' | 'session_expired' | 'config_change'
  readonly userId?: string
  readonly provider: SSOProvider
  readonly success: boolean
  readonly ip: string
  readonly timestamp: string
  readonly details?: string
}
