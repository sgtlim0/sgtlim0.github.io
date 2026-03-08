import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// UserServiceProvider + useUserService
// ---------------------------------------------------------------------------

describe('UserServiceProvider', () => {
  it('provides default MockUserService when no service prop', async () => {
    const { UserServiceProvider, useUserService } = await import(
      '../src/user/services/UserServiceProvider'
    )

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(UserServiceProvider, null, children)

    const { result } = renderHook(() => useUserService(), { wrapper })

    // Default service should have all required methods
    expect(typeof result.current.getConversations).toBe('function')
    expect(typeof result.current.createConversation).toBe('function')
    expect(typeof result.current.deleteConversation).toBe('function')
    expect(typeof result.current.sendMessage).toBe('function')
    expect(typeof result.current.getAssistants).toBe('function')
  })

  it('provides custom service when passed via prop', async () => {
    const { UserServiceProvider, useUserService } = await import(
      '../src/user/services/UserServiceProvider'
    )

    const customService = {
      getConversations: vi.fn().mockResolvedValue([]),
      createConversation: vi.fn(),
      deleteConversation: vi.fn(),
      sendMessage: vi.fn(),
      getAssistants: vi.fn().mockResolvedValue([]),
      getCustomAssistants: vi.fn().mockResolvedValue([]),
      createAssistant: vi.fn(),
      updateAssistant: vi.fn(),
      deleteAssistant: vi.fn(),
      getUsageStats: vi.fn().mockResolvedValue([]),
      getSubscription: vi.fn(),
      getTranslationJobs: vi.fn().mockResolvedValue([]),
      getDocProjects: vi.fn().mockResolvedValue([]),
      getOCRJobs: vi.fn().mockResolvedValue([]),
    }

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        UserServiceProvider,
        { service: customService },
        children,
      )

    const { result } = renderHook(() => useUserService(), { wrapper })

    expect(result.current).toBe(customService)
  })
})

// ---------------------------------------------------------------------------
// sseService - mock stream
// ---------------------------------------------------------------------------

