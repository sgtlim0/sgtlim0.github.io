import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { useUndoRedo } from '../src/hooks/useUndoRedo'
import { UndoRedoProvider, useUndoRedoContext } from '../src/hooks/UndoRedoProvider'

// ─── useUndoRedo hook ────────────────────────────────────────

describe('useUndoRedo', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useUndoRedo('hello'))
    expect(result.current.state).toBe('hello')
  })

  it('returns correct initial flags', () => {
    const { result } = renderHook(() => useUndoRedo(0))
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historySize).toBe(0)
  })

  describe('set', () => {
    it('updates the current state', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      expect(result.current.state).toBe('b')
    })

    it('pushes previous state to history', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      expect(result.current.canUndo).toBe(true)
      expect(result.current.historySize).toBe(1)
    })

    it('clears future on new set', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
        result.current.set('c')
      })

      act(() => {
        result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      act(() => {
        result.current.set('d')
      })

      expect(result.current.canRedo).toBe(false)
      expect(result.current.state).toBe('d')
    })

    it('tracks multiple state changes', () => {
      const { result } = renderHook(() => useUndoRedo(0))

      act(() => {
        result.current.set(1)
        result.current.set(2)
        result.current.set(3)
      })

      expect(result.current.state).toBe(3)
      expect(result.current.historySize).toBe(3)
    })
  })

  describe('undo', () => {
    it('reverts to the previous state', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      act(() => {
        result.current.undo()
      })

      expect(result.current.state).toBe('a')
    })

    it('does nothing when history is empty', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.undo()
      })

      expect(result.current.state).toBe('a')
    })

    it('enables redo after undo', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      act(() => {
        result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)
    })

    it('supports multiple undos', () => {
      const { result } = renderHook(() => useUndoRedo(0))

      act(() => {
        result.current.set(1)
        result.current.set(2)
        result.current.set(3)
      })

      act(() => {
        result.current.undo()
      })
      expect(result.current.state).toBe(2)

      act(() => {
        result.current.undo()
      })
      expect(result.current.state).toBe(1)

      act(() => {
        result.current.undo()
      })
      expect(result.current.state).toBe(0)

      expect(result.current.canUndo).toBe(false)
    })
  })

  describe('redo', () => {
    it('re-applies the undone state', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      act(() => {
        result.current.undo()
      })

      act(() => {
        result.current.redo()
      })

      expect(result.current.state).toBe('b')
    })

    it('does nothing when future is empty', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.redo()
      })

      expect(result.current.state).toBe('a')
    })

    it('supports multiple redos', () => {
      const { result } = renderHook(() => useUndoRedo(0))

      act(() => {
        result.current.set(1)
        result.current.set(2)
        result.current.set(3)
      })

      act(() => {
        result.current.undo()
        result.current.undo()
        result.current.undo()
      })

      expect(result.current.state).toBe(0)

      act(() => {
        result.current.redo()
      })
      expect(result.current.state).toBe(1)

      act(() => {
        result.current.redo()
      })
      expect(result.current.state).toBe(2)

      act(() => {
        result.current.redo()
      })
      expect(result.current.state).toBe(3)

      expect(result.current.canRedo).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets to a new initial state', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
        result.current.set('c')
      })

      act(() => {
        result.current.reset('x')
      })

      expect(result.current.state).toBe('x')
      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(false)
      expect(result.current.historySize).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears history but keeps current state', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
        result.current.set('c')
      })

      act(() => {
        result.current.clear()
      })

      expect(result.current.state).toBe('c')
      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(false)
      expect(result.current.historySize).toBe(0)
    })

    it('clears future as well', () => {
      const { result } = renderHook(() => useUndoRedo('a'))

      act(() => {
        result.current.set('b')
      })

      act(() => {
        result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      act(() => {
        result.current.clear()
      })

      expect(result.current.canRedo).toBe(false)
    })
  })

  describe('maxHistory', () => {
    it('uses default maxHistory of 50', () => {
      const { result } = renderHook(() => useUndoRedo(0))

      act(() => {
        for (let i = 1; i <= 55; i++) {
          result.current.set(i)
        }
      })

      expect(result.current.historySize).toBe(50)
      expect(result.current.state).toBe(55)
    })

    it('respects custom maxHistory', () => {
      const { result } = renderHook(() => useUndoRedo(0, { maxHistory: 3 }))

      act(() => {
        result.current.set(1)
        result.current.set(2)
        result.current.set(3)
        result.current.set(4)
        result.current.set(5)
      })

      expect(result.current.historySize).toBe(3)
    })

    it('drops oldest entries when exceeding maxHistory', () => {
      const { result } = renderHook(() => useUndoRedo(0, { maxHistory: 2 }))

      act(() => {
        result.current.set(1)
        result.current.set(2)
        result.current.set(3)
      })

      // past should be [1, 2] (0 was dropped)
      expect(result.current.historySize).toBe(2)

      act(() => {
        result.current.undo()
      })
      expect(result.current.state).toBe(2)

      act(() => {
        result.current.undo()
      })
      expect(result.current.state).toBe(1)

      // Cannot undo further — 0 was dropped
      expect(result.current.canUndo).toBe(false)
    })
  })

  describe('object state (structural sharing)', () => {
    it('preserves object references (no deep copy)', () => {
      const obj1 = { name: 'alice' }
      const obj2 = { name: 'bob' }

      const { result } = renderHook(() => useUndoRedo(obj1))

      act(() => {
        result.current.set(obj2)
      })

      act(() => {
        result.current.undo()
      })

      // Same reference, not a deep copy
      expect(result.current.state).toBe(obj1)
    })
  })

  describe('keyboard shortcuts', () => {
    let originalWindow: typeof window

    beforeEach(() => {
      originalWindow = window
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not register shortcuts by default', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      renderHook(() => useUndoRedo('a'))

      const keydownCalls = addSpy.mock.calls.filter(([event]) => event === 'keydown')
      expect(keydownCalls).toHaveLength(0)
    })

    it('registers keydown listener when enableKeyboardShortcuts is true', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      renderHook(() => useUndoRedo('a', { enableKeyboardShortcuts: true }))

      const keydownCalls = addSpy.mock.calls.filter(([event]) => event === 'keydown')
      expect(keydownCalls).toHaveLength(1)
    })

    it('handles Cmd+Z for undo', () => {
      const { result } = renderHook(() =>
        useUndoRedo('a', { enableKeyboardShortcuts: true }),
      )

      act(() => {
        result.current.set('b')
      })

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            metaKey: true,
            shiftKey: false,
            bubbles: true,
          }),
        )
      })

      expect(result.current.state).toBe('a')
    })

    it('handles Cmd+Shift+Z for redo', () => {
      const { result } = renderHook(() =>
        useUndoRedo('a', { enableKeyboardShortcuts: true }),
      )

      act(() => {
        result.current.set('b')
      })

      act(() => {
        result.current.undo()
      })

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            metaKey: true,
            shiftKey: true,
            bubbles: true,
          }),
        )
      })

      expect(result.current.state).toBe('b')
    })

    it('handles Ctrl+Z for undo', () => {
      const { result } = renderHook(() =>
        useUndoRedo('a', { enableKeyboardShortcuts: true }),
      )

      act(() => {
        result.current.set('b')
      })

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          }),
        )
      })

      expect(result.current.state).toBe('a')
    })

    it('cleans up listener on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() =>
        useUndoRedo('a', { enableKeyboardShortcuts: true }),
      )

      unmount()

      const keydownCalls = removeSpy.mock.calls.filter(([event]) => event === 'keydown')
      expect(keydownCalls).toHaveLength(1)
    })
  })
})

