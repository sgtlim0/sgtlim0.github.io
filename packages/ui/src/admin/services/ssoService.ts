/**
 * SSO/SAML Service — connection management, JWT, session, audit
 */

import type {
  SSOConnection,
  SSOProvider,
  SSOTestResult,
  JWTConfig,
  SessionConfig,
  SSOAuditLog,
} from './ssoTypes'

const STORAGE_KEY = 'hchat-sso-connections'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_CONNECTIONS: SSOConnection[] = [
  {
    id: 'sso-okta',
    provider: 'okta',
    name: 'Okta (현대차그룹)',
    entityId: 'https://hchat.okta.com/saml',
    ssoUrl: 'https://hchat.okta.com/app/saml/sso',
    sloUrl: 'https://hchat.okta.com/app/saml/slo',
    certificate: 'MIIDpDCCAoygAwIBAgIGAX...(truncated)',
    metadataUrl: 'https://hchat.okta.com/app/saml/metadata',
    attributeMapping: {
      email: 'user.email',
      firstName: 'user.firstName',
      lastName: 'user.lastName',
      department: 'user.department',
      role: 'user.role',
    },
    status: 'active',
    createdAt: '2025-06-01',
    lastTestedAt: '2026-03-05',
    lastLoginAt: '2026-03-07',
  },
  {
    id: 'sso-azure',
    provider: 'azure-ad',
    name: 'Azure AD (기아)',
    entityId: 'https://login.microsoftonline.com/tenant-id/saml2',
    ssoUrl: 'https://login.microsoftonline.com/tenant-id/saml2',
    certificate: 'MIIDpDCCAoygAwIBAgIGAX...(truncated)',
    attributeMapping: {
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    },
    status: 'testing',
    createdAt: '2026-01-15',
    lastTestedAt: '2026-03-06',
  },
]

const DEFAULT_JWT_CONFIG: JWTConfig = {
  algorithm: 'RS256',
  accessTokenTTL: 3600,
  refreshTokenTTL: 604800,
  issuer: 'https://hchat.ai',
  audience: 'hchat-admin',
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxDuration: 28800,
  idleTimeout: 1800,
  maxConcurrentSessions: 3,
  forceReauthInterval: 86400,
}

const MOCK_AUDIT_LOGS: SSOAuditLog[] = [
  {
    id: 'al-1',
    action: 'login',
    userId: 'user-1',
    provider: 'okta',
    success: true,
    ip: '10.0.1.100',
    timestamp: '2026-03-07T09:00:00Z',
  },
  {
    id: 'al-2',
    action: 'login',
    userId: 'user-2',
    provider: 'okta',
    success: true,
    ip: '10.0.1.101',
    timestamp: '2026-03-07T09:05:00Z',
  },
  {
    id: 'al-3',
    action: 'login',
    userId: 'user-3',
    provider: 'azure-ad',
    success: false,
    ip: '10.0.2.50',
    timestamp: '2026-03-07T08:55:00Z',
    details: 'Certificate validation failed',
  },
  {
    id: 'al-4',
    action: 'token_refresh',
    userId: 'user-1',
    provider: 'okta',
    success: true,
    ip: '10.0.1.100',
    timestamp: '2026-03-07T10:00:00Z',
  },
  {
    id: 'al-5',
    action: 'session_expired',
    userId: 'user-4',
    provider: 'okta',
    success: true,
    ip: '10.0.1.102',
    timestamp: '2026-03-07T07:30:00Z',
  },
  {
    id: 'al-6',
    action: 'config_change',
    provider: 'azure-ad',
    success: true,
    ip: '10.0.0.1',
    timestamp: '2026-03-06T16:00:00Z',
    details: 'Updated certificate',
  },
  {
    id: 'al-7',
    action: 'logout',
    userId: 'user-2',
    provider: 'okta',
    success: true,
    ip: '10.0.1.101',
    timestamp: '2026-03-07T18:00:00Z',
  },
]

function getStoredConnections(): SSOConnection[] {
  if (typeof window === 'undefined') return MOCK_CONNECTIONS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_CONNECTIONS
  } catch {
    return MOCK_CONNECTIONS
  }
}

function saveConnections(connections: SSOConnection[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections))
}

export async function getSSOConnections(): Promise<SSOConnection[]> {
  await delay(200)
  return getStoredConnections()
}

export async function getSSOConnectionById(id: string): Promise<SSOConnection | null> {
  await delay(100)
  return getStoredConnections().find((c) => c.id === id) ?? null
}

export async function createSSOConnection(
  provider: SSOProvider,
  name: string,
  entityId: string,
  ssoUrl: string,
  certificate: string,
): Promise<SSOConnection> {
  await delay(400)
  const connection: SSOConnection = {
    id: `sso-${Date.now()}`,
    provider,
    name,
    entityId,
    ssoUrl,
    certificate,
    attributeMapping: {
      email: 'user.email',
      firstName: 'user.firstName',
      lastName: 'user.lastName',
    },
    status: 'inactive',
    createdAt: new Date().toISOString(),
  }
  const connections = getStoredConnections()
  saveConnections([...connections, connection])
  return connection
}

export async function updateSSOConnection(
  id: string,
  updates: Partial<SSOConnection>,
): Promise<SSOConnection | null> {
  await delay(200)
  const connections = getStoredConnections()
  let updated: SSOConnection | null = null

  const newConnections = connections.map((c) => {
    if (c.id !== id) return c
    updated = { ...c, ...updates, id: c.id, provider: c.provider, createdAt: c.createdAt }
    return updated
  })

  if (updated) saveConnections(newConnections)
  return updated
}

export async function deleteSSOConnection(id: string): Promise<boolean> {
  await delay(200)
  const connections = getStoredConnections()
  const filtered = connections.filter((c) => c.id !== id)
  if (filtered.length === connections.length) return false
  saveConnections(filtered)
  return true
}

export async function testSSOConnection(id: string): Promise<SSOTestResult> {
  await delay(800)
  const connection = getStoredConnections().find((c) => c.id === id)
  if (!connection) {
    return {
      success: false,
      provider: 'okta',
      responseTime: 0,
      assertions: [],
      errors: ['Connection not found'],
      testedAt: new Date().toISOString(),
    }
  }

  const success = connection.status !== 'inactive'
  return {
    success,
    provider: connection.provider,
    responseTime: 150 + Math.floor(Math.random() * 200),
    assertions: [
      { attribute: 'email', value: 'admin@hchat.ai', mapped: true },
      { attribute: 'firstName', value: '관리자', mapped: true },
      { attribute: 'lastName', value: '홍', mapped: true },
      { attribute: 'department', value: 'IT', mapped: !!connection.attributeMapping.department },
    ],
    errors: success ? [] : ['Certificate validation failed'],
    testedAt: new Date().toISOString(),
  }
}

export function getJWTConfig(): JWTConfig {
  return DEFAULT_JWT_CONFIG
}

export function getSessionConfig(): SessionConfig {
  return DEFAULT_SESSION_CONFIG
}

export async function getSSOAuditLogs(limit: number = 20): Promise<SSOAuditLog[]> {
  await delay(150)
  return MOCK_AUDIT_LOGS.slice(0, limit)
}