describe('sseService - mock stream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('streamResponse (mock mode) delivers chunks and calls onDone', async () => {
    // Ensure mock mode
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock')

    const { streamResponse } = await import('../src/user/services/sseService')
    const stream = streamResponse('hello', 'chat')

    const chunks: string[] = []
    let done = false

    stream.subscribe(
      (chunk) => chunks.push(chunk),
      () => { done = true },
      () => {},
    )

    // Advance time enough for all chunks to complete
    vi.advanceTimersByTime(10000)

    expect(chunks.length).toBeGreaterThan(0)
    expect(done).toBe(true)
  })

  it('streamResponse (mock mode) abort stops chunk delivery', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock')

    const { streamResponse } = await import('../src/user/services/sseService')
    const stream = streamResponse('hello', 'chat')

    const chunks: string[] = []
    let done = false

    stream.subscribe(
      (chunk) => chunks.push(chunk),
      () => { done = true },
      () => {},
    )

    // Abort immediately
    stream.abort()

    vi.advanceTimersByTime(10000)

    // Should have received 0 chunks since abort was immediate
    expect(chunks.length).toBe(0)
    expect(done).toBe(false)
  })

  it('createStreamResponse returns mock stream in mock mode', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock')

    const { createStreamResponse } = await import(
      '../src/user/services/sseService'
    )
    const stream = createStreamResponse('test', 'chat', [
      { role: 'user', content: 'previous' },
    ])

    expect(stream).toHaveProperty('subscribe')
    expect(stream).toHaveProperty('abort')
    expect(typeof stream.subscribe).toBe('function')
    expect(typeof stream.abort).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// realSseService - parseSSELine coverage
// ---------------------------------------------------------------------------

describe('realSseService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('realStreamResponse sends POST with message and history', async () => {
    // Create a mock readable stream that finishes immediately
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"text":"hello"}\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: vi.fn(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    const chunks: string[] = []
    let doneCalled = false
    let errorCalled = false

    const stream = realStreamResponse('hello', 'asst-1', [
      { role: 'user', content: 'prev' },
    ])

    stream.subscribe(
      (chunk) => chunks.push(chunk),
      () => { doneCalled = true },
      () => { errorCalled = true },
    )

    // Wait for promises to resolve
    await vi.waitFor(() => {
      expect(doneCalled).toBe(true)
    })

    expect(chunks).toContain('hello')
    expect(errorCalled).toBe(false)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/stream'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('realStreamResponse handles [DONE] signal', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"text":"chunk1"}\ndata: [DONE]\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: vi.fn(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    const chunks: string[] = []
    let doneCalled = false

    const stream = realStreamResponse('test', 'asst-1')

    stream.subscribe(
      (chunk) => chunks.push(chunk),
      () => { doneCalled = true },
      () => {},
    )

    await vi.waitFor(() => {
      expect(doneCalled).toBe(true)
    })

    expect(chunks).toContain('chunk1')
  })

  it('realStreamResponse handles [ERROR] data', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: [ERROR] Something went wrong\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: vi.fn(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    let errorMessage = ''

    const stream = realStreamResponse('test', 'asst-1')

    stream.subscribe(
      () => {},
      () => {},
      (err) => { errorMessage = err.message },
    )

    await vi.waitFor(() => {
      expect(errorMessage).toContain('[ERROR]')
    })
  })

  it('realStreamResponse handles non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    let errorMessage = ''

    const stream = realStreamResponse('test', 'asst-1')

    stream.subscribe(
      () => {},
      () => {},
      (err) => { errorMessage = err.message },
    )

    await vi.waitFor(() => {
      expect(errorMessage).toContain('SSE connection failed')
    })
  })

  it('realStreamResponse abort suppresses errors', async () => {
    mockFetch.mockRejectedValue(new DOMException('Aborted', 'AbortError'))

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    let errorCalled = false

    const stream = realStreamResponse('test', 'asst-1')
    stream.abort()

    stream.subscribe(
      () => {},
      () => {},
      () => { errorCalled = true },
    )

    // Give time for the aborted fetch to resolve
    await new Promise((r) => setTimeout(r, 50))

    expect(errorCalled).toBe(false)
  })

  it('realStreamResponse handles plain text data without JSON', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: plain text chunk\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: vi.fn(),
    }

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    const chunks: string[] = []
    let doneCalled = false

    const stream = realStreamResponse('test', 'asst-1')

    stream.subscribe(
      (chunk) => chunks.push(chunk),
      () => { doneCalled = true },
      () => {},
    )

    await vi.waitFor(() => {
      expect(doneCalled).toBe(true)
    })

    expect(chunks).toContain('plain text chunk')
  })

  it('realStreamResponse handles no response body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    })

    const { realStreamResponse } = await import(
      '../src/user/services/realSseService'
    )

    let errorMessage = ''

    const stream = realStreamResponse('test', 'asst-1')

    stream.subscribe(
      () => {},
      () => {},
      (err) => { errorMessage = err.message },
    )

    await vi.waitFor(() => {
      expect(errorMessage).toContain('ReadableStream not available')
    })
  })
})

// ---------------------------------------------------------------------------
// researchService
// ---------------------------------------------------------------------------

describe('researchService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('mock research service returns results with sources', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock')

    const { createResearchService } = await import(
      '../src/user/services/researchService'
    )
    const service = createResearchService()

    const resultPromise = service.search('AI strategy', 2)
    vi.advanceTimersByTime(1500)
    const result = await resultPromise

    expect(result.query).toBe('AI strategy')
    expect(result.answer).toBeTruthy()
    expect(result.sources.length).toBeLessThanOrEqual(2)
  })

  it('mock research service limits sources to numSources', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock')

    const { createResearchService } = await import(
      '../src/user/services/researchService'
    )
    const service = createResearchService()

    const resultPromise = service.search('test', 1)
    vi.advanceTimersByTime(1500)
    const result = await resultPromise

    expect(result.sources.length).toBe(1)
  })
})