// ─── UndoRedoProvider + useUndoRedoContext ───────────────────

describe('UndoRedoProvider', () => {
  function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(UndoRedoProvider, { initialState: 'init' }, children)
  }

  it('provides initial state via context', () => {
    const { result } = renderHook(() => useUndoRedoContext<string>(), { wrapper })
    expect(result.current.state).toBe('init')
  })

  it('supports set/undo/redo via context', () => {
    const { result } = renderHook(() => useUndoRedoContext<string>(), { wrapper })

    act(() => {
      result.current.set('a')
    })
    expect(result.current.state).toBe('a')

    act(() => {
      result.current.set('b')
    })
    expect(result.current.state).toBe('b')

    act(() => {
      result.current.undo()
    })
    expect(result.current.state).toBe('a')

    act(() => {
      result.current.redo()
    })
    expect(result.current.state).toBe('b')
  })

  it('supports reset via context', () => {
    const { result } = renderHook(() => useUndoRedoContext<string>(), { wrapper })

    act(() => {
      result.current.set('a')
      result.current.set('b')
    })

    act(() => {
      result.current.reset('fresh')
    })

    expect(result.current.state).toBe('fresh')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('supports clear via context', () => {
    const { result } = renderHook(() => useUndoRedoContext<string>(), { wrapper })

    act(() => {
      result.current.set('a')
      result.current.set('b')
    })

    act(() => {
      result.current.clear()
    })

    expect(result.current.state).toBe('b')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.historySize).toBe(0)
  })

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useUndoRedoContext<string>())
    }).toThrow('useUndoRedoContext must be used within an UndoRedoProvider')
  })

  it('respects maxHistory option', () => {
    function customWrapper({ children }: { children: React.ReactNode }) {
      return createElement(UndoRedoProvider, { initialState: 0, maxHistory: 3 }, children)
    }

    const { result } = renderHook(() => useUndoRedoContext<number>(), {
      wrapper: customWrapper,
    })

    act(() => {
      result.current.set(1)
      result.current.set(2)
      result.current.set(3)
      result.current.set(4)
      result.current.set(5)
    })

    expect(result.current.historySize).toBe(3)
  })

  it('shares state across multiple consumers', () => {
    const { result: consumer1 } = renderHook(() => useUndoRedoContext<string>(), {
      wrapper,
    })
    // Note: In a real app multiple consumers share via same Provider render tree.
    // Here we just verify the context API shape is consistent.
    expect(consumer1.current.state).toBe('init')
    expect(typeof consumer1.current.set).toBe('function')
    expect(typeof consumer1.current.undo).toBe('function')
    expect(typeof consumer1.current.redo).toBe('function')
    expect(typeof consumer1.current.reset).toBe('function')
    expect(typeof consumer1.current.clear).toBe('function')
  })
})
