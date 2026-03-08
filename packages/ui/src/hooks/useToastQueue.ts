'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  dismissible?: boolean
}

export type AddToastInput = Omit<ToastMessage, 'id'>

const MAX_TOASTS = 5
const DEFAULT_DURATION = 5000

let toastCounter = 0

function generateId(): string {
  toastCounter += 1
  return `toast-${Date.now()}-${toastCounter}`
}

export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const startTimer = useCallback((id: string, duration: number) => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      timersRef.current.delete(id)
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)

    timersRef.current.set(id, timer)
  }, [])

  const removeToast = useCallback((id: string) => {
    clearTimer(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [clearTimer])

  const addToast = useCallback((input: AddToastInput): string => {
    const id = generateId()
    const duration = input.duration ?? DEFAULT_DURATION
    const dismissible = input.dismissible ?? true

    const newToast: ToastMessage = {
      ...input,
      id,
      duration,
      dismissible,
    }

    setToasts((prev) => {
      const next = [...prev, newToast]
      if (next.length > MAX_TOASTS) {
        const removed = next.slice(0, next.length - MAX_TOASTS)
        for (const t of removed) {
          clearTimer(t.id)
        }
        return next.slice(next.length - MAX_TOASTS)
      }
      return next
    })

    if (duration > 0) {
      startTimer(id, duration)
    }

    return id
  }, [clearTimer, startTimer])

  const clearAll = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer)
    }
    timersRef.current.clear()
    setToasts([])
  }, [])

  const pauseTimer = useCallback((id: string) => {
    clearTimer(id)
  }, [clearTimer])

  const resumeTimer = useCallback((id: string, remainingMs: number) => {
    if (remainingMs > 0) {
      startTimer(id, remainingMs)
    }
  }, [startTimer])

  useEffect(() => {
    const currentTimers = timersRef.current
    return () => {
      for (const timer of currentTimers.values()) {
        clearTimeout(timer)
      }
      currentTimers.clear()
    }
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    pauseTimer,
    resumeTimer,
  } as const
}
