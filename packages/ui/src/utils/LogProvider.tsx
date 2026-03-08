'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createLogger, type Logger } from './logger'

interface LogProviderContextValue {
  getLogger: (context?: string) => Logger
}

const LogProviderContext = createContext<LogProviderContextValue>({
  getLogger: (context?: string) => createLogger(context ?? 'app'),
})

interface LogProviderProps {
  /** Default context name used when useLogger is called without arguments. */
  defaultContext?: string
  children: ReactNode
}

/**
 * React Context provider for structured logging.
 * Wraps the application to make loggers available via useLogger hook.
 *
 * @example
 * ```tsx
 * <LogProvider defaultContext="MyApp">
 *   <App />
 * </LogProvider>
 * ```
 */
export function LogProvider({ defaultContext = 'app', children }: LogProviderProps) {
  const value = useMemo<LogProviderContextValue>(
    () => ({
      getLogger: (context?: string) => createLogger(context ?? defaultContext),
    }),
    [defaultContext],
  )

  return <LogProviderContext.Provider value={value}>{children}</LogProviderContext.Provider>
}

/**
 * Hook to obtain a Logger instance from the nearest LogProvider.
 * @param context - Optional context name; falls back to the provider's defaultContext
 * @returns Logger instance bound to the given context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const log = useLogger('MyComponent')
 *   log.info('Component mounted')
 * }
 * ```
 */
export function useLogger(context?: string): Logger {
  const { getLogger } = useContext(LogProviderContext)
  return useMemo(() => getLogger(context), [getLogger, context])
}
