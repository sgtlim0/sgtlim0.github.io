'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ExtensionPageContext {
  text: string
  url: string
  title: string
}

export interface UseExtensionContextReturn {
  extensionContext: ExtensionPageContext | null
  hasExtension: boolean
  clearContext: () => void
}

/**
 * Hook to receive page context from H Chat Chrome Extension.
 * Listens for postMessage events from the extension content script.
 * Falls back to checking URL search params for extension-injected context.
 */
export function useExtensionContext(): UseExtensionContextReturn {
  const [extensionContext, setExtensionContext] = useState<ExtensionPageContext | null>(null)
  const [hasExtension, setHasExtension] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check URL params for extension-injected context
    const params = new URLSearchParams(window.location.search)
    const extText = params.get('ext_text')
    const extUrl = params.get('ext_url')
    const extTitle = params.get('ext_title')

    if (extText) {
      setExtensionContext({
        text: decodeURIComponent(extText),
        url: extUrl ? decodeURIComponent(extUrl) : '',
        title: extTitle ? decodeURIComponent(extTitle) : '',
      })
      setHasExtension(true)
      // Clean URL params without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('ext_text')
      url.searchParams.delete('ext_url')
      url.searchParams.delete('ext_title')
      window.history.replaceState({}, '', url.toString())
      return
    }

    // Listen for postMessage from extension
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'HCHAT_EXTENSION_CONTEXT' && event.data?.payload) {
        const { text, url, title } = event.data.payload as ExtensionPageContext
        if (text) {
          setExtensionContext({ text, url: url || '', title: title || '' })
          setHasExtension(true)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const clearContext = useCallback(() => {
    setExtensionContext(null)
  }, [])

  return { extensionContext, hasExtension, clearContext }
}
