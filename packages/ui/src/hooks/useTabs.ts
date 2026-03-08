'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabConfig {
  id: string
  label: string
  disabled?: boolean
  icon?: ReactNode
}

export interface UseTabsOptions {
  defaultTab?: string
  onChange?: (tabId: string) => void
}

export interface UseTabsReturn {
  activeTab: string
  setActiveTab: (id: string) => void
  tabListProps: Record<string, unknown>
  getTabProps: (id: string) => Record<string, unknown>
  getPanelProps: (id: string) => Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEnabledTabs(tabs: TabConfig[]): TabConfig[] {
  return tabs.filter((t) => !t.disabled)
}

function findNextEnabledTab(
  tabs: TabConfig[],
  currentId: string,
  direction: 1 | -1,
): TabConfig | undefined {
  const enabled = getEnabledTabs(tabs)
  if (enabled.length === 0) return undefined

  const currentIndex = enabled.findIndex((t) => t.id === currentId)
  if (currentIndex === -1) return enabled[0]

  const nextIndex =
    (currentIndex + direction + enabled.length) % enabled.length
  return enabled[nextIndex]
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTabs(
  tabs: TabConfig[],
  options: UseTabsOptions = {},
): UseTabsReturn {
  const { defaultTab, onChange } = options

  const resolvedDefault = useMemo(() => {
    if (defaultTab && tabs.some((t) => t.id === defaultTab && !t.disabled)) {
      return defaultTab
    }
    const firstEnabled = getEnabledTabs(tabs)[0]
    return firstEnabled?.id ?? tabs[0]?.id ?? ''
  }, [defaultTab, tabs])

  const [activeTab, setActiveTabState] = useState(resolvedDefault)
  const tabListRef = useRef<HTMLDivElement | null>(null)

  const setActiveTab = useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id)
      if (!tab || tab.disabled) return

      setActiveTabState(id)
      onChange?.(id)
    },
    [tabs, onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next: TabConfig | undefined

      switch (e.key) {
        case 'ArrowRight':
          next = findNextEnabledTab(tabs, activeTab, 1)
          break
        case 'ArrowLeft':
          next = findNextEnabledTab(tabs, activeTab, -1)
          break
        case 'Home': {
          const enabled = getEnabledTabs(tabs)
          next = enabled[0]
          break
        }
        case 'End': {
          const enabled = getEnabledTabs(tabs)
          next = enabled[enabled.length - 1]
          break
        }
        default:
          return
      }

      if (next) {
        e.preventDefault()
        setActiveTab(next.id)

        // Focus the tab button
        const container = tabListRef.current
        if (container) {
          const button = container.querySelector(
            `[data-tab-id="${next.id}"]`,
          ) as HTMLElement | null
          button?.focus()
        }
      }
    },
    [tabs, activeTab, setActiveTab],
  )

  const tabListProps: Record<string, unknown> = useMemo(
    () => ({
      role: 'tablist',
      'aria-orientation': 'horizontal',
      onKeyDown: handleKeyDown,
      ref: tabListRef,
    }),
    [handleKeyDown],
  )

  const getTabProps = useCallback(
    (id: string): Record<string, unknown> => {
      const tab = tabs.find((t) => t.id === id)
      const isActive = activeTab === id
      const isDisabled = tab?.disabled ?? false

      return {
        role: 'tab',
        id: `tab-${id}`,
        'aria-selected': isActive,
        'aria-controls': `panel-${id}`,
        'aria-disabled': isDisabled || undefined,
        tabIndex: isActive ? 0 : -1,
        'data-tab-id': id,
        onClick: () => {
          if (!isDisabled) {
            setActiveTab(id)
          }
        },
      }
    },
    [tabs, activeTab, setActiveTab],
  )

  const getPanelProps = useCallback(
    (id: string): Record<string, unknown> => {
      const isActive = activeTab === id

      return {
        role: 'tabpanel',
        id: `panel-${id}`,
        'aria-labelledby': `tab-${id}`,
        hidden: !isActive,
        tabIndex: 0,
      }
    },
    [activeTab],
  )

  return {
    activeTab,
    setActiveTab,
    tabListProps,
    getTabProps,
    getPanelProps,
  }
}
