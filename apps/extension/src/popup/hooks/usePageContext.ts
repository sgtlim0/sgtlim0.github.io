import { useState, useEffect, useCallback } from 'react'
import type { PageContext } from '../../types/context'
import { getStoredContext, clearStoredContext } from '../../utils/storage'

// Dev mock context for testing without chrome.storage
const DEV_MOCK_CONTEXT: PageContext = {
  text: 'This is a sample page context for development. Lorem ipsum dolor sit amet, consectetur adipiscing elit. React 19 introduces new features like Actions and improved server components.',
  url: 'https://example.com/article',
  title: 'Sample Article - Development Mode',
  favicon: 'https://example.com/favicon.ico',
  timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
  sanitized: true,
}

export interface UsePageContextReturn {
  context: PageContext | null
  isLoading: boolean
  error: Error | null
  clearContext: () => Promise<void>
  refreshContext: () => Promise<void>
}

function isDevelopment(): boolean {
  return typeof chrome === 'undefined' || !chrome?.storage?.local
}

export function usePageContext(): UsePageContextReturn {
  const [context, setContext] = useState<PageContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadContext = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (isDevelopment()) {
        // Dev mode: use mock context
        setContext(DEV_MOCK_CONTEXT)
      } else {
        // Production: load from storage
        const stored = await getStoredContext()
        setContext(stored)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load context'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContext()

    if (isDevelopment()) {
      return
    }

    // Listen for storage changes
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === 'local' && changes.hchat_context) {
        const newContext = changes.hchat_context.newValue as PageContext | undefined
        setContext(newContext || null)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [loadContext])

  const clearContext = useCallback(async () => {
    try {
      setError(null)
      if (isDevelopment()) {
        setContext(null)
      } else {
        await clearStoredContext()
        setContext(null)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear context')
      setError(error)
      throw error
    }
  }, [])

  const refreshContext = useCallback(async () => {
    await loadContext()
  }, [loadContext])

  return {
    context,
    isLoading,
    error,
    clearContext,
    refreshContext,
  }
}
