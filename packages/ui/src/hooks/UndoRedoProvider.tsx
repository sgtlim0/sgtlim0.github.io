'use client'

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

const DEFAULT_MAX_HISTORY = 50

interface HistorySnapshot<T> {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
}

interface UndoRedoContextValue<T> {
  /** Current state value */
  getState: () => T
  /** Set a new state value */
  set: (newState: T) => void
  /** Undo to the previous state */
  undo: () => void
  /** Redo to the next state */
  redo: () => void
  /** Reset to a new initial state, clearing all history */
  reset: (initialState: T) => void
  /** Clear all history, keeping the current state */
  clear: () => void
  /** Whether undo is available */
  getCanUndo: () => boolean
  /** Whether redo is available */
  getCanRedo: () => boolean
  /** Number of entries in past history */
  getHistorySize: () => number
  /** Subscribe to state changes */
  subscribe: (listener: () => void) => () => void
  /** Get immutable snapshot for useSyncExternalStore */
  getSnapshot: () => HistorySnapshot<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UndoRedoContext = createContext<UndoRedoContextValue<any> | null>(null)

interface UndoRedoProviderProps<T> {
  /** Initial state value */
  initialState: T
  /** Maximum number of history entries (default: 50) */
  maxHistory?: number
  children: ReactNode
}

/**
 * Context-based UndoRedo provider for sharing undo/redo state across components.
 *
 * @example
 * ```tsx
 * <UndoRedoProvider initialState={{ text: '' }}>
 *   <Editor />
 *   <UndoRedoControls />
 * </UndoRedoProvider>
 * ```
 */
export function UndoRedoProvider<T>({
  initialState,
  maxHistory = DEFAULT_MAX_HISTORY,
  children,
}: UndoRedoProviderProps<T>) {
  const historyRef = useRef<HistorySnapshot<T>>({
    past: [],
    present: initialState,
    future: [],
  })
  const listenersRef = useRef<Set<() => void>>(new Set())

  const emitChange = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener()
    }
  }, [])

  const set = useCallback(
    (newState: T) => {
      const prev = historyRef.current
      const newPast =
        prev.past.length >= maxHistory
          ? [...prev.past.slice(1), prev.present]
          : [...prev.past, prev.present]

      historyRef.current = {
        past: newPast,
        present: newState,
        future: [],
      }
      emitChange()
    },
    [maxHistory, emitChange],
  )

  const undo = useCallback(() => {
    const prev = historyRef.current
    if (prev.past.length === 0) return

    const newPast = prev.past.slice(0, -1)
    const previous = prev.past[prev.past.length - 1]

    historyRef.current = {
      past: newPast,
      present: previous,
      future: [prev.present, ...prev.future],
    }
    emitChange()
  }, [emitChange])

  const redo = useCallback(() => {
    const prev = historyRef.current
    if (prev.future.length === 0) return

    const [next, ...remainingFuture] = prev.future

    historyRef.current = {
      past: [...prev.past, prev.present],
      present: next,
      future: remainingFuture,
    }
    emitChange()
  }, [emitChange])

  const reset = useCallback(
    (newInitialState: T) => {
      historyRef.current = {
        past: [],
        present: newInitialState,
        future: [],
      }
      emitChange()
    },
    [emitChange],
  )

  const clear = useCallback(() => {
    historyRef.current = {
      past: [],
      present: historyRef.current.present,
      future: [],
    }
    emitChange()
  }, [emitChange])

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => historyRef.current, [])
  const getState = useCallback(() => historyRef.current.present, [])
  const getCanUndo = useCallback(() => historyRef.current.past.length > 0, [])
  const getCanRedo = useCallback(() => historyRef.current.future.length > 0, [])
  const getHistorySize = useCallback(() => historyRef.current.past.length, [])

  const contextValue: UndoRedoContextValue<T> = {
    getState,
    set,
    undo,
    redo,
    reset,
    clear,
    getCanUndo,
    getCanRedo,
    getHistorySize,
    subscribe,
    getSnapshot,
  }

  return <UndoRedoContext value={contextValue}>{children}</UndoRedoContext>
}

/**
 * Hook to consume the UndoRedo context.
 * Must be used within an UndoRedoProvider.
 *
 * @returns Object with state, controls, and status flags
 */
export function useUndoRedoContext<T>() {
  const ctx = useContext(UndoRedoContext) as UndoRedoContextValue<T> | null
  if (!ctx) {
    throw new Error('useUndoRedoContext must be used within an UndoRedoProvider')
  }

  const snapshot = useSyncExternalStore(ctx.subscribe, ctx.getSnapshot, ctx.getSnapshot)

  return {
    state: snapshot.present as T,
    canUndo: snapshot.past.length > 0,
    canRedo: snapshot.future.length > 0,
    historySize: snapshot.past.length,
    set: ctx.set,
    undo: ctx.undo,
    redo: ctx.redo,
    reset: ctx.reset,
    clear: ctx.clear,
  }
}
