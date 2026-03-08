/**
 * Tests for useXlsxWorker hook.
 * We mock the Worker API and xlsx module to test hook behavior in isolation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useXlsxWorker } from '../src/roi/useXlsxWorker'

// Mock Worker
let mockWorkerInstance: {
  postMessage: ReturnType<typeof vi.fn>
  terminate: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  _listeners: Record<string, Array<(e: unknown) => void>>
}

function createMockWorkerInstance() {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: vi.fn((event: string, handler: (e: unknown) => void) => {
      if (!mockWorkerInstance._listeners[event]) {
        mockWorkerInstance._listeners[event] = []
      }
      mockWorkerInstance._listeners[event].push(handler)
    }),
    removeEventListener: vi.fn(),
    _listeners: {} as Record<string, Array<(e: unknown) => void>>,
  }
}

describe('useXlsxWorker', () => {
  let originalWorker: typeof Worker

  beforeEach(() => {
    originalWorker = globalThis.Worker
    mockWorkerInstance = createMockWorkerInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.Worker = function MockWorker() { return mockWorkerInstance } as any
  })

  afterEach(() => {
    globalThis.Worker = originalWorker
    vi.restoreAllMocks()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useXlsxWorker())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([])
    expect(result.current.columns).toEqual([])
  })

  it('sets isLoading when parseFile is called', async () => {
    const { result } = renderHook(() => useXlsxWorker())

    const buffer = new ArrayBuffer(8)

    // Start parsing (don't await — we need to check intermediate state)
    let parsePromise: Promise<unknown>
    act(() => {
      parsePromise = result.current.parseFile(buffer, 'test.xlsx')
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.progress).toBe(0)

    // Simulate worker progress message
    act(() => {
      const messageHandler = mockWorkerInstance._listeners['message']?.[0]
      messageHandler?.({ data: { type: 'progress', percent: 50 } })
    })

    expect(result.current.progress).toBe(50)

    // Simulate worker parsed response
    const mockData = [{ col1: 'a', col2: 1 }]
    await act(async () => {
      const messageHandler = mockWorkerInstance._listeners['message']?.[0]
      messageHandler?.({ data: { type: 'parsed', data: mockData, columns: ['col1', 'col2'] } })
      await parsePromise!
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.progress).toBe(100)
    expect(result.current.data).toEqual(mockData)
    expect(result.current.columns).toEqual(['col1', 'col2'])
    expect(result.current.error).toBeNull()
  })

  it('handles worker error response', async () => {
    const { result } = renderHook(() => useXlsxWorker())

    const buffer = new ArrayBuffer(8)

    let parsePromise: Promise<unknown>
    act(() => {
      parsePromise = result.current.parseFile(buffer, 'bad.xlsx').catch(() => {})
    })

    // Simulate error message from worker
    await act(async () => {
      const messageHandler = mockWorkerInstance._listeners['message']?.[0]
      messageHandler?.({ data: { type: 'error', message: '파일 형식 오류' } })
      await parsePromise
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('파일 형식 오류')
    expect(result.current.data).toEqual([])
  })

  it('handles worker onerror event', async () => {
    const { result } = renderHook(() => useXlsxWorker())

    const buffer = new ArrayBuffer(8)

    let parsePromise: Promise<unknown>
    act(() => {
      parsePromise = result.current.parseFile(buffer, 'crash.xlsx').catch(() => {})
    })

    // Simulate error event
    await act(async () => {
      const errorHandler = mockWorkerInstance._listeners['error']?.[0]
      errorHandler?.({ message: 'Worker crashed' })
      await parsePromise
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Worker crashed')
  })

  it('terminates previous worker when parseFile is called again', async () => {
    const { result } = renderHook(() => useXlsxWorker())

    const buffer1 = new ArrayBuffer(8)
    const buffer2 = new ArrayBuffer(8)

    // First call
    act(() => {
      result.current.parseFile(buffer1, 'first.xlsx').catch(() => {})
    })

    const firstWorkerTerminate = mockWorkerInstance.terminate

    // Create a new mock worker for the second call
    mockWorkerInstance = createMockWorkerInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.Worker = function MockWorker() { return mockWorkerInstance } as any

    // Second call should terminate the first worker
    act(() => {
      result.current.parseFile(buffer2, 'second.xlsx').catch(() => {})
    })

    expect(firstWorkerTerminate).toHaveBeenCalled()
  })

  it('terminates worker on unmount', () => {
    const { result, unmount } = renderHook(() => useXlsxWorker())

    const buffer = new ArrayBuffer(8)
    act(() => {
      result.current.parseFile(buffer, 'test.xlsx').catch(() => {})
    })

    const terminateFn = mockWorkerInstance.terminate
    unmount()

    expect(terminateFn).toHaveBeenCalled()
  })

  it('falls back to main thread when Worker is unavailable', async () => {
    // Remove Worker from environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).Worker = undefined

    // Mock xlsx module
    vi.doMock('xlsx', () => ({
      read: () => ({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      }),
      utils: {
        sheet_to_json: () => [{ a: 1, b: 2 }],
      },
    }))

    const { result } = renderHook(() => useXlsxWorker())
    const buffer = new ArrayBuffer(8)

    await act(async () => {
      await result.current.parseFile(buffer, 'fallback.xlsx')
    })

    expect(result.current.data).toEqual([{ a: 1, b: 2 }])
    expect(result.current.columns).toEqual(['a', 'b'])
    expect(result.current.isLoading).toBe(false)

    vi.doUnmock('xlsx')
  })
})
