'use client'

import { useState, useCallback, useMemo } from 'react'
import { useHotkeyRegistryFromContext } from './HotkeyProvider'
import type { HotkeyRegistryEntry } from './HotkeyProvider'

export type ShortcutCategory = 'Navigation' | 'Actions' | 'Settings'

export interface CategorizedShortcut {
  readonly key: string
  readonly description: string
  readonly category: ShortcutCategory
  readonly enabled: boolean
}

export interface ShortcutGroup {
  readonly category: ShortcutCategory
  readonly shortcuts: readonly CategorizedShortcut[]
}

export interface UseShortcutHelpReturn {
  /** Whether the help dialog is open */
  readonly isOpen: boolean
  /** Open the help dialog */
  readonly open: () => void
  /** Close the help dialog */
  readonly close: () => void
  /** Toggle the help dialog */
  readonly toggle: () => void
  /** Current search query */
  readonly query: string
  /** Update the search query */
  readonly setQuery: (q: string) => void
  /** Grouped and filtered shortcuts */
  readonly groups: readonly ShortcutGroup[]
  /** All shortcuts (flat, unfiltered) */
  readonly allShortcuts: readonly CategorizedShortcut[]
}

// Heuristic to assign categories based on description/key
const NAVIGATION_PATTERNS = /navigate|go to|page|sidebar|tab|back|forward|home|scroll|search|find/i
const SETTINGS_PATTERNS = /setting|theme|dark|light|toggle|mode|config|preference/i

function categorizeEntry(entry: HotkeyRegistryEntry): ShortcutCategory {
  const text = entry.description

  if (SETTINGS_PATTERNS.test(text)) return 'Settings'
  if (NAVIGATION_PATTERNS.test(text)) return 'Navigation'

  return 'Actions'
}

function toCategorizedShortcut(entry: HotkeyRegistryEntry): CategorizedShortcut {
  return {
    key: entry.key,
    description: entry.description,
    category: categorizeEntry(entry),
    enabled: entry.enabled ?? true,
  }
}

const CATEGORY_ORDER: readonly ShortcutCategory[] = ['Navigation', 'Actions', 'Settings']

/**
 * Hook providing state and data for the ShortcutHelp dialog.
 *
 * - Reads registered hotkeys from HotkeyProvider context
 * - Groups by category (Navigation, Actions, Settings)
 * - Filters by search query (description or key)
 */
export function useShortcutHelp(): UseShortcutHelpReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const registryEntries = useHotkeyRegistryFromContext()

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setQuery('')
      return !prev
    })
  }, [])

  const allShortcuts = useMemo(
    () => registryEntries.map(toCategorizedShortcut),
    [registryEntries],
  )

  const groups = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim()

    const filtered = lowerQuery
      ? allShortcuts.filter(
          (s) =>
            s.description.toLowerCase().includes(lowerQuery) ||
            s.key.toLowerCase().includes(lowerQuery),
        )
      : allShortcuts

    const groupMap = new Map<ShortcutCategory, CategorizedShortcut[]>()
    for (const shortcut of filtered) {
      const existing = groupMap.get(shortcut.category)
      if (existing) {
        existing.push(shortcut)
      } else {
        groupMap.set(shortcut.category, [shortcut])
      }
    }

    const result: ShortcutGroup[] = []
    for (const category of CATEGORY_ORDER) {
      const shortcuts = groupMap.get(category)
      if (shortcuts && shortcuts.length > 0) {
        result.push({ category, shortcuts })
      }
    }

    return result
  }, [allShortcuts, query])

  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    groups,
    allShortcuts,
  }
}
