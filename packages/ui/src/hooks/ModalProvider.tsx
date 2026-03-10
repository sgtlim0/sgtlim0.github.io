'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useModalManager, type UseModalManagerReturn } from './useModalManager'

const ModalContext = createContext<UseModalManagerReturn | null>(null)

export interface ModalProviderProps {
  readonly children: ReactNode
}

/**
 * Provides a global modal stack manager via React context.
 *
 * @example
 * ```tsx
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 * ```
 */
export function ModalProvider({ children }: ModalProviderProps) {
  const manager = useModalManager()
  return <ModalContext.Provider value={manager}>{children}</ModalContext.Provider>
}

/**
 * Access the global modal manager from any component inside a ModalProvider.
 * Throws if used outside ModalProvider.
 */
export function useModalContext(): UseModalManagerReturn {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('useModalContext must be used within a <ModalProvider>')
  }
  return ctx
}
