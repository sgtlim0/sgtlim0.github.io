'use client'

import { useState, useCallback, useMemo, useId, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface UseSelectConfig {
  searchable?: boolean
  multiple?: boolean
  placeholder?: string
  onChange?: (value: string | string[]) => void
}

export interface UseSelectReturn {
  isOpen: boolean
  selectedValue: string | string[]
  searchQuery: string
  filteredOptions: SelectOption[]
  highlightedIndex: number
  open: () => void
  close: () => void
  select: (value: string) => void
  setSearchQuery: (q: string) => void
  clear: () => void
  inputProps: Record<string, unknown>
  listProps: Record<string, unknown>
  getOptionProps: (index: number) => Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getNextEnabledIndex(
  options: SelectOption[],
  current: number,
  direction: 1 | -1,
): number {
  const len = options.length
  if (len === 0) return -1

  let next = current
  for (let i = 0; i < len; i++) {
    next = (next + direction + len) % len
    if (!options[next].disabled) return next
  }
  return -1
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSelect(
  options: SelectOption[],
  config: UseSelectConfig = {},
): UseSelectReturn {
  const { searchable = false, multiple = false, onChange } = config

  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSingle, setSelectedSingle] = useState('')
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([])
  const [searchQuery, setSearchQueryState] = useState('')
  const [highlightedIndex, setHighlightedIndexState] = useState(-1)
  const highlightedIndexRef = useRef(-1)

  const setHighlightedIndex = useCallback((update: number | ((prev: number) => number)) => {
    setHighlightedIndexState((prev) => {
      const next = typeof update === 'function' ? update(prev) : update
      highlightedIndexRef.current = next
      return next
    })
  }, [])

  const selectedValue: string | string[] = multiple
    ? selectedMultiple
    : selectedSingle

  // --- Filtered options ---

  const filteredOptions = useMemo(() => {
    if (!searchable || searchQuery === '') return options
    const q = searchQuery.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, searchQuery, searchable])

  // --- Actions ---

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightedIndex(-1)
    setSearchQueryState('')
  }, [])

  const select = useCallback(
    (value: string) => {
      const opt = options.find((o) => o.value === value)
      if (!opt || opt.disabled) return

      if (multiple) {
        setSelectedMultiple((prev) => {
          const next = prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value]
          onChange?.(next)
          return next
        })
        // Stay open in multiple mode
      } else {
        setSelectedSingle(value)
        onChange?.(value)
        setIsOpen(false)
        setHighlightedIndex(-1)
        setSearchQueryState('')
      }
    },
    [options, multiple, onChange],
  )

  const clear = useCallback(() => {
    if (multiple) {
      setSelectedMultiple([])
      onChange?.([] as string[])
    } else {
      setSelectedSingle('')
      onChange?.('')
    }
  }, [multiple, onChange])

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q)
    setHighlightedIndex(-1)
  }, [])

  // --- Keyboard handler ---

  const handleKeyDown = useCallback(
    (e: { key: string; preventDefault: () => void }) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
            setHighlightedIndex((prev) =>
              getNextEnabledIndex(filteredOptions, prev, 1),
            )
          } else {
            setHighlightedIndex((prev) =>
              getNextEnabledIndex(filteredOptions, prev, 1),
            )
          }
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (isOpen) {
            setHighlightedIndex((prev) =>
              getNextEnabledIndex(filteredOptions, prev, -1),
            )
          }
          break
        }
        case 'Enter': {
          e.preventDefault()
          const currentHighlight = highlightedIndexRef.current
          if (isOpen && currentHighlight >= 0) {
            const opt = filteredOptions[currentHighlight]
            if (opt && !opt.disabled) {
              select(opt.value)
            }
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          close()
          break
        }
        default:
          break
      }
    },
    [isOpen, filteredOptions, select, close],
  )

  // --- Props ---

  const activeDescendant =
    highlightedIndex >= 0 ? `select-option-${highlightedIndex}` : undefined

  const inputProps: Record<string, unknown> = useMemo(
    () => ({
      role: 'combobox' as const,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox' as const,
      'aria-controls': `${id}-listbox`,
      'aria-activedescendant': activeDescendant,
      onKeyDown: handleKeyDown,
    }),
    [isOpen, id, activeDescendant, handleKeyDown],
  )

  const listProps: Record<string, unknown> = useMemo(
    () => ({
      role: 'listbox' as const,
      id: `${id}-listbox`,
      'aria-multiselectable': multiple || undefined,
    }),
    [id, multiple],
  )

  const getOptionProps = useCallback(
    (index: number): Record<string, unknown> => {
      const opt = filteredOptions[index]
      if (!opt) return { role: 'option' }

      const isSelected = multiple
        ? selectedMultiple.includes(opt.value)
        : selectedSingle === opt.value

      return {
        role: 'option' as const,
        id: `select-option-${index}`,
        'aria-selected': isSelected,
        'aria-disabled': opt.disabled || undefined,
        'data-highlighted': highlightedIndex === index || undefined,
        onClick: () => select(opt.value),
      }
    },
    [
      filteredOptions,
      multiple,
      selectedMultiple,
      selectedSingle,
      highlightedIndex,
      select,
    ],
  )

  return {
    isOpen,
    selectedValue,
    searchQuery,
    filteredOptions,
    highlightedIndex,
    open,
    close,
    select,
    setSearchQuery,
    clear,
    inputProps,
    listProps,
    getOptionProps,
  }
}
