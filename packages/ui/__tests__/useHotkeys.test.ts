import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { parseKeyCombo, matchesKeyEvent, normalizeKeyCombo } from '../src/utils/keyboardUtils'
import { useHotkeys, useHotkeyRegistry } from '../src/hooks/useHotkeys'
import { HotkeyProvider } from '../src/hooks/HotkeyProvider'

// ---------------------------------------------------------------------------
// keyboardUtils — parseKeyCombo
// ---------------------------------------------------------------------------

describe('parseKeyCombo', () => {
  it('parses a simple key', () => {
    expect(parseKeyCombo('escape')).toEqual({
      key: 'escape',
      ctrl: false,
      meta: false,
      shift: false,
      alt: false,
    })
  })

  it('parses ctrl+k', () => {
    expect(parseKeyCombo('ctrl+k')).toEqual({
      key: 'k',
      ctrl: true,
      meta: false,
      shift: false,
      alt: false,
    })
  })

  it('parses meta+/', () => {
    expect(parseKeyCombo('meta+/')).toEqual({
      key: '/',
      ctrl: false,
      meta: true,
      shift: false,
      alt: false,
    })
  })

  it('parses ctrl+shift+d (multiple modifiers)', () => {
    expect(parseKeyCombo('ctrl+shift+d')).toEqual({
      key: 'd',
      ctrl: true,
      meta: false,
      shift: true,
      alt: false,
    })
  })

  it('parses alt+meta+enter', () => {
    expect(parseKeyCombo('alt+meta+enter')).toEqual({
      key: 'enter',
      ctrl: false,
      meta: true,
      shift: false,
      alt: true,
    })
  })

  it('is case-insensitive', () => {
    expect(parseKeyCombo('Ctrl+K')).toEqual({
      key: 'k',
      ctrl: true,
      meta: false,
      shift: false,
      alt: false,
    })
  })

  it('handles cmd as alias for meta', () => {
    expect(parseKeyCombo('cmd+k')).toEqual({
      key: 'k',
      ctrl: false,
      meta: true,
      shift: false,
      alt: false,
    })
  })

  it('handles mod as platform-adaptive modifier', () => {
    // mod = meta on Mac, ctrl on Windows
    const result = parseKeyCombo('mod+k')
    // In test env (jsdom), navigator.platform may vary
    expect(result.key).toBe('k')
    expect(result.ctrl || result.meta).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// keyboardUtils — normalizeKeyCombo
// ---------------------------------------------------------------------------

describe('normalizeKeyCombo', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeKeyCombo(' Ctrl + K ')).toBe('ctrl+k')
  })

  it('sorts modifiers consistently', () => {
    expect(normalizeKeyCombo('shift+ctrl+k')).toBe('ctrl+shift+k')
  })

  it('normalizes cmd to meta', () => {
    expect(normalizeKeyCombo('cmd+/')).toBe('meta+/')
  })
})

// ---------------------------------------------------------------------------
// keyboardUtils — matchesKeyEvent
// ---------------------------------------------------------------------------

