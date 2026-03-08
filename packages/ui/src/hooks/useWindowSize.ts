'use client'

import { useState, useEffect, useRef } from 'react'

interface WindowSize {
  width: number
  height: number
}

const SSR_DEFAULT: WindowSize = { width: 1024, height: 768 }
const DEBOUNCE_MS = 100

/**
 * Tracks window dimensions with debounced resize handling.
 * SSR-safe: returns 1024x768 on the server.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => {
    if (typeof window === 'undefined') return SSR_DEFAULT
    return { width: window.innerWidth, height: window.innerHeight }
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight })
        timerRef.current = null
      }, DEBOUNCE_MS)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return size
}
