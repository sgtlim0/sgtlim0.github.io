import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { AnalyticsProvider, useAnalyticsContext } from '../src/utils/AnalyticsProvider'
import * as analyticsModule from '../src/utils/analytics'
import type { ReactNode } from 'react'

vi.mock('../src/utils/analytics', async () => {
  const actual = await vi.importActual<typeof analyticsModule>('../src/utils/analytics')
  return {
    ...actual,
    registerProvider: vi.fn(),
    removeAllProviders: vi.fn(),
    setAnalyticsEnabled: vi.fn(),
    createConsoleProvider: vi.fn(() => ({
      name: 'console',
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
      trackTiming: vi.fn(),
    })),
    createNoopProvider: vi.fn(() => ({
      name: 'noop',
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
      trackTiming: vi.fn(),
    })),
  }
})

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children', () => {
    render(
      <AnalyticsProvider>
        <div data-testid="child">Content</div>
      </AnalyticsProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('sets analytics enabled by default', () => {
    render(
      <AnalyticsProvider>
        <div>App</div>
      </AnalyticsProvider>,
    )
    expect(analyticsModule.setAnalyticsEnabled).toHaveBeenCalledWith(true)
  })

  it('registers default console provider in development', () => {
    render(
      <AnalyticsProvider>
        <div>App</div>
      </AnalyticsProvider>,
    )
    expect(analyticsModule.registerProvider).toHaveBeenCalled()
  })

  it('sets analytics disabled when enabled=false', () => {
    render(
      <AnalyticsProvider enabled={false}>
        <div>App</div>
      </AnalyticsProvider>,
    )
    expect(analyticsModule.setAnalyticsEnabled).toHaveBeenCalledWith(false)
  })

  it('does not register providers when disabled', () => {
    render(
      <AnalyticsProvider enabled={false}>
        <div>App</div>
      </AnalyticsProvider>,
    )
    expect(analyticsModule.registerProvider).not.toHaveBeenCalled()
  })

  it('registers custom providers when provided', () => {
    const customProvider = {
      name: 'custom',
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
      trackTiming: vi.fn(),
    }

    render(
      <AnalyticsProvider providers={[customProvider]}>
        <div>App</div>
      </AnalyticsProvider>,
    )

    expect(analyticsModule.registerProvider).toHaveBeenCalledWith(customProvider)
  })

  it('removes all providers on unmount', () => {
    const { unmount } = render(
      <AnalyticsProvider>
        <div>App</div>
      </AnalyticsProvider>,
    )

    unmount()

    expect(analyticsModule.removeAllProviders).toHaveBeenCalled()
  })

  it('useAnalyticsContext returns analytics functions', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AnalyticsProvider>{children}</AnalyticsProvider>
    )

    const { result } = renderHook(() => useAnalyticsContext(), { wrapper })

    expect(typeof result.current.trackEvent).toBe('function')
    expect(typeof result.current.trackPageView).toBe('function')
    expect(typeof result.current.trackTiming).toBe('function')
  })

  it('useAnalyticsContext returns defaults without provider', () => {
    const { result } = renderHook(() => useAnalyticsContext())

    // Default context provides no-op functions
    expect(typeof result.current.trackEvent).toBe('function')
    // Should not throw when called
    result.current.trackEvent('test', {})
    result.current.trackPageView('/test')
    result.current.trackTiming('load', 100)
  })
})
