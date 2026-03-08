'use client'

import type { HotkeyConfig } from './useHotkeys'

export interface DefaultHotkeyHandlers {
  onCommandPalette?: () => void
  onHelp?: () => void
  onEscape?: () => void
  onToggleDarkMode?: () => void
}

/**
 * Creates a set of default hotkey configs from handler callbacks.
 * - Cmd/Ctrl+K — Command palette
 * - Cmd/Ctrl+/ — Help / shortcut list
 * - Escape — Close modal / panel
 * - Cmd/Ctrl+Shift+D — Toggle dark mode
 */
export function createDefaultHotkeys(handlers: DefaultHotkeyHandlers): HotkeyConfig[] {
  const hotkeys: HotkeyConfig[] = []

  if (handlers.onCommandPalette) {
    hotkeys.push({
      key: 'mod+k',
      handler: handlers.onCommandPalette,
      description: 'Open command palette',
      preventDefault: true,
    })
  }

  if (handlers.onHelp) {
    hotkeys.push({
      key: 'mod+/',
      handler: handlers.onHelp,
      description: 'Show keyboard shortcuts',
      preventDefault: true,
    })
  }

  if (handlers.onEscape) {
    hotkeys.push({
      key: 'escape',
      handler: handlers.onEscape,
      description: 'Close modal / panel',
    })
  }

  if (handlers.onToggleDarkMode) {
    hotkeys.push({
      key: 'mod+shift+d',
      handler: handlers.onToggleDarkMode,
      description: 'Toggle dark mode',
      preventDefault: true,
    })
  }

  return hotkeys
}
