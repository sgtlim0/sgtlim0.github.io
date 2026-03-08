'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { copyToClipboard } from '../utils/clipboard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseClipboardOptions {
  /** How long (ms) the `copied` flag stays true after a successful copy (default 2000) */
  timeout?: number
}

export interface UseClipboardReturn {
  /** Copy text to clipboard. Resolves `true` on success, `false` on failure. */
  copy: (text: string) => Promise<boolean>
  /** Whether the last copy succeeded (resets after `timeout` ms) */
  copied: boolean
  /** The error from the last failed copy, or null */
  error: Error | null
  /** Manually reset `copied` and `error` state */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options

  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Clear any previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      try {
        const success = await copyToClipboard(text)
        if (success) {
          setCopied(true)
          setError(null)
          timerRef.current = setTimeout(() => {
            setCopied(false)
          }, timeout)
          return true
        }
        const err = new Error('Copy failed')
        setCopied(false)
        setError(err)
        return false
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Copy failed')
        setCopied(false)
        setError(err)
        return false
      }
    },
    [timeout],
  )

  return { copy, copied, error, reset }
}
