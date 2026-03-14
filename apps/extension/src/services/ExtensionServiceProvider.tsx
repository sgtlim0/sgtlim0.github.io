import React, { createContext, useContext, useMemo } from 'react'
import type { ExtensionChatService, ExtensionAnalyzeService } from './types'
import { createMockChatService, createMockAnalyzeService } from './mockExtensionService'
import { createRealChatService } from './extensionChatService'
import { createRealAnalyzeService } from './extensionAnalyzeService'

interface ExtensionServices {
  chat: ExtensionChatService
  analyze: ExtensionAnalyzeService
}

const ExtensionServicesContext = createContext<ExtensionServices | null>(null)

interface ExtensionServiceProviderProps {
  apiMode: 'mock' | 'real'
  children: React.ReactNode
}

export function ExtensionServiceProvider({ apiMode, children }: ExtensionServiceProviderProps) {
  const services = useMemo<ExtensionServices>(() => {
    if (apiMode === 'mock') {
      return {
        chat: createMockChatService(),
        analyze: createMockAnalyzeService(),
      }
    }
    return {
      chat: createRealChatService(),
      analyze: createRealAnalyzeService(),
    }
  }, [apiMode])

  return (
    <ExtensionServicesContext.Provider value={services}>
      {children}
    </ExtensionServicesContext.Provider>
  )
}

export function useExtensionServices(): ExtensionServices {
  const context = useContext(ExtensionServicesContext)
  if (!context) {
    throw new Error('useExtensionServices must be used within ExtensionServiceProvider')
  }
  return context
}