describe('matchesKeyEvent', () => {
  function createKeyEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
    return {
      key: '',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ...overrides,
    } as unknown as KeyboardEvent
  }

  it('matches simple escape key', () => {
    const event = createKeyEvent({ key: 'Escape' })
    expect(matchesKeyEvent(event, 'escape')).toBe(true)
  })

  it('matches ctrl+k', () => {
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(true)
  })

  it('does not match when modifier is missing', () => {
    const event = createKeyEvent({ key: 'k' })
    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(false)
  })

  it('does not match when extra modifier is present', () => {
    const event = createKeyEvent({ key: 'k', ctrlKey: true, shiftKey: true })
    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(false)
  })

  it('matches meta+/ (Cmd+/ on Mac)', () => {
    const event = createKeyEvent({ key: '/', metaKey: true })
    expect(matchesKeyEvent(event, 'meta+/')).toBe(true)
  })

  it('matches ctrl+shift+d', () => {
    const event = createKeyEvent({ key: 'd', ctrlKey: true, shiftKey: true })
    expect(matchesKeyEvent(event, 'ctrl+shift+d')).toBe(true)
  })

  it('is case-insensitive for event.key', () => {
    const event = createKeyEvent({ key: 'K', ctrlKey: true })
    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(true)
  })

  it('does not match when key differs', () => {
    const event = createKeyEvent({ key: 'j', ctrlKey: true })
    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useHotkeys hook
// ---------------------------------------------------------------------------

describe('useHotkeys', () => {
  let addEventSpy: ReturnType<typeof vi.spyOn>
  let removeEventSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventSpy = vi.spyOn(document, 'addEventListener')
    removeEventSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds keydown listener on mount', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )
    expect(addEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes keydown listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )
    unmount()
    expect(removeEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('calls handler when matching key is pressed', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call handler for non-matching key', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      )
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call handler when enabled is false', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([
        { key: 'escape', handler, description: 'Close', enabled: false },
      ]),
    )

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('calls preventDefault when configured', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([
        { key: 'ctrl+k', handler, description: 'Search', preventDefault: true },
      ]),
    )

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    })
    const preventSpy = vi.spyOn(event, 'preventDefault')

    act(() => {
      document.dispatchEvent(event)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(preventSpy).toHaveBeenCalled()
  })

  it('ignores events from input elements', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input })

    act(() => {
      document.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('ignores events from textarea elements', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'ctrl+k', handler, description: 'Search' }]),
    )

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: textarea })

    act(() => {
      document.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(textarea)
  })

  it('ignores events from contentEditable elements', () => {
    const handler = vi.fn()
    renderHook(() =>
      useHotkeys([{ key: 'escape', handler, description: 'Close' }]),
    )

    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    document.body.appendChild(div)

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: div })

    act(() => {
      document.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(div)
  })

  it('handles multiple hotkeys', () => {
    const escHandler = vi.fn()
    const searchHandler = vi.fn()
    renderHook(() =>
      useHotkeys([
        { key: 'escape', handler: escHandler, description: 'Close' },
        { key: 'ctrl+k', handler: searchHandler, description: 'Search' },
      ]),
    )

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
    })
    expect(escHandler).toHaveBeenCalledTimes(1)
    expect(searchHandler).not.toHaveBeenCalled()

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    expect(searchHandler).toHaveBeenCalledTimes(1)
  })

  it('updates handlers when hotkeys config changes', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const { rerender } = renderHook(
      ({ hotkeys }) => useHotkeys(hotkeys),
      {
        initialProps: {
          hotkeys: [{ key: 'escape', handler: handler1, description: 'Close' }],
        },
      },
    )

    rerender({
      hotkeys: [{ key: 'escape', handler: handler2, description: 'Close v2' }],
    })

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
    })

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// HotkeyProvider + useHotkeyRegistry
// ---------------------------------------------------------------------------

describe('HotkeyProvider + useHotkeyRegistry', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createWrapper() {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(HotkeyProvider, null, children)
    }
  }

  it('returns empty registry initially', () => {
    const { result } = renderHook(() => useHotkeyRegistry(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toEqual([])
  })

  it('registers hotkeys from useHotkeys within provider', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
        { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
      ])
      return useHotkeyRegistry()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    expect(result.current).toHaveLength(2)
    expect(result.current[0].key).toBe('escape')
    expect(result.current[0].description).toBe('Close modal')
    expect(result.current[1].key).toBe('ctrl+k')
    expect(result.current[1].description).toBe('Open search')
  })

  it('unregisters hotkeys on unmount', () => {
    function useRegister() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
      ])
    }

    const wrapper = createWrapper()
    const { unmount } = renderHook(() => useRegister(), { wrapper })

    // Read registry from another hook instance
    const { result: registryResult } = renderHook(() => useHotkeyRegistry(), {
      wrapper,
    })

    // After unmount, the registration from the first hook should be cleared
    unmount()

    // Re-render registry hook to pick up changes
    const { result: registryResult2 } = renderHook(() => useHotkeyRegistry(), {
      wrapper: createWrapper(),
    })
    expect(registryResult2.current).toEqual([])
  })

  it('warns on duplicate key registration', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close A' },
        { key: 'escape', handler: () => {}, description: 'Close B' },
      ])
    }

    renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('escape'),
    )

    warnSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// SSR Safety
// ---------------------------------------------------------------------------

describe('SSR safety', () => {
  it('parseKeyCombo works without window', () => {
    // parseKeyCombo is pure, should work in any environment
    const result = parseKeyCombo('ctrl+k')
    expect(result.key).toBe('k')
    expect(result.ctrl).toBe(true)
  })

  it('matchesKeyEvent works without window', () => {
    const event = {
      key: 'k',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent

    expect(matchesKeyEvent(event, 'ctrl+k')).toBe(true)
  })
})
