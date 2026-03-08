import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { LlmRouterServiceProvider } from '../src/llm-router/services/LlmRouterServiceProvider'
import {
  useModels,
  useModelById,
  useDashboardStats,
  useUsageStats,
  useMonthlyUsage,
  useModelUsageBreakdown,
  useAPIKeys,
} from '../src/llm-router/services/hooks'
import { useStreamingChat } from '../src/llm-router/services/streamingHooks'
import type { LlmRouterService } from '../src/llm-router/services/llmRouterService'

// Mock streamingService for streamingHooks tests
vi.mock('../src/llm-router/services/streamingService', () => ({
  streamChatCompletion: vi.fn((options) => {
    const { onToken, onComplete, onError, model } = options

    if (model === 'error-model') {
      setTimeout(() => onError?.(new Error('Stream error')), 10)
      return { abort: vi.fn() }
    }

    // Simulate streaming
    let aborted = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const t1 = setTimeout(() => {
      if (!aborted) onToken?.('Hello')
    }, 10)
    timeouts.push(t1)

    const t2 = setTimeout(() => {
      if (!aborted) onToken?.(' World')
    }, 20)
    timeouts.push(t2)

    const t3 = setTimeout(() => {
      if (!aborted) {
        onComplete?.({
          content: 'Hello World',
          model,
          inputTokens: 5,
          outputTokens: 10,
          totalTokens: 15,
          responseTimeMs: 100,
          estimatedCostKRW: 0.5,
          finishReason: 'stop',
        })
      }
    }, 30)
    timeouts.push(t3)

    return {
      abort: () => {
        aborted = true
        timeouts.forEach(clearTimeout)
      },
    }
  }),
}))

// ========== Mock Service ==========

function createMockService(): LlmRouterService {
  return {
    getModels: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'test-model',
          name: 'Test Model',
          provider: 'TestProvider',
          providerIcon: 'T',
          category: 'chat',
          inputPrice: 100,
          outputPrice: 200,
          contextWindow: 1000,
          maxOutput: 500,
          latency: '1.0\uCD08',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    }),
    getModelById: vi.fn().mockResolvedValue({
      id: 'test-model',
      name: 'Test Model',
      provider: 'TestProvider',
      providerIcon: 'T',
      category: 'chat',
      inputPrice: 100,
      outputPrice: 200,
      contextWindow: 1000,
      maxOutput: 500,
      latency: '1.0\uCD08',
    }),
    getDashboardStats: vi.fn().mockResolvedValue({
      totalModels: 86,
      totalRequests: 10000,
      totalTokens: 5000000,
      totalCost: 250000,
      avgLatency: '1.2\uCD08',
    }),
    getUsageStats: vi.fn().mockResolvedValue([
      { date: '2026-03-01', requests: 100, tokens: 50000, cost: 5000 },
      { date: '2026-03-02', requests: 120, tokens: 60000, cost: 6000 },
    ]),
    getMonthlyUsage: vi.fn().mockResolvedValue([
      { month: '2026-01', requests: 85000, tokens: 185000000, cost: 3200000 },
      { month: '2026-02', requests: 92000, tokens: 205000000, cost: 3800000 },
    ]),
    getModelUsageBreakdown: vi.fn().mockResolvedValue([
      { model: 'GPT-4o', requests: 35000, tokens: 78000000, cost: 850000 },
      { model: 'Claude Sonnet', requests: 28000, tokens: 62000000, cost: 720000 },
    ]),
    getAPIKeys: vi.fn().mockResolvedValue([
      {
        id: 'key-1',
        name: 'Test Key',
        key: 'sk-proj-test123',
        created: '2026-01-01',
        lastUsed: '2026-03-01',
        status: 'active' as const,
      },
    ]),
    createAPIKey: vi.fn().mockResolvedValue({
      id: 'key-new',
      name: 'New Key',
      key: 'sk-proj-new123',
      created: '2026-03-08',
      lastUsed: '-',
      status: 'active' as const,
    }),
    revokeAPIKey: vi.fn().mockResolvedValue(undefined),
  }
}

function createWrapper(service: LlmRouterService) {
  return ({ children }: { children: ReactNode }) =>
    createElement(LlmRouterServiceProvider, { service }, children)
}

// ========== useModels ==========

