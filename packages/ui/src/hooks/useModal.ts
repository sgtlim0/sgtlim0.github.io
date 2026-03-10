'use client'

import { useState, useCallback } from 'react'

export interface UseModalReturn {
  /** Whether the modal is currently open */
  readonly isOpen: boolean
  /** Open the modal */
  readonly open: () => void
  /** Close the modal */
  readonly close: () => void
  /** Toggle modal open/close */
  readonly toggle: () => void
}

/**
 * Simple boolean toggle hook for a single modal.
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useModal()
 * return (
 *   <>
 *     <button onClick={open}>Open</button>
 *     <Modal isOpen={isOpen} onClose={close}>Content</Modal>
 *   </>
 * )
 * ```
 */
export function useModal(initialOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
