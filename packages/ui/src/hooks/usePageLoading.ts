'use client'

import { useState, useRef, useCallback } from 'react'

export interface UsePageLoadingOptions {
  /** Minimum display time in ms to prevent flicker (default: 300) */
  minDisplayTime?: number
  /** Initial loading state (default: false) */
  initialLoading?: boolean
}

export interface UsePageLoadingReturn {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

export function usePageLoading(
  options: UsePageLoadingOptions = {}
): UsePageLoadingReturn {
  const { minDisplayTime = 300, initialLoading = false } = options
  const [isLoading, setIsLoading] = useState(initialLoading)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startTimeRef.current = Date.now()
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current
    const remaining = minDisplayTime - elapsed

    if (remaining > 0) {
      timerRef.current = setTimeout(() => {
        setIsLoading(false)
        timerRef.current = null
      }, remaining)
    } else {
      setIsLoading(false)
    }
  }, [minDisplayTime])

  return { isLoading, startLoading, stopLoading }
}
