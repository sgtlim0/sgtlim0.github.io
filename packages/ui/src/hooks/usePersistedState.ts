'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPersistStorage } from '../utils/persistStorage'
import type { PersistStorage } from '../utils/persistStorage'

/** Internal versioned wrapper stored in persistence. */
interface VersionedEntry<T> {
  readonly version: number
  readonly value: T
}

export interface UsePersistedStateOptions<T> {
  /** Storage backend — 'indexedDB' (default) or 'localStorage'. */
  storage?: 'localStorage' | 'indexedDB'
  /** Debounce interval in ms before persisting (default 500). */
  debounceMs?: number
  /** Schema version for migration support. */
  version?: number
  /** Migration callback invoked when stored version differs from current. */
  migrate?: (oldValue: unknown, oldVersion: number) => T
}

/**
 * React hook that persists state to IndexedDB (or localStorage).
 *
 * Features:
 * - Debounced writes to avoid excessive I/O on rapid updates
 * - Schema versioning with migration callback
 * - `isLoaded` flag to distinguish initial render from hydrated state
 * - SSR-safe (no-ops on server)
 *
 * @returns `[value, setValue, { isLoaded, clear }]`
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: UsePersistedStateOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, { isLoaded: boolean; clear: () => void }] {
  const {
    storage: storageType = 'indexedDB',
    debounceMs = 500,
    version = 1,
    migrate,
  } = options

  const [state, setState] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Stable refs so the debounced writer always sees latest values
  const stateRef = useRef<T>(state)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageRef = useRef<PersistStorage | null>(null)
  const mountedRef = useRef(true)

  // Create storage once
  if (storageRef.current === null && typeof window !== 'undefined') {
    storageRef.current = createPersistStorage(storageType === 'indexedDB')
  }

  // ---- Load from storage on mount ----
  useEffect(() => {
    mountedRef.current = true
    const stor = storageRef.current
    if (!stor) {
      setIsLoaded(true)
      return
    }

    let cancelled = false

    stor.get<VersionedEntry<T>>(key).then((entry) => {
      if (cancelled || !mountedRef.current) return

      if (entry !== undefined) {
        const storedVersion = entry.version ?? 0
        if (storedVersion !== version && migrate) {
          const migrated = migrate(entry.value, storedVersion)
          setState(migrated)
          stateRef.current = migrated
          // Persist migrated value immediately
          const updated: VersionedEntry<T> = { version, value: migrated }
          stor.set(key, updated)
        } else {
          setState(entry.value as T)
          stateRef.current = entry.value as T
        }
      }
      setIsLoaded(true)
    }).catch(() => {
      if (mountedRef.current) {
        setIsLoaded(true)
      }
    })

    return () => {
      cancelled = true
      mountedRef.current = false
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        // Flush pending write synchronously on unmount
        const stor2 = storageRef.current
        if (stor2) {
          const flushed: VersionedEntry<T> = { version, value: stateRef.current }
          stor2.set(key, flushed)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // ---- Debounced persistence ----
  const persist = useCallback(
    (newValue: T) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        const stor = storageRef.current
        if (stor) {
          const entry: VersionedEntry<T> = { version, value: newValue }
          stor.set(key, entry)
        }
      }, debounceMs)
    },
    [key, version, debounceMs],
  )

  // ---- Setter (matches React setState signature) ----
  const setValue = useCallback(
    (action: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action
        stateRef.current = next
        persist(next)
        return next
      })
    },
    [persist],
  )

  // ---- Clear helper ----
  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setState(initialValue)
    stateRef.current = initialValue
    const stor = storageRef.current
    if (stor) {
      stor.delete(key)
    }
  }, [key, initialValue])

  return [state, setValue, { isLoaded, clear }]
}
