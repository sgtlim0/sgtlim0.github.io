'use client'

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react'
import {
  isFeatureEnabled,
  setFeatureFlag,
  getFeatureFlags,
  subscribe,
  getSnapshot,
  getServerSnapshot,
  type FeatureFlag,
} from './featureFlags'

interface FeatureFlagContextValue {
  isEnabled: (key: string) => boolean
  setFlag: (key: string, enabled: boolean) => void
  flags: FeatureFlag[]
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  isEnabled: () => false,
  setFlag: () => {},
  flags: [],
})

export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useContext(FeatureFlagContext)
  return isEnabled(key)
}

export function useFeatureFlags(): FeatureFlagContextValue {
  return useContext(FeatureFlagContext)
}

interface FeatureGateProps {
  flag: string
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag)
  return enabled ? <>{children}</> : <>{fallback ?? null}</>
}

export default function FeatureFlagProvider({
  children,
}: {
  children: ReactNode
}) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isEnabled = useCallback(
    (key: string): boolean => {
      return snapshot[key] ?? isFeatureEnabled(key)
    },
    [snapshot]
  )

  const setFlag = useCallback((key: string, enabled: boolean) => {
    setFeatureFlag(key, enabled)
  }, [])

  const flags = getFeatureFlags()

  return (
    <FeatureFlagContext.Provider value={{ isEnabled, setFlag, flags }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}
