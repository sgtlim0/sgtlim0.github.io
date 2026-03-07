import { describe, it, expect, beforeEach } from 'vitest'
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
    localStorage.clear()
  })

  describe('getSSOConnections', () => {
    it('should return mock connections', async () => {
      const connections = await getSSOConnections()
      expect(connections.length).toBe(2)
    })

    it('should include Okta and Azure AD', async () => {
      const connections = await getSSOConnections()
      expect(connections.some((c) => c.provider === 'okta')).toBe(true)
      expect(connections.some((c) => c.provider === 'azure-ad')).toBe(true)
    })
  })

  describe('getSSOConnectionById', () => {
    it('should return connection for valid id', async () => {
      const conn = await getSSOConnectionById('sso-okta')
      expect(conn).not.toBeNull()
      expect(conn!.provider).toBe('okta')
      expect(conn!.status).toBe('active')
    })

    it('should return null for invalid id', async () => {
      const conn = await getSSOConnectionById('nonexistent')
      expect(conn).toBeNull()
    })
  })

  describe('createSSOConnection', () => {
    it('should create a new connection', async () => {
      const conn = await createSSOConnection(
        'google',
        'Google Workspace',
        'https://accounts.google.com/saml',
        'https://accounts.google.com/sso',
        'cert-data',
      )

      expect(conn.provider).toBe('google')
      expect(conn.name).toBe('Google Workspace')
      expect(conn.status).toBe('inactive')
    })

    it('should persist new connection', async () => {
      await createSSOConnection('google', 'Google', 'entity', 'url', 'cert')
      const connections = await getSSOConnections()
      expect(connections.length).toBe(3)
    })
  })

  describe('updateSSOConnection', () => {
    it('should update connection status', async () => {
      const updated = await updateSSOConnection('sso-azure', { status: 'active' })
      expect(updated).not.toBeNull()
      expect(updated!.status).toBe('active')
    })

    it('should preserve immutable fields', async () => {
      const updated = await updateSSOConnection('sso-okta', { name: 'Updated Name' })
      expect(updated!.id).toBe('sso-okta')
      expect(updated!.provider).toBe('okta')
      expect(updated!.name).toBe('Updated Name')
    })

    it('should return null for invalid id', async () => {
      const result = await updateSSOConnection('nonexistent', { status: 'active' })
      expect(result).toBeNull()
    })
  })

  describe('deleteSSOConnection', () => {
    it('should delete connection', async () => {
      const result = await deleteSSOConnection('sso-azure')
      expect(result).toBe(true)

      const connections = await getSSOConnections()
      expect(connections.length).toBe(1)
    })

    it('should return false for non-existent', async () => {
      const result = await deleteSSOConnection('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('testSSOConnection', () => {
    it('should return success for active connection', async () => {
      const result = await testSSOConnection('sso-okta')
      expect(result.success).toBe(true)
      expect(result.provider).toBe('okta')
      expect(result.assertions.length).toBeGreaterThan(0)
      expect(result.errors.length).toBe(0)
    })

    it('should return failure for non-existent connection', async () => {
      const result = await testSSOConnection('nonexistent')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should include response time', async () => {
      const result = await testSSOConnection('sso-okta')
      expect(result.responseTime).toBeGreaterThan(0)
    })

    it('should include assertion mapping', async () => {
      const result = await testSSOConnection('sso-okta')
      const emailAssertion = result.assertions.find((a) => a.attribute === 'email')
      expect(emailAssertion).toBeDefined()
      expect(emailAssertion!.mapped).toBe(true)
    })
  })

  describe('getJWTConfig', () => {
    it('should return JWT configuration', () => {
      const config = getJWTConfig()
      expect(config.algorithm).toBe('RS256')
      expect(config.accessTokenTTL).toBe(3600)
      expect(config.refreshTokenTTL).toBe(604800)
      expect(config.issuer).toBeDefined()
    })
  })

  describe('getSessionConfig', () => {
    it('should return session configuration', () => {
      const config = getSessionConfig()
      expect(config.maxDuration).toBeGreaterThan(0)
      expect(config.idleTimeout).toBeGreaterThan(0)
      expect(config.maxConcurrentSessions).toBeGreaterThan(0)
    })
  })

  describe('getSSOAuditLogs', () => {
    it('should return audit logs', async () => {
      const logs = await getSSOAuditLogs()
      expect(logs.length).toBeGreaterThan(0)
    })

    it('should respect limit', async () => {
      const logs = await getSSOAuditLogs(3)
      expect(logs.length).toBeLessThanOrEqual(3)
    })

    it('should include action types', async () => {
      const logs = await getSSOAuditLogs()
      const actions = logs.map((l) => l.action)
      expect(actions).toContain('login')
    })
  })
})
