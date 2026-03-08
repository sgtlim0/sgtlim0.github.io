'use client'

import React, { createContext, useContext } from 'react'
import { useToastQueue } from './hooks/useToastQueue'
import type { AddToastInput } from './hooks/useToastQueue'
import { ToastContainer } from './ToastContainer'

interface ToastQueueContextValue {
  addToast: (input: AddToastInput) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastQueueContext = createContext<ToastQueueContextValue | undefined>(undefined)

export function useToastQueue2() {
  const context = useContext(ToastQueueContext)
  if (!context) {
    throw new Error('useToastQueue2 must be used within ToastQueueProvider')
  }
  return context
}

interface ToastQueueProviderProps {
  children: React.ReactNode
}

export function ToastQueueProvider({ children }: ToastQueueProviderProps) {
  const { toasts, addToast, removeToast, clearAll, pauseTimer, resumeTimer } = useToastQueue()

  return (
    <ToastQueueContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        onPauseTimer={pauseTimer}
        onResumeTimer={resumeTimer}
      />
    </ToastQueueContext.Provider>
  )
}
