/**
 * Central shortcut manager — register, scope, conflict-detect, and dispatch keyboard shortcuts.
 * Reuses parseKeyCombo / matchesKeyEvent / normalizeKeyCombo from keyboardUtils.
 */

import { normalizeKeyCombo, matchesKeyEvent } from './keyboardUtils'

export interface ShortcutEntry {
  id: string
  key: string
  handler: () => void
  description: string
  category: string
  enabled: boolean
  scope?: string
}

export interface ShortcutManager {
  register: (entry: Omit<ShortcutEntry, 'id'>) => string
  unregister: (id: string) => void
  enable: (id: string) => void
  disable: (id: string) => void
  setScope: (scope: string) => void
  getScope: () => string
  getAll: () => ShortcutEntry[]
  getByCategory: () => Record<string, ShortcutEntry[]>
  handleKeyEvent: (event: KeyboardEvent) => boolean
  reset: () => void
}

let nextId = 0

function generateId(): string {
  nextId += 1
  return `shortcut_${nextId}`
}

export function resetIdCounter(): void {
  nextId = 0
}

export function createShortcutManager(): ShortcutManager {
  const entries = new Map<string, ShortcutEntry>()
  let currentScope = 'global'

  function register(entry: Omit<ShortcutEntry, 'id'>): string {
    const id = generateId()
    const normalized = normalizeKeyCombo(entry.key)
    const scope = entry.scope ?? 'global'

    // Conflict detection: warn if same key + scope already registered
    for (const existing of entries.values()) {
      const existingNormalized = normalizeKeyCombo(existing.key)
      const existingScope = existing.scope ?? 'global'
      if (existingNormalized === normalized && existingScope === scope) {
        console.warn(
          `[ShortcutManager] Conflict: "${entry.key}" (${entry.description}) ` +
            `collides with "${existing.key}" (${existing.description}) in scope "${scope}".`,
        )
      }
    }

    entries.set(id, {
      ...entry,
      id,
      key: entry.key,
      scope,
    })

    return id
  }

  function unregister(id: string): void {
    entries.delete(id)
  }

  function enable(id: string): void {
    const entry = entries.get(id)
    if (entry) {
      entries.set(id, { ...entry, enabled: true })
    }
  }

  function disable(id: string): void {
    const entry = entries.get(id)
    if (entry) {
      entries.set(id, { ...entry, enabled: false })
    }
  }

  function setScope(scope: string): void {
    currentScope = scope
  }

  function getScope(): string {
    return currentScope
  }

  function getAll(): ShortcutEntry[] {
    return Array.from(entries.values())
  }

  function getByCategory(): Record<string, ShortcutEntry[]> {
    const result: Record<string, ShortcutEntry[]> = {}
    for (const entry of entries.values()) {
      if (!result[entry.category]) {
        result[entry.category] = []
      }
      result[entry.category].push(entry)
    }
    return result
  }

  function handleKeyEvent(event: KeyboardEvent): boolean {
    for (const entry of entries.values()) {
      if (!entry.enabled) continue

      const scope = entry.scope ?? 'global'
      if (scope !== 'global' && scope !== currentScope) continue

      if (matchesKeyEvent(event, entry.key)) {
        entry.handler()
        return true
      }
    }
    return false
  }

  function reset(): void {
    entries.clear()
    currentScope = 'global'
  }

  return {
    register,
    unregister,
    enable,
    disable,
    setScope,
    getScope,
    getAll,
    getByCategory,
    handleKeyEvent,
    reset,
  }
}
