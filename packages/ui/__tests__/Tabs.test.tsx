import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTabs } from '../src/hooks/useTabs'
import type { TabConfig } from '../src/hooks/useTabs'
import { Tabs, TabPanel } from '../src/Tabs'

// ---------------------------------------------------------------------------
// useTabs hook tests
// ---------------------------------------------------------------------------

const sampleTabs: TabConfig[] = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2' },
  { id: 'tab3', label: 'Tab 3' },
]

const tabsWithDisabled: TabConfig[] = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2', disabled: true },
  { id: 'tab3', label: 'Tab 3' },
]

describe('useTabs', () => {
  it('defaults to the first tab', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    expect(result.current.activeTab).toBe('tab1')
  })

  it('uses defaultTab option when provided', () => {
    const { result } = renderHook(() =>
      useTabs(sampleTabs, { defaultTab: 'tab2' }),
    )
    expect(result.current.activeTab).toBe('tab2')
  })

  it('falls back to first enabled tab when defaultTab is disabled', () => {
    const { result } = renderHook(() =>
      useTabs(tabsWithDisabled, { defaultTab: 'tab2' }),
    )
    expect(result.current.activeTab).toBe('tab1')
  })

  it('switches tabs via setActiveTab', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))

    act(() => {
      result.current.setActiveTab('tab3')
    })

    expect(result.current.activeTab).toBe('tab3')
  })

  it('calls onChange when tab changes', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useTabs(sampleTabs, { onChange }),
    )

    act(() => {
      result.current.setActiveTab('tab2')
    })

    expect(onChange).toHaveBeenCalledWith('tab2')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('ignores setActiveTab for disabled tabs', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useTabs(tabsWithDisabled, { onChange }),
    )

    act(() => {
      result.current.setActiveTab('tab2')
    })

    expect(result.current.activeTab).toBe('tab1')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ignores setActiveTab for non-existent tabs', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))

    act(() => {
      result.current.setActiveTab('nonexistent')
    })

    expect(result.current.activeTab).toBe('tab1')
  })

  // --- tabListProps ---

  it('returns tabListProps with role=tablist', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    expect(result.current.tabListProps.role).toBe('tablist')
    expect(result.current.tabListProps['aria-orientation']).toBe('horizontal')
  })

  // --- getTabProps ---

  it('returns correct tab props for active tab', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    const props = result.current.getTabProps('tab1')

    expect(props.role).toBe('tab')
    expect(props['aria-selected']).toBe(true)
    expect(props['aria-controls']).toBe('panel-tab1')
    expect(props.tabIndex).toBe(0)
    expect(props.id).toBe('tab-tab1')
  })

  it('returns correct tab props for inactive tab', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    const props = result.current.getTabProps('tab2')

    expect(props['aria-selected']).toBe(false)
    expect(props.tabIndex).toBe(-1)
  })

  it('returns aria-disabled for disabled tab', () => {
    const { result } = renderHook(() => useTabs(tabsWithDisabled))
    const props = result.current.getTabProps('tab2')

    expect(props['aria-disabled']).toBe(true)
  })

  it('does not set aria-disabled on enabled tabs', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    const props = result.current.getTabProps('tab1')

    expect(props['aria-disabled']).toBeUndefined()
  })

  // --- getPanelProps ---

  it('returns correct panel props for active tab', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    const props = result.current.getPanelProps('tab1')

    expect(props.role).toBe('tabpanel')
    expect(props.id).toBe('panel-tab1')
    expect(props['aria-labelledby']).toBe('tab-tab1')
    expect(props.hidden).toBe(false)
    expect(props.tabIndex).toBe(0)
  })

  it('returns hidden=true for inactive panel', () => {
    const { result } = renderHook(() => useTabs(sampleTabs))
    const props = result.current.getPanelProps('tab2')

    expect(props.hidden).toBe(true)
  })

  // --- empty tabs ---

  it('handles empty tabs array', () => {
    const { result } = renderHook(() => useTabs([]))
    expect(result.current.activeTab).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Tabs component tests
// ---------------------------------------------------------------------------

describe('Tabs component', () => {
  it('renders all tab buttons', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('shows the first tab panel by default', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    expect(screen.getByText('Content 1')).toBeVisible()
  })

  it('shows the specified defaultTab panel', () => {
    render(
      <Tabs tabs={sampleTabs} defaultTab="tab2">
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('switches panels when clicking a tab', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    fireEvent.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('calls onChange when tab is clicked', () => {
    const onChange = vi.fn()

    render(
      <Tabs tabs={sampleTabs} onChange={onChange}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    fireEvent.click(screen.getByText('Tab 3'))
    expect(onChange).toHaveBeenCalledWith('tab3')
  })

  it('does not switch to a disabled tab on click', () => {
    const onChange = vi.fn()

    render(
      <Tabs tabs={tabsWithDisabled} onChange={onChange}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    fireEvent.click(screen.getByText('Tab 2'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Content 1')).toBeVisible()
  })

  // --- Keyboard navigation ---

  it('navigates to next tab with ArrowRight', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'ArrowRight' })

    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('navigates to previous tab with ArrowLeft', () => {
    render(
      <Tabs tabs={sampleTabs} defaultTab="tab2">
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'ArrowLeft' })

    expect(screen.getByText('Content 1')).toBeVisible()
  })

  it('wraps around from last to first with ArrowRight', () => {
    render(
      <Tabs tabs={sampleTabs} defaultTab="tab3">
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'ArrowRight' })

    expect(screen.getByText('Content 1')).toBeVisible()
  })

  it('wraps around from first to last with ArrowLeft', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'ArrowLeft' })

    expect(screen.getByText('Content 3')).toBeVisible()
  })

  it('skips disabled tabs with ArrowRight', () => {
    render(
      <Tabs tabs={tabsWithDisabled}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'ArrowRight' })

    // Should skip tab2 (disabled) and go to tab3
    expect(screen.getByText('Content 3')).toBeVisible()
  })

  it('navigates to first tab with Home key', () => {
    render(
      <Tabs tabs={sampleTabs} defaultTab="tab3">
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'Home' })

    expect(screen.getByText('Content 1')).toBeVisible()
  })

  it('navigates to last tab with End key', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    fireEvent.keyDown(tabList, { key: 'End' })

    expect(screen.getByText('Content 3')).toBeVisible()
  })

  // --- Accessibility ---

  it('has correct ARIA attributes on tablist', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const tabList = screen.getByRole('tablist')
    expect(tabList).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('marks active tab with aria-selected=true', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const allTabs = screen.getAllByRole('tab')
    expect(allTabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(allTabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('links tabs to panels via aria-controls / aria-labelledby', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const allTabs = screen.getAllByRole('tab')
    expect(allTabs[0]).toHaveAttribute('aria-controls', 'panel-tab1')

    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1')
  })

  it('sets tabIndex=0 on active tab and -1 on inactive tabs', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    const allTabs = screen.getAllByRole('tab')
    expect(allTabs[0]).toHaveAttribute('tabindex', '0')
    expect(allTabs[1]).toHaveAttribute('tabindex', '-1')
    expect(allTabs[2]).toHaveAttribute('tabindex', '-1')
  })

  // --- Variants ---

  it('renders with underline variant by default', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
      </Tabs>,
    )

    const tabList = container.querySelector('[role="tablist"]')
    expect(tabList?.className).toContain('border-b')
  })

  it('renders with pill variant', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} variant="pill">
        <TabPanel id="tab1">Content 1</TabPanel>
      </Tabs>,
    )

    const tabList = container.querySelector('[role="tablist"]')
    expect(tabList?.className).toContain('rounded-lg')
  })

  it('renders with bordered variant', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} variant="bordered">
        <TabPanel id="tab1">Content 1</TabPanel>
      </Tabs>,
    )

    const tabList = container.querySelector('[role="tablist"]')
    expect(tabList?.className).toContain('border-b')
  })

  // --- Lazy rendering ---

  it('renders all panels when lazy is false (default)', () => {
    render(
      <Tabs tabs={sampleTabs}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    // All content should be in the DOM even if hidden
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('only renders active panel when lazy is true', () => {
    render(
      <Tabs tabs={sampleTabs} lazy>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
        <TabPanel id="tab3">Content 3</TabPanel>
      </Tabs>,
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  // --- Tab with icon ---

  it('renders tab icons', () => {
    const tabsWithIcons: TabConfig[] = [
      { id: 'tab1', label: 'Tab 1', icon: <span data-testid="icon-1">*</span> },
      { id: 'tab2', label: 'Tab 2' },
    ]

    render(
      <Tabs tabs={tabsWithIcons}>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>,
    )

    expect(screen.getByTestId('icon-1')).toBeInTheDocument()
  })

  // --- className pass-through ---

  it('accepts className prop', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} className="custom-class">
        <TabPanel id="tab1">Content 1</TabPanel>
      </Tabs>,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
