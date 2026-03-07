import { describe, it, expect, vi } from 'vitest'
import { captureError, captureMessage, setUser, clearUser } from '../src/utils/errorMonitoring'
import { checkServiceHealth, getSystemHealth } from '../src/utils/healthCheck'

describe('errorMonitoring', () => {
  it('captureError should not throw', () => {
    expect(() => captureError(new Error('test'))).not.toThrow()
  })

  it('captureError with context should not throw', () => {
    expect(() =>
      captureError(new Error('test'), { component: 'App', action: 'render' }),
    ).not.toThrow()
  })

  it('captureMessage should not throw', () => {
    expect(() => captureMessage('test info')).not.toThrow()
    expect(() => captureMessage('test warning', 'warning')).not.toThrow()
    expect(() => captureMessage('test error', 'error')).not.toThrow()
  })

  it('setUser should not throw', () => {
    expect(() => setUser({ id: '1', email: 'test@test.com', role: 'admin' })).not.toThrow()
  })

  it('clearUser should not throw', () => {
    expect(() => clearUser()).not.toThrow()
  })
})

describe('healthCheck', () => {
  it('should report down for unreachable service', async () => {
    const result = await checkServiceHealth('test', 'http://localhost:99999', 1000)
    expect(result.status).toBe('down')
    expect(result.name).toBe('test')
    expect(result.latency).toBeDefined()
  })

  it('getSystemHealth should aggregate results', async () => {
    const health = await getSystemHealth([{ name: 'unreachable', url: 'http://localhost:99999' }])
    expect(health.status).toBe('unhealthy')
    expect(health.services).toHaveLength(1)
    expect(health.timestamp).toBeDefined()
  })
})
