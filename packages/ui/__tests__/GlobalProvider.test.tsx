import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

// Mock all providers before importing GlobalProvider
vi.mock('../src/ThemeProvider', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}))

vi.mock('../src/utils/FeatureFlagProvider', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="feature-flag-provider">{children}</div>
  ),
}))

vi.mock('../src/utils/AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="analytics-provider">{children}</div>
  ),
}))

vi.mock('../src/ToastQueueProvider', () => ({
  ToastQueueProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}))

vi.mock('../src/hooks/ModalProvider', () => ({
  ModalProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="modal-provider">{children}</div>
  ),
}))

vi.mock('../src/hooks/HotkeyProvider', () => ({
  HotkeyProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="hotkey-provider">{children}</div>
  ),
}))

vi.mock('../src/hooks/EventBusProvider', () => ({
  EventBusProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="eventbus-provider">{children}</div>
  ),
}))

vi.mock('../src/hooks/QueryProvider', () => ({
  QueryProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}))

import { GlobalProvider, useGlobalContext } from '../src/GlobalProvider'

describe('GlobalProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(
      <GlobalProvider>
        <div data-testid="child">Hello</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('always renders ThemeProvider', () => {
    render(
      <GlobalProvider>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('renders all providers by default', () => {
    render(
      <GlobalProvider>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('feature-flag-provider')).toBeInTheDocument()
    expect(screen.getByTestId('analytics-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
    expect(screen.getByTestId('modal-provider')).toBeInTheDocument()
    expect(screen.getByTestId('hotkey-provider')).toBeInTheDocument()
    expect(screen.getByTestId('eventbus-provider')).toBeInTheDocument()
    expect(screen.getByTestId('query-provider')).toBeInTheDocument()
  })

  it('disables FeatureFlagProvider when featureFlags=false', () => {
    render(
      <GlobalProvider featureFlags={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('feature-flag-provider')).not.toBeInTheDocument()
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('disables AnalyticsProvider when analytics.enabled=false', () => {
    render(
      <GlobalProvider analytics={{ enabled: false }}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('analytics-provider')).not.toBeInTheDocument()
  })

  it('disables ToastQueueProvider when toasts=false', () => {
    render(
      <GlobalProvider toasts={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('toast-provider')).not.toBeInTheDocument()
  })

  it('disables ModalProvider when modals=false', () => {
    render(
      <GlobalProvider modals={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('modal-provider')).not.toBeInTheDocument()
  })

  it('disables HotkeyProvider when hotkeys=false', () => {
    render(
      <GlobalProvider hotkeys={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('hotkey-provider')).not.toBeInTheDocument()
  })

  it('disables EventBusProvider when eventBus=false', () => {
    render(
      <GlobalProvider eventBus={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('eventbus-provider')).not.toBeInTheDocument()
  })

  it('disables QueryProvider when query=false', () => {
    render(
      <GlobalProvider query={false}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.queryByTestId('query-provider')).not.toBeInTheDocument()
  })

  it('disables all optional providers', () => {
    render(
      <GlobalProvider
        featureFlags={false}
        analytics={{ enabled: false }}
        toasts={false}
        modals={false}
        hotkeys={false}
        eventBus={false}
        query={false}
      >
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-flag-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('analytics-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('toast-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hotkey-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('eventbus-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('query-provider')).not.toBeInTheDocument()
  })

  it('enables subset of providers', () => {
    render(
      <GlobalProvider
        featureFlags={false}
        analytics={{ enabled: false }}
        toasts={true}
        modals={true}
        hotkeys={false}
        eventBus={false}
        query={false}
      >
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
    expect(screen.getByTestId('modal-provider')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-flag-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('analytics-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hotkey-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('eventbus-provider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('query-provider')).not.toBeInTheDocument()
  })

  it('accepts theme config without error', () => {
    render(
      <GlobalProvider theme={{ defaultTheme: 'dark' }}>
        <div>App</div>
      </GlobalProvider>,
    )
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })
})

describe('useGlobalContext', () => {
  it('returns default values (all enabled) when used within GlobalProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GlobalProvider>{children}</GlobalProvider>
    )

    const { result } = renderHook(() => useGlobalContext(), { wrapper })

    expect(result.current.analytics).toBe(true)
    expect(result.current.featureFlags).toBe(true)
    expect(result.current.hotkeys).toBe(true)
    expect(result.current.toasts).toBe(true)
    expect(result.current.modals).toBe(true)
    expect(result.current.eventBus).toBe(true)
    expect(result.current.query).toBe(true)
  })

  it('reflects disabled providers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GlobalProvider
        analytics={{ enabled: false }}
        featureFlags={false}
        hotkeys={false}
      >
        {children}
      </GlobalProvider>
    )

    const { result } = renderHook(() => useGlobalContext(), { wrapper })

    expect(result.current.analytics).toBe(false)
    expect(result.current.featureFlags).toBe(false)
    expect(result.current.hotkeys).toBe(false)
    expect(result.current.toasts).toBe(true)
    expect(result.current.modals).toBe(true)
    expect(result.current.eventBus).toBe(true)
    expect(result.current.query).toBe(true)
  })

  it('returns defaults when used outside GlobalProvider', () => {
    const { result } = renderHook(() => useGlobalContext())

    expect(result.current.analytics).toBe(true)
    expect(result.current.featureFlags).toBe(true)
    expect(result.current.hotkeys).toBe(true)
    expect(result.current.toasts).toBe(true)
    expect(result.current.modals).toBe(true)
    expect(result.current.eventBus).toBe(true)
    expect(result.current.query).toBe(true)
  })
})