describe('useModels', () => {
  it('fetches models on mount', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModels(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.models).toHaveLength(1)
    expect(result.current.models[0].id).toBe('test-model')
    expect(result.current.total).toBe(1)
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(20)
    expect(result.current.error).toBeNull()
  })

  it('passes filter params to service', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    renderHook(() => useModels({ provider: 'OpenAI', category: 'chat', search: 'gpt' }), {
      wrapper,
    })

    await waitFor(() => {
      expect(service.getModels).toHaveBeenCalledWith({
        provider: 'OpenAI',
        category: 'chat',
        search: 'gpt',
      })
    })
  })

  it('handles error from service', async () => {
    const service = createMockService()
    ;(service.getModels as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fetch failed'))
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModels(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toBe('Fetch failed')
    expect(result.current.models).toEqual([])
  })

  it('returns empty models when data is null', async () => {
    const service = createMockService()
    ;(service.getModels as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Error'))
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModels(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.models).toEqual([])
    expect(result.current.total).toBe(0)
  })
})

// ========== useModelById ==========

describe('useModelById', () => {
  it('fetches model by ID', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModelById('test-model'), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data?.id).toBe('test-model')
    expect(result.current.error).toBeNull()
  })

  it('handles null result', async () => {
    const service = createMockService()
    ;(service.getModelById as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModelById('nonexistent'), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
  })

  it('handles error', async () => {
    const service = createMockService()
    ;(service.getModelById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'))
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModelById('bad-id'), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toBe('Not found')
  })
})

// ========== useDashboardStats ==========

describe('useDashboardStats', () => {
  it('fetches dashboard stats', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useDashboardStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).not.toBeNull()
    expect(result.current.stats?.totalModels).toBe(86)
    expect(result.current.stats?.totalRequests).toBe(10000)
    expect(result.current.error).toBeNull()
  })

  it('handles error', async () => {
    const service = createMockService()
    ;(service.getDashboardStats as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Stats failed'),
    )
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useDashboardStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Stats failed')
    expect(result.current.stats).toBeNull()
  })
})

// ========== useUsageStats ==========

describe('useUsageStats', () => {
  it('fetches usage stats with default days', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useUsageStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toHaveLength(2)
    expect(service.getUsageStats).toHaveBeenCalledWith(30)
  })

  it('fetches usage stats with custom days', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    renderHook(() => useUsageStats(7), { wrapper })

    await waitFor(() => {
      expect(service.getUsageStats).toHaveBeenCalledWith(7)
    })
  })

  it('returns empty array on error', async () => {
    const service = createMockService()
    ;(service.getUsageStats as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fail'))
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useUsageStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toEqual([])
    expect(result.current.error).not.toBeNull()
  })
})

// ========== useMonthlyUsage ==========

describe('useMonthlyUsage', () => {
  it('fetches monthly usage', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useMonthlyUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.monthlyUsage).toHaveLength(2)
    expect(result.current.monthlyUsage[0].month).toBe('2026-01')
    expect(result.current.error).toBeNull()
  })

  it('returns empty array on error', async () => {
    const service = createMockService()
    ;(service.getMonthlyUsage as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fail'))
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useMonthlyUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.monthlyUsage).toEqual([])
  })
})

// ========== useModelUsageBreakdown ==========

describe('useModelUsageBreakdown', () => {
  it('fetches model usage breakdown', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModelUsageBreakdown(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.modelUsage).toHaveLength(2)
    expect(result.current.modelUsage[0].model).toBe('GPT-4o')
    expect(result.current.error).toBeNull()
  })

  it('returns empty array on error', async () => {
    const service = createMockService()
    ;(service.getModelUsageBreakdown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Fail'),
    )
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useModelUsageBreakdown(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.modelUsage).toEqual([])
  })
})

// ========== useAPIKeys ==========

