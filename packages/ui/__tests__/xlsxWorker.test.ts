/**
 * Tests for xlsxWorker.ts — Web Worker for Excel file parsing.
 * Since we can't run a real Web Worker in jsdom, we test the logic
 * by importing the file and simulating the onmessage handler.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('xlsxWorker', () => {
  let originalSelf: typeof globalThis
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
    // Import the worker module to trigger self.onmessage assignment
    await import('../src/roi/xlsxWorker')

    if (!onmessageHandler) {
      // Fallback: access from self
      onmessageHandler = (globalThis as unknown as { self: { onmessage: typeof onmessageHandler } }).self.onmessage
    }

    expect(onmessageHandler).toBeDefined()

    // Create a buffer that exceeds 50MB
    const hugeBuffer = new ArrayBuffer(51 * 1024 * 1024)
    const event = new MessageEvent('message', {
      data: { type: 'parse', buffer: hugeBuffer },
    })

    await onmessageHandler!(event)

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: expect.stringContaining('50MB'),
      }),
    )
  })

  it('ignores messages with non-parse type', async () => {
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
})
