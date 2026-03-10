/**
 * Keyboard shortcut utilities — pure functions for parsing and matching key combos.
 * No external dependencies, SSR-safe.
 */

export interface KeyCombo {
  key: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
}

const MODIFIER_ORDER = ['ctrl', 'alt', 'shift', 'meta'] as const

const MODIFIER_ALIASES: Record<string, keyof KeyCombo> = {
  ctrl: 'ctrl',
  control: 'ctrl',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /mac|iphone|ipad|ipod/i.test(navigator.platform ?? navigator.userAgent ?? '')
}

/**
 * Parses a key combo string (e.g. "ctrl+shift+k") into a structured KeyCombo.
 * - Case-insensitive
 * - Supports aliases: cmd/command → meta, option → alt, control → ctrl
 * - "mod" maps to meta on Mac, ctrl on Windows
 */
export function parseKeyCombo(combo: string): KeyCombo {
  const parts = combo.toLowerCase().trim().split('+').map((p) => p.trim())

  const result: KeyCombo = {
    key: '',
    ctrl: false,
    meta: false,
    shift: false,
    alt: false,
  }

  for (const part of parts) {
    if (part === 'mod') {
      if (isMac()) {
        result.meta = true
      } else {
        result.ctrl = true
      }
    } else if (part in MODIFIER_ALIASES) {
      const modifier = MODIFIER_ALIASES[part]
      if (modifier !== 'key') {
        ;(result as unknown as Record<string, boolean>)[modifier] = true
      }
    } else {
      result.key = part
    }
  }

  return result
}

/**
 * Normalizes a key combo string for consistent comparison.
 * - Lowercases, trims whitespace
 * - Sorts modifiers in a canonical order: ctrl+alt+shift+meta+key
 * - Replaces aliases (cmd → meta, etc.)
 */
export function normalizeKeyCombo(combo: string): string {
  const parsed = parseKeyCombo(combo)

  const parts: string[] = []
  for (const mod of MODIFIER_ORDER) {
    if (parsed[mod]) {
      parts.push(mod)
    }
  }
  parts.push(parsed.key)

  return parts.join('+')
}

/**
 * Checks whether a KeyboardEvent matches a given key combo string.
 * - Case-insensitive key comparison
 * - Strict modifier matching (extra modifiers = no match)
 */
export function matchesKeyEvent(event: KeyboardEvent, combo: string): boolean {
  const parsed = parseKeyCombo(combo)

  const eventKey = event.key.toLowerCase()
  if (eventKey !== parsed.key) return false

  if (event.ctrlKey !== parsed.ctrl) return false
  if (event.metaKey !== parsed.meta) return false
  if (event.shiftKey !== parsed.shift) return false
  if (event.altKey !== parsed.alt) return false

  return true
}
