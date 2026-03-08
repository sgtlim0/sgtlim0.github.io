'use client'

import React, { Children, isValidElement, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useTabs } from './hooks/useTabs'
import type { TabConfig, UseTabsOptions } from './hooks/useTabs'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TabVariant = 'underline' | 'pill' | 'bordered'

export interface TabsProps {
  tabs: TabConfig[]
  defaultTab?: string
  variant?: TabVariant
  lazy?: boolean
  onChange?: (tabId: string) => void
  children: ReactNode
  className?: string
}

export interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const baseTabStyles =
  'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

const variantStyles: Record<
  TabVariant,
  { list: string; tab: string; active: string; inactive: string }
> = {
  underline: {
    list: 'flex border-b border-gray-200 dark:border-gray-700',
    tab: 'border-b-2 -mb-px',
    active: 'border-primary text-primary',
    inactive:
      'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
  },
  pill: {
    list: 'flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
    tab: 'rounded-md',
    active: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm',
    inactive:
      'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
  },
  bordered: {
    list: 'flex border-b border-gray-200 dark:border-gray-700',
    tab: 'border border-b-0 rounded-t-md -mb-px',
    active:
      'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
    inactive:
      'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
  },
}

const disabledStyles = 'opacity-40 cursor-not-allowed'

// ---------------------------------------------------------------------------
// TabPanel
// ---------------------------------------------------------------------------

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return <div className={className}>{children}</div>
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export function Tabs({
  tabs,
  defaultTab,
  variant = 'underline',
  lazy = false,
  onChange,
  children,
  className = '',
}: TabsProps) {
  const options: UseTabsOptions = useMemo(
    () => ({ defaultTab, onChange }),
    [defaultTab, onChange],
  )

  const { activeTab, tabListProps, getTabProps, getPanelProps } = useTabs(
    tabs,
    options,
  )

  const styles = variantStyles[variant]

  // Map children by id
  const panelMap = useMemo(() => {
    const map = new Map<string, ReactNode>()
    Children.forEach(children, (child) => {
      if (isValidElement(child) && typeof child.props === 'object' && child.props !== null && 'id' in child.props) {
        const props = child.props as { id: string }
        map.set(props.id, child)
      }
    })
    return map
  }, [children])

  // Track which tabs have been rendered (for lazy mode)
  const renderedTabs = useMemo(() => {
    const set = new Set<string>()
    set.add(activeTab)
    return set
  }, [activeTab])

  return (
    <div className={className}>
      {/* Tab list */}
      <div {...tabListProps} className={styles.list}>
        {tabs.map((tab) => {
          const tabProps = getTabProps(tab.id)
          const isActive = activeTab === tab.id
          const isDisabled = tab.disabled ?? false

          return (
            <button
              key={tab.id}
              {...tabProps}
              type="button"
              className={[
                baseTabStyles,
                styles.tab,
                isActive ? styles.active : styles.inactive,
                isDisabled ? disabledStyles : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => {
        const panelProps = getPanelProps(tab.id)
        const isActive = activeTab === tab.id
        const panel = panelMap.get(tab.id)

        // Lazy: only render if tab has been active at least once
        const shouldRender = lazy
          ? renderedTabs.has(tab.id) || isActive
          : true

        return (
          <div key={tab.id} {...panelProps}>
            {shouldRender ? panel : null}
          </div>
        )
      })}
    </div>
  )
}
