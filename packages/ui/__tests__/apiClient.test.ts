import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../src/mocks/server'
import { ApiClient, ApiError } from '../src/client/apiClient'

const client = new ApiClient({ baseURL: '' })

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ApiClient', () => {
  describe('get', () => {
    it('should fetch dashboard data', async () => {
      const data = await client.get<{ stats: unknown[] }>('/api/admin/dashboard')
      expect(data.stats).toBeInstanceOf(Array)
    })

    it('should fetch users', async () => {
      const data = await client.get<unknown[]>('/api/admin/users')
      expect(data).toBeInstanceOf(Array)
    })
  })

  describe('post', () => {
    it('should send chat message', async () => {
      const data = await client.post<{ role: string; content: string }>('/api/chat/send', {
        conversationId: 'conv-1',
        content: '테스트',
      })
      expect(data.role).toBe('assistant')
    })

    it('should handle login', async () => {
      const data = await client.post<{ token: string }>('/api/auth/login', {
        email: 'admin@hchat.ai',
        password: 'test',
      })
      expect(data.token).toBeDefined()
    })
  })

  describe('put', () => {
    it('should update settings', async () => {
      const data = await client.put('/api/admin/settings', { theme: 'dark' })
      expect(data).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should throw ApiError on 401', async () => {
      await expect(
        client.post('/api/auth/login', { email: 'wrong@test.com', password: 'bad' }),
      ).rejects.toThrow(ApiError)
    })

    it('should have correct status on ApiError', async () => {
      try {
        await client.post('/api/auth/login', { email: 'wrong@test.com', password: 'bad' })
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(401)
      }
    })
  })
})
