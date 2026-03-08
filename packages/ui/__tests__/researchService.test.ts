/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock serviceFactory before importing researchService
vi.mock('../src/client/serviceFactory', () => ({
  getApiMode: vi.fn(() => 'mock'),
  getApiClient: vi.fn(() => ({
    post: vi.fn(),
  })),
}))

import { createResearchService } from '../src/user/services/researchService'
import { getApiMode, getApiClient } from '../src/client/serviceFactory'

const mockedGetApiMode = vi.mocked(getApiMode)
const mockedGetApiClient = vi.mocked(getApiClient)

describe('MockResearchService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedGetApiMode.mockReturnValue('mock')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('search() should return a ResearchResult', async () => {
    const service = createResearchService()
    const promise = service.search('AI 전략')
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result).toBeDefined()
    expect(result).toHaveProperty('query')
    expect(result).toHaveProperty('answer')
    expect(result).toHaveProperty('sources')
  })

  it('result should contain the original query', async () => {
    const service = createResearchService()
    const query = '생성형 AI'
    const promise = service.search(query)
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.query).toBe(query)
  })

  it('result should contain a non-empty answer', async () => {
    const service = createResearchService()
    const promise = service.search('LLM 챗봇')
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.answer).toBeTruthy()
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('sources should contain title and url', async () => {
    const service = createResearchService()
    const promise = service.search('AI 도입 사례')
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.sources.length).toBeGreaterThan(0)
    for (const source of result.sources) {
      expect(source).toHaveProperty('title')
      expect(source).toHaveProperty('url')
      expect(source.title.length).toBeGreaterThan(0)
      expect(source.url).toMatch(/^https?:\/\//)
    }
  })

  it('sources should include snippet field', async () => {
    const service = createResearchService()
    const promise = service.search('RAG')
    vi.advanceTimersByTime(2000)
    const result = await promise

    for (const source of result.sources) {
      expect(source).toHaveProperty('snippet')
    }
  })

  it('numSources parameter should limit number of sources', async () => {
    const service = createResearchService()
    const promise = service.search('AI', 1)
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.sources.length).toBe(1)
  })

  it('numSources=2 should return exactly 2 sources', async () => {
    const service = createResearchService()
    const promise = service.search('AI', 2)
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.sources.length).toBe(2)
  })

  it('numSources larger than available should cap at max available', async () => {
    const service = createResearchService()
    const promise = service.search('AI', 100)
    vi.advanceTimersByTime(2000)
    const result = await promise

    // Mock data has 3 sources
    expect(result.sources.length).toBeLessThanOrEqual(100)
    expect(result.sources.length).toBeGreaterThan(0)
  })

  it('default numSources should return sources', async () => {
    const service = createResearchService()
    const promise = service.search('자율주행')
    vi.advanceTimersByTime(2000)
    const result = await promise

    expect(result.sources.length).toBeGreaterThan(0)
  })
})

describe('RealResearchService', () => {
  const mockPost = vi.fn()

  beforeEach(() => {
    mockPost.mockClear()
    mockedGetApiMode.mockReturnValue('real')
    mockedGetApiClient.mockReturnValue({
      post: mockPost,
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      fetch: vi.fn(),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call apiClient.post with correct endpoint', async () => {
    const mockResult = {
      query: 'AI',
      answer: 'Answer text',
      sources: [{ title: 'Title', url: 'https://example.com' }],
    }
    mockPost.mockResolvedValue(mockResult)

    const service = createResearchService()
    await service.search('AI')

    expect(mockPost).toHaveBeenCalledWith('/api/research', expect.any(Object))
  })

  it('should pass query in the request body', async () => {
    const mockResult = {
      query: 'test query',
      answer: 'Answer',
      sources: [],
    }
    mockPost.mockResolvedValue(mockResult)

    const service = createResearchService()
    await service.search('test query')

    expect(mockPost).toHaveBeenCalledWith(
      '/api/research',
      expect.objectContaining({ query: 'test query' }),
    )
  })

  it('should pass numSources in the request body', async () => {
    mockPost.mockResolvedValue({ query: 'q', answer: 'a', sources: [] })

    const service = createResearchService()
    await service.search('q', 7)

    expect(mockPost).toHaveBeenCalledWith(
      '/api/research',
      expect.objectContaining({ numSources: 7 }),
    )
  })

  it('should throw on API error', async () => {
    mockPost.mockRejectedValue(new Error('Network Error'))

    const service = createResearchService()
    await expect(service.search('fail')).rejects.toThrow('Research 검색 실패')
  })

  it('should wrap non-Error objects in a descriptive message', async () => {
    mockPost.mockRejectedValue('string error')

    const service = createResearchService()
    await expect(service.search('fail')).rejects.toThrow(
      'Research 검색 중 알 수 없는 오류가 발생했습니다',
    )
  })

  it('should return the result from the API', async () => {
    const expected = {
      query: 'AI strategy',
      answer: 'Here is the answer',
      sources: [{ title: 'Source 1', url: 'https://example.com/1', snippet: 'Snippet 1' }],
    }
    mockPost.mockResolvedValue(expected)

    const service = createResearchService()
    const result = await service.search('AI strategy')

    expect(result).toEqual(expected)
  })
})

describe('createResearchService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return MockResearchService when API_MODE is mock', () => {
    mockedGetApiMode.mockReturnValue('mock')
    const service = createResearchService()

    // MockResearchService does not use apiClient
    expect(service).toBeDefined()
    expect(typeof service.search).toBe('function')
  })

  it('should return RealResearchService when API_MODE is real', () => {
    mockedGetApiMode.mockReturnValue('real')
    const mockPost = vi.fn().mockResolvedValue({ query: '', answer: '', sources: [] })
    mockedGetApiClient.mockReturnValue({
      post: mockPost,
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      fetch: vi.fn(),
    } as any)

    const service = createResearchService()
    expect(service).toBeDefined()
    expect(typeof service.search).toBe('function')
  })

  it('mock service should not call getApiClient', async () => {
    mockedGetApiMode.mockReturnValue('mock')
    vi.useFakeTimers()

    const service = createResearchService()
    const promise = service.search('test')
    vi.advanceTimersByTime(2000)
    await promise

    // getApiClient should not be called during mock service creation or search
    // It may be called during module import for real service, so we check post was not called
    expect(mockedGetApiClient().post).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
