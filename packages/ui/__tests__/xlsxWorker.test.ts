/**
 * Tests for xlsxWorker.ts — Web Worker for Excel file parsing.
 * Since we can't run a real Web Worker in jsdom, we test the logic
 * by importing the file and simulating the onmessage handler.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('xlsxWorker', () => {
  let postMessageMock: ReturnType<typeof vi.fn>
  let onmessageHandler: ((e: MessageEvent) => void) | null

  beforeEach(() => {
    postMessageMock = vi.fn()
    onmessageHandler = null

    // Mock the global self context for the worker
    const selfMock = {
      onmessage: null as ((e: MessageEvent) => void) | null,
      postMessage: postMessageMock,
    }

    // Replace self.onmessage setter to capture the handler
    Object.defineProperty(globalThis, 'self', {
      value: new Proxy(selfMock, {
        set(target, prop, value) {
          if (prop === 'onmessage') {
            onmessageHandler = value
          }
          return Reflect.set(target, prop, value)
        },
        get(target, prop) {
          if (prop === 'postMessage') return postMessageMock
          return Reflect.get(target, prop)
        },
      }),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('posts error when file exceeds max size', async () => {
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    expect(onmessageHandler).toBeDefined()

    const hugeBuffer = new ArrayBuffer(51 * 1024 * 1024)
    const event = new MessageEvent('message', {
      data: { type: 'parse', buffer: hugeBuffer, fileName: 'huge.xlsx' },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: expect.stringContaining('50MB'),
      }),
    )
  })

  it('ignores messages with unknown type', async () => {
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    const event = new MessageEvent('message', {
      data: { type: 'other' },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).not.toHaveBeenCalled()
  })

  it('validates data with missing required columns', async () => {
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    const event = new MessageEvent('message', {
      data: { type: 'validate', data: [{ name: 'test' }] },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'validated',
        valid: false,
        errors: expect.arrayContaining([
          expect.stringContaining('날짜'),
        ]),
      }),
    )
  })

  it('validates empty data array', async () => {
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    const event = new MessageEvent('message', {
      data: { type: 'validate', data: [] },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'validated',
        valid: false,
        errors: ['데이터가 비어있습니다.'],
      }),
    )
  })

  it('validates data with all required columns', async () => {
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    const validRow = {
      날짜: '2025-01-01',
      사용자ID: 'USR-001',
      부서: '개발팀',
      직급: '사원',
      기능: 'AI 채팅',
      모델: 'GPT-4o',
      토큰수: 1000,
      절감시간_분: 10,
      만족도: 4,
    }

    const event = new MessageEvent('message', {
      data: { type: 'validate', data: [validRow] },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'validated',
        valid: true,
        errors: [],
      }),
    )
  })
})
