'use client'

import { useEffect, useRef, useId, useMemo } from 'react'
import { matchesKeyEvent } from '../utils/keyboardUtils'
import { useHotkeyContext, useHotkeyRegistryFromContext } from './HotkeyProvider'
import type { HotkeyRegistryEntry } from './HotkeyProvider'

export interface HotkeyConfig {
  /** Key combo string, e.g. 'ctrl+k', 'meta+/', 'escape' */
  key: string
  /** Handler function called when the hotkey is triggered */
  handler: () => void
  /** Human-readable description of what this hotkey does */
  description: string
  /** Whether this hotkey is active. Defaults to true. */
  enabled?: boolean
  /** Whether to call event.preventDefault(). Defaults to false. */
  preventDefault?: boolean
}

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (IGNORED_TAGS.has(target.tagName)) return true
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') return true
  return false
}

/**
 * Registers keyboard shortcuts and listens for matching keydown events.
 *
 * - Ignores events from input, textarea, select, and contentEditable elements
 * - SSR-safe (no-op when document is unavailable)
 * - Optionally registers with HotkeyProvider for a global registry
 */
export function useHotkeys(hotkeys: HotkeyConfig[]): void {
  const hotkeysRef = useRef(hotkeys)
  hotkeysRef.current = hotkeys

  const id = useId()
  const ctx = useHotkeyContext()

  // Stable serialization key to avoid infinite loops with useSyncExternalStore
  const registryKey = useMemo(
    () =>
      hotkeys
        .map((h) => `${h.key}:${h.description}:${h.enabled ?? true}`)
        .join('|'),
    [hotkeys],
  )

  // Register with the provider context (if available)
  useEffect(() => {
    if (!ctx) return

    const entries: HotkeyRegistryEntry[] = hotkeysRef.current.map((h) => ({
      key: h.key,
      description: h.description,
      enabled: h.enabled,
    }))

    ctx.register(id, entries)
    return () => {
      ctx.unregister(id)
    }
  }, [ctx, id, registryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keydown listener
  useEffect(() => {
    if (typeof document === 'undefined') return

    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      for (const hotkey of hotkeysRef.current) {
        if (hotkey.enabled === false) continue

        if (matchesKeyEvent(event, hotkey.key)) {
          if (hotkey.preventDefault) {
            event.preventDefault()
          }
          hotkey.handler()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [hotkeys])
}

/**
 * Returns the list of all currently registered hotkeys from the HotkeyProvider.
 * Must be used within a HotkeyProvider for results; returns [] otherwise.
 */
export function useHotkeyRegistry(): HotkeyRegistryEntry[] {
  return useHotkeyRegistryFromContext()
}

export type { HotkeyRegistryEntry }
