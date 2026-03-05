import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamChatCompletion } from '../src/llm-router/services/streamingService'
import type { StreamingResult } from '../src/llm-router/services/streamingTypes'

describe('streamingService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onToken callback multiple times', async () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      onToken,
      onComplete,
    })

    // Advance past base delay + enough token intervals
    await vi.advanceTimersByTimeAsync(30_000)

    expect(onToken).toHaveBeenCalled()
    expect(onToken.mock.calls.length).toBeGreaterThan(1)
  })

  it('calls onComplete with StreamingResult', async () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      onToken,
      onComplete,
    })

    // Advance enough time for all tokens to be emitted
    await vi.advanceTimersByTimeAsync(60_000)

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result: StreamingResult = onComplete.mock.calls[0][0]
    expect(result).toBeDefined()
  })

  it('result has all required fields', async () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      onComplete,
    })

    await vi.advanceTimersByTimeAsync(60_000)

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result: StreamingResult = onComplete.mock.calls[0][0]

    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('model')
    expect(result).toHaveProperty('inputTokens')
    expect(result).toHaveProperty('outputTokens')
    expect(result).toHaveProperty('totalTokens')
    expect(result).toHaveProperty('responseTimeMs')
    expect(result).toHaveProperty('estimatedCostKRW')
    expect(result).toHaveProperty('finishReason')

    expect(typeof result.content).toBe('string')
    expect(result.content.length).toBeGreaterThan(0)
    expect(result.model).toBe('gpt-4o')
    expect(result.inputTokens).toBeGreaterThan(0)
    expect(result.outputTokens).toBeGreaterThan(0)
    expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens)
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.estimatedCostKRW).toBe('number')
    expect(['stop', 'length', 'error']).toContain(result.finishReason)
  })

  it('abort stops streaming', async () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    const controller = streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      onToken,
      onComplete,
    })

    // Advance past base delay + a few tokens
    await vi.advanceTimersByTimeAsync(500)
    const callsBeforeAbort = onToken.mock.calls.length

    controller.abort()

    // Advance more time - no new tokens should arrive
    await vi.advanceTimersByTimeAsync(30_000)

    // onToken should not have been called many more times after abort
    // The abort fires onComplete with partial result
    const callsAfterAbort = onToken.mock.calls.length
    expect(callsAfterAbort).toBeLessThanOrEqual(callsBeforeAbort + 1)
  })

  it('respects maxTokens parameter', async () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      maxTokens: 5,
      onToken,
      onComplete,
    })

    await vi.advanceTimersByTimeAsync(60_000)

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result: StreamingResult = onComplete.mock.calls[0][0]
    // With maxTokens=5, we should get at most 5 token chunks
    expect(onToken.mock.calls.length).toBeLessThanOrEqual(5)
    expect(result.outputTokens).toBeGreaterThan(0)
  })

  it('result includes cost calculation', async () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Tell me a long story about programming' }],
      onComplete,
    })

    await vi.advanceTimersByTimeAsync(60_000)

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result: StreamingResult = onComplete.mock.calls[0][0]
    expect(result.estimatedCostKRW).toBeGreaterThanOrEqual(0)
    expect(typeof result.estimatedCostKRW).toBe('number')
  })
})
