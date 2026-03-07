import { describe, it, expect } from 'vitest'
import {
  SERVICE_REGISTRY,
  getServicesByDomain,
  getServiceById,
  getAllEndpoints,
  getDomainStats,
} from '../src/admin/services/serviceRegistry'

describe('serviceRegistry', () => {
  it('should have 26 registered services', () => {
    expect(SERVICE_REGISTRY.length).toBe(27)
  })

  it('should have unique service ids', () => {
    const ids = SERVICE_REGISTRY.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should get services by domain', () => {
    const enterprise = getServicesByDomain('enterprise')
    expect(enterprise.length).toBeGreaterThan(0)
    enterprise.forEach((s) => expect(s.domain).toBe('enterprise'))
  })

  it('should get service by id', () => {
    const auth = getServiceById('auth')
    expect(auth).toBeDefined()
    expect(auth!.name).toBe('인증')
  })

  it('should return undefined for invalid id', () => {
    expect(getServiceById('nonexistent')).toBeUndefined()
  })

  it('should get all endpoints', () => {
    const endpoints = getAllEndpoints()
    expect(endpoints.length).toBeGreaterThan(30)
    endpoints.forEach((e) => expect(e).toMatch(/^\/api\//))
  })

  it('should get domain stats', () => {
    const stats = getDomainStats()
    expect(stats.length).toBeGreaterThan(5)
    const total = stats.reduce((sum, s) => sum + s.count, 0)
    expect(total).toBe(27)
  })

  it('should have all services with phase numbers', () => {
    SERVICE_REGISTRY.forEach((s) => {
      expect(s.phase).toBeGreaterThan(0)
      expect(s.phase).toBeLessThanOrEqual(54)
    })
  })

  it('should have valid dependency references', () => {
    const ids = new Set(SERVICE_REGISTRY.map((s) => s.id))
    SERVICE_REGISTRY.forEach((s) => {
      s.dependencies.forEach((dep) => {
        expect(ids.has(dep)).toBe(true)
      })
    })
  })
})
