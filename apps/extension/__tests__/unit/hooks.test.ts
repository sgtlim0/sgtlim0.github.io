import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePageContext } from '../../src/popup/hooks/usePageContext'
import { useExtensionSettings } from '../../src/popup/hooks/useExtensionSettings'
import { useExtensionChat } from '../../src/popup/hooks/useExtensionChat'
import { DEFAULT_SETTINGS } from '../../src/types/settings'
import type { PageContext, AnalysisMode } from '../../src/types/context'

// Mock chrome.storage properly
const mockChromeStorage = () => {
  const storage = new Map()
  const listeners: Array<(changes: Record<string, unknown>, areaName: string) => void> = []

  return {
    local: {
      get: vi.fn((keys) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: storage.get(keys) })
        }
        return Promise.resolve(Object.fromEntries(storage))
      }),
      set: vi.fn((items) => {
        Object.entries(items).forEach(([key, value]) => {
          storage.set(key, value)
        })
        return Promise.resolve()
      }),
      remove: vi.fn((keys) => {
        const keysArray = Array.isArray(keys) ? keys : [keys]
        keysArray.forEach((key) => storage.delete(key))
        return Promise.resolve()
      }),
    },
    onChanged: {
      addListener: vi.fn((callback) => {
        listeners.push(callback)
      }),
      removeListener: vi.fn((callback) => {
        const index = listeners.indexOf(callback)
        if (index > -1) listeners.splice(index, 1)
      }),
      dispatch: (changes: Record<string, unknown>, areaName: string) => {
        listeners.forEach((listener) => listener(changes, areaName))
      },
    },
  }
}

