import { describe, it, expect } from 'vitest'

import {
  API_VERSION,
  withVersionHeaders,
} from '../../../apps/user/app/api/v1/version'

describe('API Versioning', () => {
  describe('API_VERSION constant', () => {
    it('should be "v1"', () => {
      expect(API_VERSION).toBe('v1')
    })
  })

  describe('withVersionHeaders', () => {
    it('should add X-API-Version header to response', () => {
      const response = new Response('ok', { status: 200 })
      const result = withVersionHeaders(response)

      expect(result.headers.get('X-API-Version')).toBe('v1')
    })

    it('should not add deprecation headers for non-deprecated endpoints', () => {
      const response = new Response('ok', { status: 200 })
      const result = withVersionHeaders(response, false)

      expect(result.headers.get('X-API-Version')).toBe('v1')
      expect(result.headers.get('Deprecation')).toBeNull()
      expect(result.headers.get('Sunset')).toBeNull()
      expect(result.headers.get('Link')).toBeNull()
    })

    it('should add deprecation headers when deprecated=true', () => {
      const response = new Response('ok', { status: 200 })
      const result = withVersionHeaders(response, true)

      expect(result.headers.get('X-API-Version')).toBe('v1')
      expect(result.headers.get('Deprecation')).toBe('true')
      expect(result.headers.get('Sunset')).toBeTruthy()
      expect(result.headers.get('Link')).toBe('</api/v1>; rel="successor-version"')
    })

    it('should set Sunset header ~180 days in the future', () => {
      const response = new Response('ok', { status: 200 })
      const before = Date.now()
      const result = withVersionHeaders(response, true)
      const after = Date.now()

      const sunsetDate = new Date(result.headers.get('Sunset')!).getTime()
      const expectedMin = before + 180 * 24 * 60 * 60 * 1000
      const expectedMax = after + 180 * 24 * 60 * 60 * 1000

      expect(sunsetDate).toBeGreaterThanOrEqual(expectedMin - 1000)
      expect(sunsetDate).toBeLessThanOrEqual(expectedMax + 1000)
    })

    it('should return the same response instance', () => {
      const response = new Response('ok', { status: 200 })
      const result = withVersionHeaders(response)

      expect(result).toBe(response)
    })

    it('should preserve existing headers on the response', () => {
      const response = new Response('ok', {
        status: 200,
        headers: { 'X-Custom': 'value' },
      })
      const result = withVersionHeaders(response)

      expect(result.headers.get('X-Custom')).toBe('value')
      expect(result.headers.get('X-API-Version')).toBe('v1')
    })

    it('should work with error responses', () => {
      const response = new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
      const result = withVersionHeaders(response, true)

      expect(result.status).toBe(404)
      expect(result.headers.get('X-API-Version')).toBe('v1')
      expect(result.headers.get('Deprecation')).toBe('true')
    })
  })

  describe('MSW v1 handler compatibility', () => {
    it('should export chatHandlers with v1 paths', async () => {
      const { chatHandlers } = await import('../src/mocks/handlers/chat')

      expect(chatHandlers).toBeDefined()
      expect(chatHandlers.length).toBeGreaterThanOrEqual(6)
    })
  })
})
