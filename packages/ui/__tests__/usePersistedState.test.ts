/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// fake-indexeddb polyfill — must be imported before modules that use idb
import 'fake-indexeddb/auto'

import { usePersistedState } from '../src/hooks/usePersistedState'
import { createPersistStorage, _resetDB } from '../src/utils/persistStorage'
import type { PersistStorage } from '../src/utils/persistStorage'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed a value into the default IndexedDB storage before hook mounts. */
async function seedIDB<T>(key: string, value: T, version = 1): Promise<void> {
  const stor = createPersistStorage(true)
  await stor.set(key, { version, value })
}

/** Read raw entry from IndexedDB. */
async function readIDB<T>(key: string): Promise<{ version: number; value: T } | undefined> {
  const stor = createPersistStorage(true)
  return stor.get(key) as Promise<{ version: number; value: T } | undefined>
}

/** Flush microtasks so fake-indexeddb promises resolve. */
async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    // Let microtask queue drain
    await new Promise((r) => setTimeout(r, 0))
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetDB()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // ---- Basic usage ----

  it('should return initial value before storage is loaded', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 42))
    expect(result.current[0]).toBe(42)
    expect(result.current[2].isLoaded).toBe(false)
  })

  it('should set isLoaded to true after hydration', async () => {
    const { result } = renderHook(() => usePersistedState('test-key', 'hello'))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })
    // Value stays at initial when nothing is in storage
    expect(result.current[0]).toBe('hello')
  })

  it('should restore a previously persisted value from IndexedDB', async () => {
    await seedIDB('restore-key', { count: 7 })

    const { result } = renderHook(() =>
      usePersistedState('restore-key', { count: 0 }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })
    expect(result.current[0]).toEqual({ count: 7 })
  })

  // ---- setValue ----

  it('should update state via direct value', async () => {
    const { result } = renderHook(() => usePersistedState('set-key', 0))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    act(() => {
      result.current[1](10)
    })
    expect(result.current[0]).toBe(10)
  })

  it('should update state via updater function', async () => {
    const { result } = renderHook(() => usePersistedState('fn-key', 5))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    act(() => {
      result.current[1]((prev) => prev + 1)
    })
    expect(result.current[0]).toBe(6)
  })

  // ---- Debounced persistence ----

  it('should debounce writes — only last value is persisted', async () => {
    // Use short debounce so test runs fast with real timers
    const { result } = renderHook(() =>
      usePersistedState('debounce-key', 'a', { debounceMs: 50 }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    // Rapid updates — only the last should be persisted
    act(() => {
      result.current[1]('b')
      result.current[1]('c')
      result.current[1]('d')
    })

    // State is updated immediately
    expect(result.current[0]).toBe('d')

    // Wait for debounce + IDB write
    await waitFor(async () => {
      const entry = await readIDB<string>('debounce-key')
      expect(entry?.value).toBe('d')
    }, { timeout: 2000 })
  })

  it('should respect custom debounceMs', async () => {
    const { result } = renderHook(() =>
      usePersistedState('custom-debounce', 0, { debounceMs: 80 }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    act(() => {
      result.current[1](99)
    })

    // Wait for debounce to fire + persist
    await waitFor(async () => {
      const entry = await readIDB<number>('custom-debounce')
      expect(entry?.value).toBe(99)
    }, { timeout: 2000 })
  })

  // ---- Version & migration ----

  it('should migrate data when stored version differs', async () => {
    // Seed version 1 data
    await seedIDB('migrate-key', { name: 'old' }, 1)

    const migrate = vi.fn((old: unknown, oldVer: number) => {
      const prev = old as { name: string }
      return { name: prev.name, migrated: true, fromVersion: oldVer }
    })

    const { result } = renderHook(() =>
      usePersistedState('migrate-key', { name: '', migrated: false, fromVersion: 0 }, {
        version: 2,
        migrate,
      }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    expect(migrate).toHaveBeenCalledWith({ name: 'old' }, 1)
    expect(result.current[0]).toEqual({ name: 'old', migrated: true, fromVersion: 1 })

    // Migrated value should be persisted with new version
    await waitFor(async () => {
      const entry = await readIDB<any>('migrate-key')
      expect(entry?.version).toBe(2)
      expect(entry?.value.migrated).toBe(true)
    })
  })

  it('should not call migrate when versions match', async () => {
    await seedIDB('no-migrate', 'same', 3)

    const migrate = vi.fn()
    const { result } = renderHook(() =>
      usePersistedState('no-migrate', '', { version: 3, migrate }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    expect(migrate).not.toHaveBeenCalled()
    expect(result.current[0]).toBe('same')
  })

  // ---- clear ----

  it('should reset state and remove persisted entry on clear', async () => {
    await seedIDB('clear-key', 'persisted')

    const { result } = renderHook(() => usePersistedState('clear-key', 'default'))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })
    expect(result.current[0]).toBe('persisted')

    act(() => {
      result.current[2].clear()
    })

    expect(result.current[0]).toBe('default')

    // Storage entry should be removed
    await waitFor(async () => {
      const entry = await readIDB<string>('clear-key')
      expect(entry).toBeUndefined()
    })
  })

  // ---- localStorage fallback ----

  it('should use localStorage when storage option is localStorage', async () => {
    localStorage.setItem(
      'ls-key',
      JSON.stringify({ version: 1, value: 'from-ls' }),
    )

    const { result } = renderHook(() =>
      usePersistedState('ls-key', 'init', { storage: 'localStorage' }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })
    expect(result.current[0]).toBe('from-ls')

    // Update and flush with fake timers
    vi.useFakeTimers()
    act(() => {
      result.current[1]('updated')
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    vi.useRealTimers()

    await waitFor(() => {
      const raw = localStorage.getItem('ls-key')
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!)
      expect(parsed.value).toBe('updated')
    })
  })

  // ---- Immutability ----

  it('should not mutate previous state on update', async () => {
    const initial = { items: [1, 2, 3] }
    const { result } = renderHook(() => usePersistedState('immut-key', initial))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    const prevState = result.current[0]

    act(() => {
      result.current[1]((prev) => ({ ...prev, items: [...prev.items, 4] }))
    })

    // Previous reference should be unchanged
    expect(prevState.items).toEqual([1, 2, 3])
    expect(result.current[0].items).toEqual([1, 2, 3, 4])
  })

  // ---- Edge cases ----

  it('should handle missing version field in stored data gracefully', async () => {
    // Manually store without version field
    const stor = createPersistStorage(true)
    await stor.set('no-ver', { value: 'legacy' })

    const migrate = vi.fn((_old: unknown) => 'migrated-val')
    const { result } = renderHook(() =>
      usePersistedState('no-ver', 'default', { version: 2, migrate }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    // version defaults to 0, which differs from 2 -> migrate called
    expect(migrate).toHaveBeenCalledWith('legacy', 0)
    expect(result.current[0]).toBe('migrated-val')
  })

  it('should handle empty storage gracefully and stay at initial value', async () => {
    const { result } = renderHook(() => usePersistedState('empty-key', 'fallback'))

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })
    expect(result.current[0]).toBe('fallback')
  })

  it('should persist version alongside value', async () => {
    const { result } = renderHook(() =>
      usePersistedState('ver-key', 'val', { version: 5 }),
    )

    await waitFor(() => {
      expect(result.current[2].isLoaded).toBe(true)
    })

    vi.useFakeTimers()
    act(() => {
      result.current[1]('new-val')
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    vi.useRealTimers()

    await waitFor(async () => {
      const entry = await readIDB<string>('ver-key')
      expect(entry?.version).toBe(5)
      expect(entry?.value).toBe('new-val')
    })
  })
})

// ---------------------------------------------------------------------------
// persistStorage unit tests
// ---------------------------------------------------------------------------

describe('persistStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetDB()
  })

  it('should round-trip values through IndexedDB storage', async () => {
    const stor = createPersistStorage(true)
    await stor.set('idb-rt', { hello: 'world' })
    const result = await stor.get<{ hello: string }>('idb-rt')
    expect(result).toEqual({ hello: 'world' })
  })

  it('should return undefined for missing keys', async () => {
    const stor = createPersistStorage(true)
    const result = await stor.get('nonexistent')
    expect(result).toBeUndefined()
  })

  it('should delete a key', async () => {
    const stor = createPersistStorage(true)
    await stor.set('del-key', 123)
    await stor.delete('del-key')
    const result = await stor.get('del-key')
    expect(result).toBeUndefined()
  })

  it('should clear all entries', async () => {
    const stor = createPersistStorage(true)
    await stor.set('a', 1)
    await stor.set('b', 2)
    await stor.clear()
    expect(await stor.get('a')).toBeUndefined()
    expect(await stor.get('b')).toBeUndefined()
  })

  it('should round-trip via localStorage adapter', async () => {
    const stor = createPersistStorage(false)
    await stor.set('ls-rt', [1, 2, 3])
    const result = await stor.get<number[]>('ls-rt')
    expect(result).toEqual([1, 2, 3])

    // Verify it actually wrote to localStorage
    const raw = localStorage.getItem('ls-rt')
    expect(raw).toBe(JSON.stringify([1, 2, 3]))
  })

  it('should delete from localStorage', async () => {
    const stor = createPersistStorage(false)
    await stor.set('ls-del', 'x')
    await stor.delete('ls-del')
    expect(localStorage.getItem('ls-del')).toBeNull()
  })

  it('should return undefined for corrupt localStorage JSON', async () => {
    localStorage.setItem('corrupt', '{bad json}}}')
    const stor = createPersistStorage(false)
    const result = await stor.get('corrupt')
    expect(result).toBeUndefined()
  })

  it('should overwrite existing values', async () => {
    const stor = createPersistStorage(true)
    await stor.set('overwrite', 'first')
    await stor.set('overwrite', 'second')
    const result = await stor.get<string>('overwrite')
    expect(result).toBe('second')
  })

  it('should handle complex nested objects', async () => {
    const stor = createPersistStorage(true)
    const complex = { a: { b: { c: [1, 2, { d: true }] } } }
    await stor.set('complex', complex)
    const result = await stor.get<typeof complex>('complex')
    expect(result).toEqual(complex)
  })
})
