'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'
import { useCommandPalette, type Command } from './hooks/useCommandPalette'

// --- Context ---

interface CommandPaletteContextValue {
  commands: Command[]
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined)

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within CommandPaletteProvider')
  }
  return context
}

// --- Default commands ---

export function createDefaultCommands(options?: {
  onNavigateHome?: () => void
  onToggleDarkMode?: () => void
  onSearch?: () => void
  onSettings?: () => void
}): Command[] {
  const commands: Command[] = []

  if (options?.onNavigateHome) {
    commands.push({
      id: 'nav-home',
      label: 'Go to Home',
      category: 'navigation',
      shortcut: 'Ctrl+H',
      icon: 'home',
      handler: options.onNavigateHome,
    })
  }

  if (options?.onToggleDarkMode) {
    commands.push({
      id: 'action-dark-mode',
      label: 'Toggle Dark Mode',
      category: 'action',
      shortcut: 'Ctrl+Shift+D',
      icon: 'moon',
      handler: options.onToggleDarkMode,
    })
  }

  if (options?.onSearch) {
    commands.push({
      id: 'action-search',
      label: 'Search',
      category: 'action',
      shortcut: 'Ctrl+/',
      icon: 'search',
      handler: options.onSearch,
    })
  }

  if (options?.onSettings) {
    commands.push({
      id: 'nav-settings',
      label: 'Open Settings',
      category: 'settings',
      shortcut: 'Ctrl+,',
      icon: 'settings',
      handler: options.onSettings,
    })
  }

  return commands
}

// --- Fuzzy match ---

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      qi++
    }
  }
  return qi === lowerQuery.length
}

// --- Recent commands storage ---

const RECENT_KEY = 'hchat-command-palette-recent'
const MAX_RECENT = 5

function getRecentIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

function addRecentId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentIds().filter((r) => r !== id)
    const updated = [id, ...recent].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

// --- Category labels ---

const CATEGORY_LABELS: Record<Command['category'], string> = {
  navigation: 'Navigation',
  action: 'Actions',
  settings: 'Settings',
}

// --- CommandPalette component ---

interface CommandPaletteProps {
  commands: Command[]
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ commands, isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const recentIds = useMemo(() => (isOpen ? getRecentIds() : []), [isOpen])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    return commands.filter((cmd) => fuzzyMatch(cmd.label, query))
  }, [commands, query])

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    for (const cmd of filtered) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category]!.push(cmd)
    }
    return groups
  }, [filtered])

  const flatList = useMemo(() => {
    const order: Command['category'][] = ['navigation', 'action', 'settings']
    const result: Command[] = []
    for (const cat of order) {
      if (grouped[cat]) {
        result.push(...grouped[cat]!)
      }
    }
    return result
  }, [grouped])

  const recentCommands = useMemo(() => {
    if (query.trim()) return []
    return recentIds
      .map((id) => commands.find((c) => c.id === id))
      .filter((c): c is Command => c !== undefined)
  }, [recentIds, commands, query])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-command-item]')
    const selected = items[selectedIndex]
    if (selected && typeof selected.scrollIntoView === 'function') {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const executeCommand = useCallback(
    (command: Command) => {
      addRecentId(command.id)
      onClose()
      command.handler()
    },
    [onClose],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = recentCommands.length + flatList.length

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % Math.max(totalItems, 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1))
          break
        case 'Enter': {
          e.preventDefault()
          const allItems = [...recentCommands, ...flatList]
          const target = allItems[selectedIndex]
          if (target) {
            executeCommand(target)
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [flatList, recentCommands, selectedIndex, executeCommand, onClose],
  )

  if (!isOpen) return null

  let itemIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 hidden sm:flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <svg
            className="mr-2 h-5 w-5 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="w-full border-0 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            aria-label="Search commands"
            autoComplete="off"
          />
          <kbd className="ml-2 hidden shrink-0 rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 sm:inline-block dark:border-gray-600">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto p-2" role="listbox" aria-label="Commands">
          {/* Recent commands */}
          {recentCommands.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Recent
              </div>
              {recentCommands.map((cmd) => {
                const currentIndex = itemIndex++
                return (
                  <CommandItem
                    key={`recent-${cmd.id}`}
                    command={cmd}
                    isSelected={selectedIndex === currentIndex}
                    onSelect={() => executeCommand(cmd)}
                  />
                )
              })}
            </div>
          )}

          {/* Grouped commands */}
          {(['navigation', 'action', 'settings'] as const).map((category) => {
            const group = grouped[category]
            if (!group || group.length === 0) return null
            return (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {CATEGORY_LABELS[category]}
                </div>
                {group.map((cmd) => {
                  const currentIndex = itemIndex++
                  return (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={selectedIndex === currentIndex}
                      onSelect={() => executeCommand(cmd)}
                    />
                  )
                })}
              </div>
            )
          })}

          {/* Empty state */}
          {flatList.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- CommandItem ---

interface CommandItemProps {
  command: Command
  isSelected: boolean
  onSelect: () => void
}

function CommandItem({ command, isSelected, onSelect }: CommandItemProps) {
  return (
    <div
      data-command-item
      role="option"
      aria-selected={isSelected}
      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${
        isSelected
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      <span className="truncate">{command.label}</span>
      {command.shortcut && (
        <kbd className="ml-2 shrink-0 rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 dark:border-gray-600">
          {command.shortcut}
        </kbd>
      )}
    </div>
  )
}

// --- Provider ---

interface CommandPaletteProviderProps {
  children: ReactNode
  defaultCommands?: Command[]
}

export function CommandPaletteProvider({ children, defaultCommands = [] }: CommandPaletteProviderProps) {
  const palette = useCommandPalette()

  // Register default commands on mount
  useEffect(() => {
    for (const cmd of defaultCommands) {
      palette.registerCommand(cmd)
    }
    return () => {
      for (const cmd of defaultCommands) {
        palette.unregisterCommand(cmd.id)
      }
    }
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        palette.toggle()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [palette.toggle])

  return (
    <CommandPaletteContext.Provider value={palette}>
      {children}
      <CommandPalette commands={palette.commands} isOpen={palette.isOpen} onClose={palette.close} />
    </CommandPaletteContext.Provider>
  )
}

export type { Command, CommandPaletteProps }
