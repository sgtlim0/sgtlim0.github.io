/**
 * Tests for useExtensionContext hook (packages/ui/src/user/hooks/useExtensionContext.ts)
 *
 * Covers:
 * - Initial state (null context, no extension)
 * - Reading context from URL search params
 * - URL params cleanup after reading
 * - postMessage from extension
 * - Ignoring irrelevant postMessage events
 * - clearContext resets extensionContext to null
 * - hasExtension flag
 * - Cleanup of event listener on unmount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Save original window.location
const originalLocation = window.location

describe('useExtensionContext', () => {
  let replaceStateSpy: ReturnType<typeof vi.fn>
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    replaceStateSpy = vi.fn()
    vi.spyOn(window.history, 'replaceState').mockImplementation(replaceStateSpy)
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  function setLocationSearch(search: string) {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        search,
        href: `http://localhost:3000${search}`,
      },
    })
  }

  it('should return initial state with null context and no extension', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    expect(result.current.extensionContext).toBeNull()
    expect(result.current.hasExtension).toBe(false)
    expect(typeof result.current.clearContext).toBe('function')
  })

  it('should read context from URL search params', async () => {
    setLocationSearch(
      '?ext_text=Hello%20World&ext_url=https%3A%2F%2Fexample.com&ext_title=Example%20Page',
    )
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    expect(result.current.extensionContext).toEqual({
      text: 'Hello World',
      url: 'https://example.com',
      title: 'Example Page',
    })
    expect(result.current.hasExtension).toBe(true)
  })

  it('should handle ext_text only (no url or title)', async () => {
    setLocationSearch('?ext_text=Some%20text')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    expect(result.current.extensionContext).toEqual({
      text: 'Some text',
      url: '',
      title: '',
    })
    expect(result.current.hasExtension).toBe(true)
  })

  it('should clean URL params after reading', async () => {
    setLocationSearch('?ext_text=test&ext_url=url&ext_title=title')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    renderHook(() => useExtensionContext())

    expect(replaceStateSpy).toHaveBeenCalled()
  })

  it('should not set context if ext_text is not in URL params', async () => {
    setLocationSearch('?other_param=value')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    expect(result.current.extensionContext).toBeNull()
    expect(result.current.hasExtension).toBe(false)
  })

  it('should listen for postMessage events when no URL params', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    renderHook(() => useExtensionContext())

    // Should have added a 'message' event listener
    const messageListeners = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'message',
    )
    expect(messageListeners.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle postMessage from extension content script', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    // Simulate postMessage from extension
    act(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'HCHAT_EXTENSION_CONTEXT',
          payload: {
            text: 'Selected text',
            url: 'https://page.com',
            title: 'Page Title',
          },
        },
      })
      window.dispatchEvent(event)
    })

    expect(result.current.extensionContext).toEqual({
      text: 'Selected text',
      url: 'https://page.com',
      title: 'Page Title',
    })
    expect(result.current.hasExtension).toBe(true)
  })

  it('should ignore postMessage with wrong type', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    act(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'SOME_OTHER_TYPE',
          payload: { text: 'Should be ignored' },
        },
      })
      window.dispatchEvent(event)
    })

    expect(result.current.extensionContext).toBeNull()
    expect(result.current.hasExtension).toBe(false)
  })

  it('should ignore postMessage without payload', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    act(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'HCHAT_EXTENSION_CONTEXT',
          // no payload
        },
      })
      window.dispatchEvent(event)
    })

    expect(result.current.extensionContext).toBeNull()
  })

  it('should ignore postMessage with empty text', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    act(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'HCHAT_EXTENSION_CONTEXT',
          payload: {
            text: '',
            url: 'https://example.com',
            title: 'Title',
          },
        },
      })
      window.dispatchEvent(event)
    })

    expect(result.current.extensionContext).toBeNull()
  })

  it('should use empty string for missing url/title in postMessage', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    act(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'HCHAT_EXTENSION_CONTEXT',
          payload: {
            text: 'Just text',
            // no url or title
          },
        },
      })
      window.dispatchEvent(event)
    })

    expect(result.current.extensionContext).toEqual({
      text: 'Just text',
      url: '',
      title: '',
    })
  })

  it('should clear context via clearContext', async () => {
    setLocationSearch('?ext_text=text')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { result } = renderHook(() => useExtensionContext())

    expect(result.current.extensionContext).not.toBeNull()

    act(() => {
      result.current.clearContext()
    })

    expect(result.current.extensionContext).toBeNull()
  })

  it('should remove event listener on unmount', async () => {
    setLocationSearch('')
    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    const { unmount } = renderHook(() => useExtensionContext())

    unmount()

    const removeMessageListeners = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'message',
    )
    expect(removeMessageListeners.length).toBeGreaterThanOrEqual(1)
  })

  it('should not set up listener when ext_text is found in URL (early return)', async () => {
    setLocationSearch('?ext_text=from_url')
    // Reset the spy to count only after this point
    addEventListenerSpy.mockClear()

    const { useExtensionContext } = await import('../src/user/hooks/useExtensionContext')
    renderHook(() => useExtensionContext())

    // When ext_text is in URL, the effect should return early (no message listener)
    const messageListeners = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'message',
    )
    expect(messageListeners.length).toBe(0)
  })
})