describe('useAPIKeys', () => {
  it('fetches API keys on mount', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.keys).toHaveLength(1)
    expect(result.current.keys[0].name).toBe('Test Key')
    expect(result.current.error).toBeNull()
  })

  it('creates a new key', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newKey: unknown
    await act(async () => {
      newKey = await result.current.createKey('New Key')
    })

    expect(service.createAPIKey).toHaveBeenCalledWith('New Key')
    expect(result.current.keys).toHaveLength(2)
    expect(result.current.keys[1].name).toBe('New Key')
  })

  it('revokes a key', async () => {
    const service = createMockService()
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.revokeKey('key-1')
    })

    expect(service.revokeAPIKey).toHaveBeenCalledWith('key-1')
    expect(result.current.keys[0].status).toBe('revoked')
  })

  it('handles error when fetching keys', async () => {
    const service = createMockService()
    ;(service.getAPIKeys as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Fetch keys failed'),
    )
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Fetch keys failed')
    expect(result.current.keys).toEqual([])
  })

  it('handles error when creating key', async () => {
    const service = createMockService()
    ;(service.createAPIKey as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Create failed'),
    )
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let caughtError: Error | null = null
    await act(async () => {
      try {
        await result.current.createKey('Fail Key')
      } catch (e) {
        caughtError = e as Error
      }
    })

    expect(caughtError?.message).toBe('Create failed')
    expect(result.current.error?.message).toBe('Create failed')
  })

  it('handles error when revoking key', async () => {
    const service = createMockService()
    ;(service.revokeAPIKey as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Revoke failed'),
    )
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let caughtError: Error | null = null
    await act(async () => {
      try {
        await result.current.revokeKey('key-1')
      } catch (e) {
        caughtError = e as Error
      }
    })

    expect(caughtError?.message).toBe('Revoke failed')
    expect(result.current.error?.message).toBe('Revoke failed')
  })

  it('handles non-Error thrown during fetch', async () => {
    const service = createMockService()
    ;(service.getAPIKeys as ReturnType<typeof vi.fn>).mockRejectedValue('string error')
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Unknown error')
  })

  it('handles non-Error thrown during create', async () => {
    const service = createMockService()
    ;(service.createAPIKey as ReturnType<typeof vi.fn>).mockRejectedValue('string error')
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let caughtError: Error | null = null
    await act(async () => {
      try {
        await result.current.createKey('Fail')
      } catch (e) {
        caughtError = e as Error
      }
    })

    expect(caughtError?.message).toBe('Unknown error')
    expect(result.current.error?.message).toBe('Unknown error')
  })

  it('handles non-Error thrown during revoke', async () => {
    const service = createMockService()
    ;(service.revokeAPIKey as ReturnType<typeof vi.fn>).mockRejectedValue('string error')
    const wrapper = createWrapper(service)

    const { result } = renderHook(() => useAPIKeys(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let caughtError: Error | null = null
    await act(async () => {
      try {
        await result.current.revokeKey('key-1')
      } catch (e) {
        caughtError = e as Error
      }
    })

    expect(caughtError?.message).toBe('Unknown error')
    expect(result.current.error?.message).toBe('Unknown error')
  })
})

// ========== useStreamingChat ==========

describe('useStreamingChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useStreamingChat())

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.streamingContent).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.startStream).toBe('function')
    expect(typeof result.current.stopStream).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('starts streaming and sets isStreaming to true', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    expect(result.current.isStreaming).toBe(true)
    expect(result.current.streamingContent).toBe('')
  })

  it('accumulates streaming content from tokens', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    // Advance to receive tokens
    await act(async () => {
      vi.advanceTimersByTime(15)
    })

    expect(result.current.streamingContent).toContain('Hello')
  })

  it('completes streaming and sets result', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useStreamingChat({ onComplete }))

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    await act(async () => {
      vi.advanceTimersByTime(50)
    })

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.result).not.toBeNull()
    expect(result.current.result?.content).toBe('Hello World')
    expect(result.current.result?.model).toBe('gpt-4o')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('handles error during streaming', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'error-model',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    await act(async () => {
      vi.advanceTimersByTime(20)
    })

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toBe('Stream error')
  })

  it('resets state completely', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    await act(async () => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.streamingContent).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('stops streaming via stopStream', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    act(() => {
      result.current.stopStream()
    })

    // Advance to let any pending callbacks fire
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // After stop, no more tokens should arrive
    const contentAfterStop = result.current.streamingContent
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.streamingContent).toBe(contentAfterStop)
  })

  it('aborts previous stream when starting new one', async () => {
    const { result } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'first' }],
      })
    })

    // Start a new stream immediately
    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'second' }],
      })
    })

    expect(result.current.isStreaming).toBe(true)
    expect(result.current.streamingContent).toBe('')
  })

  it('cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() => useStreamingChat())

    act(() => {
      result.current.startStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      })
    })

    // Unmount while streaming
    unmount()

    // Advance timers - should not throw
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
  })
})
