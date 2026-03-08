import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getSSOConnections,
  getSSOConnectionById,
  createSSOConnection,
  updateSSOConnection,
  deleteSSOConnection,
  testSSOConnection,
  getJWTConfig,
  getSessionConfig,
  getSSOAuditLogs,
} from '../src/admin/services/ssoService'

describe('ssoService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getSSOConnections', () => {
    it('should return SSO connections', async () => {
      const promise = getSSOConnections()
      vi.advanceTimersByTime(300)
      const connections = await promise

      expect(connections.length).toBeGreaterThan(0)
      connections.forEach((c) => {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('provider')
        expect(c).toHaveProperty('name')
        expect(c).toHaveProperty('entityId')
        expect(c).toHaveProperty('ssoUrl')
        expect(c).toHaveProperty('status')
        expect(c).toHaveProperty('attributeMapping')
      })
    })

    it('should include different providers', async () => {
      const promise = getSSOConnections()
      vi.advanceTimersByTime(300)
      const connections = await promise

      const providers = connections.map((c) => c.provider)
      expect(providers).toContain('okta')
      expect(providers).toContain('azure-ad')
    })
  })

  describe('getSSOConnectionById', () => {
    it('should return connection for valid ID', async () => {
      const promise = getSSOConnectionById('sso-okta')
      vi.advanceTimersByTime(200)
      const connection = await promise

      expect(connection).not.toBeNull()
      expect(connection?.id).toBe('sso-okta')
      expect(connection?.provider).toBe('okta')
    })

    it('should return null for invalid ID', async () => {
      const promise = getSSOConnectionById('non-existent')
      vi.advanceTimersByTime(200)
      const connection = await promise

      expect(connection).toBeNull()
    })
  })

  describe('createSSOConnection', () => {
    it('should create a new SSO connection', async () => {
      const promise = createSSOConnection(
        'google',
        'Google Workspace',
        'https://accounts.google.com/o/saml2',
        'https://accounts.google.com/o/saml2/sso',
        'MIID...',
      )
      vi.advanceTimersByTime(500)
      const connection = await promise

      expect(connection.id).toBeTruthy()
      expect(connection.provider).toBe('google')
      expect(connection.name).toBe('Google Workspace')
      expect(connection.status).toBe('inactive')
      expect(connection.attributeMapping).toHaveProperty('email')
    })
  })

  describe('updateSSOConnection', () => {
    it('should update an existing connection', async () => {
      const promise = updateSSOConnection('sso-okta', { name: '수정된 Okta' })
      vi.advanceTimersByTime(300)
      const updated = await promise

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('수정된 Okta')
      expect(updated?.id).toBe('sso-okta')
      expect(updated?.provider).toBe('okta') // provider preserved
    })

    it('should return null for non-existent connection', async () => {
      const promise = updateSSOConnection('non-existent', { name: 'test' })
      vi.advanceTimersByTime(300)
      const updated = await promise

      expect(updated).toBeNull()
    })

    it('should preserve id, provider and createdAt', async () => {
      const promise = updateSSOConnection('sso-okta', { status: 'inactive' })
      vi.advanceTimersByTime(300)
      const updated = await promise

      expect(updated?.id).toBe('sso-okta')
      expect(updated?.provider).toBe('okta')
      expect(updated?.createdAt).toBe('2025-06-01')
    })
  })

  describe('deleteSSOConnection', () => {
    it('should delete existing connection', async () => {
      const promise = deleteSSOConnection('sso-okta')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(true)
    })

    it('should return false for non-existent connection', async () => {
      const promise = deleteSSOConnection('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('testSSOConnection', () => {
    it('should return test result for active connection', async () => {
      const promise = testSSOConnection('sso-okta')
      vi.advanceTimersByTime(1000)
      const result = await promise

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('provider')
      expect(result).toHaveProperty('responseTime')
      expect(result).toHaveProperty('assertions')
      expect(result).toHaveProperty('testedAt')
      expect(result.success).toBe(true)
      expect(result.assertions.length).toBeGreaterThan(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should return failure for non-existent connection', async () => {
      const promise = testSSOConnection('non-existent')
      vi.advanceTimersByTime(1000)
      const result = await promise

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('getJWTConfig', () => {
    it('should return JWT configuration', () => {
      const config = getJWTConfig()

      expect(config).toHaveProperty('algorithm')
      expect(config).toHaveProperty('accessTokenTTL')
      expect(config).toHaveProperty('refreshTokenTTL')
      expect(config).toHaveProperty('issuer')
      expect(config).toHaveProperty('audience')
      expect(config.algorithm).toBe('RS256')
      expect(config.accessTokenTTL).toBeGreaterThan(0)
    })
  })

  describe('getSessionConfig', () => {
    it('should return session configuration', () => {
      const config = getSessionConfig()

      expect(config).toHaveProperty('maxDuration')
      expect(config).toHaveProperty('idleTimeout')
      expect(config).toHaveProperty('maxConcurrentSessions')
      expect(config).toHaveProperty('forceReauthInterval')
      expect(config.maxConcurrentSessions).toBeGreaterThan(0)
    })
  })

  describe('getSSOAuditLogs', () => {
    it('should return audit logs', async () => {
      const promise = getSSOAuditLogs()
      vi.advanceTimersByTime(200)
      const logs = await promise

      expect(logs.length).toBeGreaterThan(0)
      logs.forEach((l) => {
        expect(l).toHaveProperty('id')
        expect(l).toHaveProperty('action')
        expect(l).toHaveProperty('provider')
        expect(l).toHaveProperty('success')
        expect(l).toHaveProperty('ip')
        expect(l).toHaveProperty('timestamp')
      })
    })

    it('should respect limit parameter', async () => {
      const promise = getSSOAuditLogs(2)
      vi.advanceTimersByTime(200)
      const logs = await promise

      expect(logs).toHaveLength(2)
    })

    it('should include various action types', async () => {
      const promise = getSSOAuditLogs()
      vi.advanceTimersByTime(200)
      const logs = await promise

      const actions = logs.map((l) => l.action)
      expect(actions).toContain('login')
      expect(actions).toContain('logout')
    })
  })
})
