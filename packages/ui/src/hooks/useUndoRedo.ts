'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const DEFAULT_MAX_HISTORY = 50

interface UndoRedoOptions {
  /** Maximum number of history entries to keep (default: 50) */
  maxHistory?: number
  /** Enable Cmd+Z / Cmd+Shift+Z keyboard shortcuts (default: false) */
  enableKeyboardShortcuts?: boolean
}

export interface UndoRedoState<T> {
  /** Current state value */
  readonly state: T
  /** Whether undo is available */
  readonly canUndo: boolean
  /** Whether redo is available */
  readonly canRedo: boolean
  /** Number of entries in the past history */
  readonly historySize: number
  /** Set a new state value, pushing the current to history */
  set: (newState: T) => void
  /** Undo to the previous state */
  undo: () => void
  /** Redo to the next state */
  redo: () => void
  /** Reset to a new initial state, clearing all history */
  reset: (initialState: T) => void
  /** Clear all history, keeping the current state */
  clear: () => void
}

interface HistorySnapshot<T> {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
}

/**
 * Hook for undo/redo state management using past/present/future pattern.
 *
 * Uses immutable state history (stack-based) with structural sharing
 * (no deep copies). Past entries exceeding maxHistory are dropped.
 *
 * @param initialState - The initial state value
 * @param options - Configuration options
 * @returns UndoRedoState object with state, controls, and status flags
 *
 * @example
 * ```tsx
 * const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo('')
 * set('hello')
 * set('world')
 * undo() // state === 'hello'
 * redo() // state === 'world'
 * ```
 */
export function useUndoRedo<T>(
  initialState: T,
  options?: UndoRedoOptions,
): UndoRedoState<T> {
  const maxHistory = options?.maxHistory ?? DEFAULT_MAX_HISTORY
  const enableKeyboardShortcuts = options?.enableKeyboardShortcuts ?? false

  const [history, setHistory] = useState<HistorySnapshot<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const historyRef = useRef(history)
  historyRef.current = history

  const set = useCallback(
    (newState: T) => {
      setHistory((prev) => {
        const newPast =
          prev.past.length >= maxHistory
            ? [...prev.past.slice(1), prev.present]
            : [...prev.past, prev.present]

        return {
          past: newPast,
          present: newState,
          future: [],
        }
      })
    },
    [maxHistory],
  )

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev

      const newPast = prev.past.slice(0, -1)
      const previous = prev.past[prev.past.length - 1]

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev

      const [next, ...remainingFuture] = prev.future

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: remainingFuture,
      }
    })
  }, [])

  const reset = useCallback((newInitialState: T) => {
    setHistory({
      past: [],
      present: newInitialState,
      future: [],
    })
  }, [])

  const clear = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }))
  }, [])

  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModKey = e.metaKey || e.ctrlKey

      if (isModKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      if (isModKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardShortcuts, undo, redo])

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historySize: history.past.length,
    set,
    undo,
    redo,
    reset,
    clear,
  }
}
