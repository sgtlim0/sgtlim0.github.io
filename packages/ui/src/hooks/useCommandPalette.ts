'use client'

import { useState, useCallback } from 'react'

export interface Command {
  id: string
  label: string
  category: 'navigation' | 'action' | 'settings'
  shortcut?: string
  icon?: string
  handler: () => void
}

interface UseCommandPaletteReturn {
  commands: Command[]
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
}

export function useCommandPalette(): UseCommandPaletteReturn {
  const [commands, setCommands] = useState<Command[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => {
      if (prev.some((c) => c.id === command.id)) {
        return prev.map((c) => (c.id === command.id ? command : c))
      }
      return [...prev, command]
    })
  }, [])

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    commands,
    isOpen,
    open,
    close,
    toggle,
    registerCommand,
    unregisterCommand,
  }
}
