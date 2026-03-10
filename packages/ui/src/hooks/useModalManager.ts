'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

export interface UseModalManagerReturn {
  /** Currently open modal IDs (stack order: first = bottom, last = top) */
  readonly stack: readonly string[]
  /** Push a modal onto the stack */
  readonly openModal: (id: string) => void
  /** Remove a modal from the stack */
  readonly closeModal: (id: string) => void
  /** Close all modals */
  readonly closeAll: () => void
  /** Get the topmost modal ID, or null if no modals are open */
  readonly getTopModal: () => string | null
  /** Check whether the given modal is the topmost */
  readonly isTopModal: (id: string) => boolean
}

/**
 * Manages a stack of modals. Pressing Escape closes only the topmost modal.
 *
 * @example
 * ```tsx
 * const { stack, openModal, closeModal, isTopModal } = useModalManager()
 * ```
 */
export function useModalManager(): UseModalManagerReturn {
  const [stack, setStack] = useState<readonly string[]>([])

  const openModal = useCallback((id: string) => {
    setStack((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const closeModal = useCallback((id: string) => {
    setStack((prev) => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }, [])

  const closeAll = useCallback(() => {
    setStack([])
  }, [])

  const getTopModal = useCallback((): string | null => {
    return stack.length > 0 ? stack[stack.length - 1] : null
  }, [stack])

  const isTopModal = useCallback(
    (id: string): boolean => {
      return stack.length > 0 && stack[stack.length - 1] === id
    },
    [stack],
  )

  // Escape closes topmost modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack.length > 0) {
        e.stopPropagation()
        const topId = stack[stack.length - 1]
        setStack((prev) => prev.slice(0, -1))
        // We intentionally close via setStack to avoid stale closure from closeModal
        void topId
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stack])

  return useMemo(
    () => ({ stack, openModal, closeModal, closeAll, getTopModal, isTopModal }),
    [stack, openModal, closeModal, closeAll, getTopModal, isTopModal],
  )
}
