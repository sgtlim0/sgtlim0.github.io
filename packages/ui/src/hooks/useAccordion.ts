'use client'

import { useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseAccordionOptions {
  allowMultiple?: boolean
  defaultOpen?: string[]
}

export interface UseAccordionReturn {
  openItems: Set<string>
  toggle: (id: string) => void
  open: (id: string) => void
  close: (id: string) => void
  isOpen: (id: string) => boolean
  closeAll: () => void
  openAll: (ids: string[]) => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAccordion(
  options: UseAccordionOptions = {},
): UseAccordionReturn {
  const { allowMultiple = false, defaultOpen = [] } = options

  const [openItems, setOpenItems] = useState<Set<string>>(
    () => new Set(defaultOpen),
  )

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (!allowMultiple) {
            return new Set([id])
          }
          next.add(id)
        }
        return next
      })
    },
    [allowMultiple],
  )

  const open = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        if (prev.has(id)) return prev
        if (!allowMultiple) {
          return new Set([id])
        }
        const next = new Set(prev)
        next.add(id)
        return next
      })
    },
    [allowMultiple],
  )

  const close = useCallback((id: string) => {
    setOpenItems((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const isOpen = useCallback(
    (id: string) => openItems.has(id),
    [openItems],
  )

  const closeAll = useCallback(() => {
    setOpenItems((prev) => (prev.size === 0 ? prev : new Set()))
  }, [])

  const openAll = useCallback(
    (ids: string[]) => {
      if (!allowMultiple && ids.length > 0) {
        setOpenItems(new Set([ids[0]]))
        return
      }
      setOpenItems(new Set(ids))
    },
    [allowMultiple],
  )

  return {
    openItems,
    toggle,
    open,
    close,
    isOpen,
    closeAll,
    openAll,
  }
}
