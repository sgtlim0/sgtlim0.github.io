/**
 * Client layer tests: ApiClient (GET/POST/PUT/DELETE, error handling, token injection, ApiError)
 * and serviceFactory (getApiMode, getApiUrl, getAiCoreUrl, getApiClient singleton, factory functions).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiClient, ApiError } from '../src/client/apiClient'

// --- ApiClient & ApiError ---

describe('ApiClient (unit)', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function jsonResponse(body: unknown, status = 200, ok = true) {
    return Promise.resolve({
      ok,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
    } as Response)
  }

  function makeClient(getToken?: () => string | null) {
    return new ApiClient({ baseURL: 'https://api.test', getToken })
  }

  it('GET sends method GET and includes Content-Type', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: { id: 1 } }))
    const client = makeClient()
    const result = await client.get<{ id: number }>('/items')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/items',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual({ id: 1 })
  })

  it('POST sends JSON body', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: { created: true } }))
    const client = makeClient()
    await client.post('/items', { name: 'test' })

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(opts.body).toBe(JSON.stringify({ name: 'test' }))
  })

  it('POST without body sends no body', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: {} }))
    const client = makeClient()
    await client.post('/items')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.body).toBeUndefined()
  })

  it('PUT sends JSON body', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: { updated: true } }))
    const client = makeClient()
    await client.put('/items/1', { name: 'updated' })

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('PUT')
    expect(opts.body).toBe(JSON.stringify({ name: 'updated' }))
  })

  it('DELETE sends DELETE method', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: null }))
    const client = makeClient()
    await client.delete('/items/1')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('DELETE')
  })

  it('injects Authorization header when getToken returns a value', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: {} }))
    const client = makeClient(() => 'my-secret-token')
    await client.get('/secure')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers).toHaveProperty('Authorization', 'Bearer my-secret-token')
  })

  it('omits Authorization header when getToken returns null', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: {} }))
    const client = makeClient(() => null)
    await client.get('/public')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers).not.toHaveProperty('Authorization')
  })

  it('throws ApiError on non-ok response with error body', async () => {
    fetchMock.mockReturnValue(jsonResponse({ error: 'Not Found' }, 404, false))
    const client = makeClient()

    await expect(client.get('/missing')).rejects.toThrow(ApiError)

    fetchMock.mockReturnValue(jsonResponse({ error: 'Not Found' }, 404, false))
    try {
      await client.get('/missing')
    } catch (e) {
      expect((e as ApiError).status).toBe(404)
      expect((e as ApiError).message).toBe('Not Found')
    }
  })

  it('throws ApiError with statusText when error body parse fails', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('invalid json')),
      } as unknown as Response),
    )
    const client = makeClient()

    try {
      await client.get('/fail')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(500)
      expect((e as ApiError).message).toBe('Internal Server Error')
    }
  })

  it('throws ApiError when response.ok but success===false', async () => {
    fetchMock.mockReturnValue(
      jsonResponse({ success: false, error: 'Validation failed' }),
    )
    const client = makeClient()

    try {
      await client.get('/bad')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(400)
      expect((e as ApiError).message).toBe('Validation failed')
    }
  })

  it('throws ApiError with default message when success false and no error field', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: false }))
    const client = makeClient()

    try {
      await client.get('/bad2')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).message).toBe('Request failed')
    }
  })

  it('returns json directly when success field is not false (no data wrapper)', async () => {
    fetchMock.mockReturnValue(jsonResponse({ items: [1, 2, 3] }))
    const client = makeClient()
    const result = await client.get<{ items: number[] }>('/plain')
    expect(result).toEqual({ items: [1, 2, 3] })
  })

  it('merges custom headers with defaults', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: {} }))
    const client = makeClient()
    await client.fetch('/custom', {
      headers: { 'X-Custom': 'value' } as Record<string, string>,
    })

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(opts.headers['X-Custom']).toBe('value')
  })

  it('PUT without body sends undefined body', async () => {
    fetchMock.mockReturnValue(jsonResponse({ success: true, data: {} }))
    const client = makeClient()
    await client.put('/items/1')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('PUT')
    expect(opts.body).toBeUndefined()
  })
})

describe('ApiError', () => {
  it('has correct name property', () => {
    const err = new ApiError(401, 'Unauthorized')
    expect(err.name).toBe('ApiError')
    expect(err.status).toBe(401)
    expect(err.message).toBe('Unauthorized')
    expect(err).toBeInstanceOf(Error)
  })
})

// --- serviceFactory ---

describe('serviceFactory', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  describe('getApiMode', () => {
    it('returns "mock" by default when env not set', async () => {
      const { getApiMode } = await import('../src/client/serviceFactory')
      const mode = getApiMode()
      expect(mode).toBe('mock')
    })
  })

  describe('getApiUrl', () => {
    it('returns default url when env not set', async () => {
      const { getApiUrl } = await import('../src/client/serviceFactory')
      const url = getApiUrl()
      expect(url).toBe('http://localhost:3000/api')
    })
  })

  describe('getAiCoreUrl', () => {
    it('returns default ai core url when env not set', async () => {
      const { getAiCoreUrl } = await import('../src/client/serviceFactory')
      const url = getAiCoreUrl()
      expect(url).toBe('http://localhost:8000')
    })
  })

  describe('getApiClient', () => {
    it('returns an ApiClient instance', async () => {
      vi.resetModules()
      const { getApiClient } = await import('../src/client/serviceFactory')
      const client = getApiClient()
      // After vi.resetModules(), instanceof may fail across import boundaries,
      // so we verify duck-type instead
      expect(client).toBeDefined()
      expect(typeof client.get).toBe('function')
      expect(typeof client.post).toBe('function')
      expect(typeof client.put).toBe('function')
      expect(typeof client.delete).toBe('function')
    })

    it('returns the same singleton on subsequent calls', async () => {
      vi.resetModules()
      const { getApiClient } = await import('../src/client/serviceFactory')
      const first = getApiClient()
      const second = getApiClient()
      expect(first).toBe(second)
    })
  })

  describe('createAuthService', () => {
    it('returns mockAuthService when mode is mock', async () => {
      vi.resetModules()
      const { createAuthService } = await import('../src/client/serviceFactory')
      const service = await createAuthService()
      expect(service).toBeDefined()
      expect(typeof service.login).toBe('function')
      expect(typeof service.logout).toBe('function')
    })
  })

  describe('createAdminService', () => {
    it('returns mockApiService when mode is mock', async () => {
      vi.resetModules()
      const { createAdminService } = await import('../src/client/serviceFactory')
      const service = await createAdminService()
      expect(service).toBeDefined()
    })
  })

  describe('createChatService', () => {
    it('returns a RealChatService instance', async () => {
      vi.resetModules()
      const { createChatService } = await import('../src/client/serviceFactory')
      const { RealChatService } = await import('../src/user/services/realChatService')
      const service = createChatService()
      expect(service).toBeInstanceOf(RealChatService)
    })
  })
})
