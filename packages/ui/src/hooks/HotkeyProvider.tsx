'use client'

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { normalizeKeyCombo } from '../utils/keyboardUtils'

export interface HotkeyRegistryEntry {
  key: string
  description: string
  enabled?: boolean
}

interface HotkeyContextValue {
  register: (id: string, entries: HotkeyRegistryEntry[]) => void
  unregister: (id: string) => void
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => HotkeyRegistryEntry[]
}

const HotkeyContext = createContext<HotkeyContextValue | null>(null)

export function HotkeyProvider({ children }: { children: ReactNode }) {
  const registryRef = useRef<Map<string, HotkeyRegistryEntry[]>>(new Map())
  const listenersRef = useRef<Set<() => void>>(new Set())
  const snapshotRef = useRef<HotkeyRegistryEntry[]>([])

  const emitChange = useCallback(() => {
    const allEntries: HotkeyRegistryEntry[] = []
    for (const entries of registryRef.current.values()) {
      allEntries.push(...entries)
    }
    snapshotRef.current = allEntries
    for (const listener of listenersRef.current) {
      listener()
    }
  }, [])

  const register = useCallback(
    (id: string, entries: HotkeyRegistryEntry[]) => {
      // Detect duplicates across all registrations
      const existingKeys = new Set<string>()
      for (const [existingId, existingEntries] of registryRef.current) {
        if (existingId === id) continue
        for (const entry of existingEntries) {
          existingKeys.add(normalizeKeyCombo(entry.key))
        }
      }

      // Check within the new entries themselves for duplicates
      const newKeys = new Set<string>()
      for (const entry of entries) {
        const normalized = normalizeKeyCombo(entry.key)
        if (existingKeys.has(normalized) || newKeys.has(normalized)) {
          console.warn(
            `[useHotkeys] Duplicate hotkey detected: "${entry.key}" (${entry.description}). ` +
              'This may cause conflicts.',
          )
        }
        newKeys.add(normalized)
      }

      registryRef.current.set(id, entries)
      emitChange()
    },
    [emitChange],
  )

  const unregister = useCallback(
    (id: string) => {
      registryRef.current.delete(id)
      emitChange()
    },
    [emitChange],
  )

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  return (
    <HotkeyContext value={{ register, unregister, subscribe, getSnapshot }}>
      {children}
    </HotkeyContext>
  )
}

export function useHotkeyContext(): HotkeyContextValue | null {
  return useContext(HotkeyContext)
}

/**
 * Returns the list of all currently registered hotkeys.
 * Must be used within a HotkeyProvider.
 */
export function useHotkeyRegistryFromContext(): HotkeyRegistryEntry[] {
  const ctx = useContext(HotkeyContext)
  if (!ctx) {
    return []
  }

  return useSyncExternalStore(ctx.subscribe, ctx.getSnapshot, () => [])
}