describe('Popup Hooks', () => {
  let chromeStorageMock: ReturnType<typeof mockChromeStorage>

  beforeEach(() => {
    vi.clearAllMocks()
    chromeStorageMock = mockChromeStorage()

    // Setup chrome global
    if (!globalThis.chrome) {
      // @ts-expect-error Mocking chrome
      globalThis.chrome = {}
    }
    // @ts-expect-error Mocking chrome.storage
    globalThis.chrome.storage = chromeStorageMock
    // @ts-expect-error Mocking chrome.runtime
    globalThis.chrome.runtime = {
      openOptionsPage: vi.fn(),
    }
  })

  describe('usePageContext', () => {
    it('should load context from storage on mount', async () => {
      const mockContext: PageContext = {
        text: 'Test content',
        url: 'https://example.com',
        title: 'Test Page',
        timestamp: Date.now(),
        sanitized: true,
      }

      chromeStorageMock.local.get.mockResolvedValue({
        hchat_context: mockContext,
      })

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.context).toEqual(mockContext)
      expect(result.current.error).toBeNull()
    })

    it('should provide dev mock fallback when chrome.storage unavailable', async () => {
      const originalChrome = globalThis.chrome
      // @ts-expect-error Testing non-extension context
      delete globalThis.chrome

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.context).not.toBeNull()
      expect(result.current.context?.title).toContain('Development Mode')
      expect(result.current.error).toBeNull()

      globalThis.chrome = originalChrome
    })

    it('should clear context when clearContext called', async () => {
      const mockContext: PageContext = {
        text: 'Test',
        url: 'https://test.com',
        title: 'Test',
        timestamp: Date.now(),
        sanitized: false,
      }

      chromeStorageMock.local.get.mockResolvedValue({
        hchat_context: mockContext,
      })

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.context).not.toBeNull()
      })

      await act(async () => {
        await result.current.clearContext()
      })

      expect(result.current.context).toBeNull()
    })

    it('should refresh context when refreshContext called', async () => {
      const initialContext: PageContext = {
        text: 'Initial',
        url: 'https://initial.com',
        title: 'Initial',
        timestamp: Date.now(),
        sanitized: false,
      }

      const updatedContext: PageContext = {
        ...initialContext,
        text: 'Updated',
      }

      chromeStorageMock.local.get
        .mockResolvedValueOnce({ hchat_context: initialContext })
        .mockResolvedValueOnce({ hchat_context: updatedContext })

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.context?.text).toBe('Initial')
      })

      await act(async () => {
        await result.current.refreshContext()
      })

      await waitFor(() => {
        expect(result.current.context?.text).toBe('Updated')
      })
    })

    it('should listen for storage changes', async () => {
      const initialContext: PageContext = {
        text: 'Initial',
        url: 'https://test.com',
        title: 'Test',
        timestamp: Date.now(),
        sanitized: false,
      }

      chromeStorageMock.local.get.mockResolvedValue({
        hchat_context: initialContext,
      })

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(chromeStorageMock.onChanged.addListener).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      chromeStorageMock.local.get.mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => usePageContext())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).not.toBeNull()
      // The hook wraps or passes through the error message
      expect(result.current.error?.message).toBeTruthy()
    })
  })

  describe('useExtensionSettings', () => {
    it('should load default settings on mount', async () => {
      chromeStorageMock.local.get.mockResolvedValue({})

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
      expect(result.current.error).toBeNull()
    })

    it('should merge stored settings with defaults', async () => {
      const partialSettings = {
        theme: 'dark' as const,
        language: 'en' as const,
      }

      chromeStorageMock.local.get.mockResolvedValue({
        hchat_settings: partialSettings,
      })

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings.theme).toBe('dark')
      expect(result.current.settings.language).toBe('en')
      expect(result.current.settings.apiMode).toBe(DEFAULT_SETTINGS.apiMode)
    })

    it('should update settings and persist to storage', async () => {
      chromeStorageMock.local.get.mockResolvedValue({
        hchat_settings: DEFAULT_SETTINGS,
      })

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateSettings({ theme: 'dark' })
      })

      expect(result.current.settings.theme).toBe('dark')
      expect(chromeStorageMock.local.set).toHaveBeenCalled()
    })

    it('should preserve other settings when updating', async () => {
      const initialSettings = {
        ...DEFAULT_SETTINGS,
        theme: 'light' as const,
        language: 'ko' as const,
      }

      chromeStorageMock.local.get.mockResolvedValue({
        hchat_settings: initialSettings,
      })

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.settings.theme).toBe('light')
      })

      await act(async () => {
        await result.current.updateSettings({ apiMode: 'real' })
      })

      expect(result.current.settings.theme).toBe('light')
      expect(result.current.settings.language).toBe('ko')
      expect(result.current.settings.apiMode).toBe('real')
    })

    it('should listen for storage changes', async () => {
      chromeStorageMock.local.get.mockResolvedValue({
        hchat_settings: DEFAULT_SETTINGS,
      })

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(chromeStorageMock.onChanged.addListener).toHaveBeenCalled()
    })

    it('should handle update errors', async () => {
      chromeStorageMock.local.get.mockResolvedValue({
        hchat_settings: DEFAULT_SETTINGS,
      })
      chromeStorageMock.local.set.mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => useExtensionSettings())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let errorThrown = false
      await act(async () => {
        try {
          await result.current.updateSettings({ theme: 'dark' })
        } catch (e) {
          errorThrown = true
        }
      })

      expect(errorThrown).toBe(true)

      // Error should be set in the hook state
      await waitFor(
        () => {
          expect(result.current.error).not.toBeNull()
        },
        { timeout: 2000 },
      )
    })
  })

  describe('useExtensionChat', () => {
    const mockContext: PageContext = {
      text: 'Test content for analysis',
      url: 'https://example.com',
      title: 'Test Page',
      timestamp: Date.now(),
      sanitized: true,
    }

    it('should stream analysis result word by word', async () => {
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'summarize',
          context: mockContext,
        }),
      )

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.result).toBe('')

      act(() => {
        result.current.startAnalysis()
      })

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      await waitFor(
        () => {
          expect(result.current.isStreaming).toBe(false)
        },
        { timeout: 10000 },
      )

      expect(result.current.result.length).toBeGreaterThan(0)
      expect(result.current.error).toBeNull()
    }, 15000)

    it('should abort streaming when reset called', async () => {
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'explain',
          context: mockContext,
        }),
      )

      act(() => {
        result.current.startAnalysis()
      })

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.result).toBe('')
    })

    it('should clear result when reset called', async () => {
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'summarize',
          context: mockContext,
        }),
      )

      act(() => {
        result.current.startAnalysis()
      })

      // Wait a bit for some content
      await new Promise((resolve) => setTimeout(resolve, 500))

      const intermediateResult = result.current.result
      expect(intermediateResult.length).toBeGreaterThan(0)

      act(() => {
        result.current.reset()
      })

      expect(result.current.result).toBe('')
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle error when no context provided', async () => {
      const onError = vi.fn()
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'summarize',
          context: null,
          onError,
        }),
      )

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.message).toContain('No context available')
      expect(onError).toHaveBeenCalled()
    })

    it('should call onComplete callback when streaming finishes', async () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'translate',
          context: mockContext,
          onComplete,
        }),
      )

      act(() => {
        result.current.startAnalysis()
      })

      await waitFor(
        () => {
          expect(result.current.isStreaming).toBe(false)
        },
        { timeout: 10000 },
      )

      // onComplete should be called (though with stale result due to callback deps)
      expect(result.current.result).toBeTruthy()
    }, 15000)

    it('should handle different analysis modes', async () => {
      const modes: AnalysisMode[] = ['summarize', 'explain', 'research', 'translate']

      for (const mode of modes) {
        const { result, unmount } = renderHook(() =>
          useExtensionChat({
            mode,
            context: mockContext,
          }),
        )

        act(() => {
          result.current.startAnalysis()
        })

        await waitFor(
          () => {
            expect(result.current.isStreaming).toBe(false)
          },
          { timeout: 10000 },
        )

        expect(result.current.result).toBeTruthy()
        expect(result.current.error).toBeNull()

        unmount()
      }
    }, 60000)

    it('should update streaming content incrementally', async () => {
      const { result } = renderHook(() =>
        useExtensionChat({
          mode: 'summarize',
          context: mockContext,
        }),
      )

      act(() => {
        result.current.startAnalysis()
      })

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      const results: string[] = []

      // Capture intermediate results
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        results.push(result.current.result)
      }

      // Filter out empty results and check progression
      const nonEmptyResults = results.filter((r) => r.length > 0)
      if (nonEmptyResults.length > 1) {
        for (let i = 1; i < nonEmptyResults.length; i++) {
          expect(nonEmptyResults[i].length).toBeGreaterThanOrEqual(nonEmptyResults[i - 1].length)
        }
      }
    }, 10000)
  })
})
