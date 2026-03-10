'use client'

import type { ReactNode } from 'react'

export interface ShortcutKeyProps {
  /** Key combo string, e.g. 'mod+/', 'ctrl+shift+d', 'escape' */
  readonly keys: string
}

const MAC_SYMBOLS: Record<string, string> = {
  meta: '\u2318',
  cmd: '\u2318',
  command: '\u2318',
  ctrl: '\u2303',
  control: '\u2303',
  alt: '\u2325',
  option: '\u2325',
  shift: '\u21E7',
  enter: '\u21A9',
  return: '\u21A9',
  escape: 'Esc',
  backspace: '\u232B',
  delete: '\u2326',
  tab: '\u21E5',
  arrowup: '\u2191',
  arrowdown: '\u2193',
  arrowleft: '\u2190',
  arrowright: '\u2192',
  space: 'Space',
}

const WIN_LABELS: Record<string, string> = {
  meta: 'Ctrl',
  cmd: 'Ctrl',
  command: 'Ctrl',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Esc',
  backspace: 'Backspace',
  delete: 'Delete',
  tab: 'Tab',
  arrowup: '\u2191',
  arrowdown: '\u2193',
  arrowleft: '\u2190',
  arrowright: '\u2192',
  space: 'Space',
}

function detectMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /mac|iphone|ipad|ipod/i.test(navigator.platform ?? navigator.userAgent ?? '')
}

function resolveKeyLabel(part: string, isMac: boolean): string {
  const lower = part.toLowerCase().trim()

  // Handle "mod" — meta on Mac, Ctrl on Windows
  if (lower === 'mod') {
    return isMac ? '\u2318' : 'Ctrl'
  }

  const lookup = isMac ? MAC_SYMBOLS : WIN_LABELS
  if (lower in lookup) {
    return lookup[lower]
  }

  // Single character keys display uppercase
  if (lower.length === 1) {
    return lower.toUpperCase()
  }

  // Capitalize first letter for unknown keys
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Renders a keyboard key combination as styled <kbd> elements.
 *
 * - Automatically switches between Mac symbols and Windows labels
 * - Parts separated by "+" in the combo string
 * - Visual separator between keys
 */
export function ShortcutKey({ keys }: ShortcutKeyProps): ReactNode {
  const isMac = detectMac()
  const parts = keys.split('+').map((p) => p.trim()).filter(Boolean)

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={keys}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center">
          {index > 0 && (
            <span className="text-[var(--color-text-muted,#9ca3af)] mx-0.5 text-xs select-none">
              +
            </span>
          )}
          <kbd
            className={[
              'inline-flex items-center justify-center',
              'min-w-[1.5rem] h-6 px-1.5',
              'rounded border text-xs font-mono font-medium leading-none',
              'bg-[var(--color-bg-secondary,#f3f4f6)] dark:bg-[var(--color-bg-secondary,#374151)]',
              'border-[var(--color-border,#d1d5db)] dark:border-[var(--color-border,#4b5563)]',
              'text-[var(--color-text-primary,#111827)] dark:text-[var(--color-text-primary,#f9fafb)]',
              'shadow-[0_1px_0_1px_rgba(0,0,0,0.05)]',
            ].join(' ')}
          >
            {resolveKeyLabel(part, isMac)}
          </kbd>
        </span>
      ))}
    </span>
  )
}

export default ShortcutKey
