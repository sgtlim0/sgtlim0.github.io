import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

// We need to mock getSnapshot to return a stable reference, otherwise
// useSyncExternalStore causes infinite re-renders (the real getSnapshot
// creates a new object each call).
const stableSnapshot: Record<string, boolean> = {
  'chat.streaming': true,
  'roi.simulator': true,
  'desktop.swarm': false,
  'user.research': true,
}

vi.mock('../src/utils/featureFlags', async () => {
  const actual = await vi.importActual<typeof import('../src/utils/featureFlags')>(
    '../src/utils/featureFlags',
  )
  return {
    ...actual,
    getSnapshot: vi.fn(() => stableSnapshot),
    getServerSnapshot: vi.fn(() => stableSnapshot),
  }
})

import FeatureFlagProvider, {
  useFeatureFlag,
  useFeatureFlags,
  FeatureGate,
} from '../src/utils/FeatureFlagProvider'
import * as featureFlagsModule from '../src/utils/featureFlags'

describe('FeatureFlagProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children', () => {
    render(
      <FeatureFlagProvider>
        <div data-testid="child">Content</div>
      </FeatureFlagProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides isEnabled function via useFeatureFlags', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    )

    const { result } = renderHook(() => useFeatureFlags(), { wrapper })

    expect(typeof result.current.isEnabled).toBe('function')
    expect(typeof result.current.setFlag).toBe('function')
    expect(Array.isArray(result.current.flags)).toBe(true)
  })

  it('useFeatureFlag returns boolean for a flag', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    )

    const { result } = renderHook(() => useFeatureFlag('chat.streaming'), {
      wrapper,
    })

    expect(typeof result.current).toBe('boolean')
  })

  it('isEnabled returns true for enabled flags', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    )

    const { result } = renderHook(() => useFeatureFlags(), { wrapper })

    expect(result.current.isEnabled('chat.streaming')).toBe(true)
    expect(result.current.isEnabled('desktop.swarm')).toBe(false)
  })

  it('setFlag calls setFeatureFlag', () => {
    const setFeatureFlagSpy = vi.spyOn(featureFlagsModule, 'setFeatureFlag')

    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    )

    const { result } = renderHook(() => useFeatureFlags(), { wrapper })

    act(() => {
      result.current.setFlag('chat.streaming', false)
    })

    expect(setFeatureFlagSpy).toHaveBeenCalledWith('chat.streaming', false)
  })

  it('returns flags list', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    )

    const { result } = renderHook(() => useFeatureFlags(), { wrapper })

    expect(result.current.flags.length).toBeGreaterThanOrEqual(0)
  })

  describe('FeatureGate', () => {
    it('renders children when flag is enabled', () => {
      render(
        <FeatureFlagProvider>
          <FeatureGate flag="chat.streaming">
            <div data-testid="gated-content">Visible</div>
          </FeatureGate>
        </FeatureFlagProvider>,
      )

      expect(screen.getByTestId('gated-content')).toBeInTheDocument()
    })

    it('renders fallback when flag is disabled', () => {
      render(
        <FeatureFlagProvider>
          <FeatureGate flag="desktop.swarm" fallback={<div data-testid="fallback">Hidden</div>}>
            <div data-testid="gated-content">Visible</div>
          </FeatureGate>
        </FeatureFlagProvider>,
      )

      expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })

    it('renders nothing when flag is disabled and no fallback', () => {
      render(
        <FeatureFlagProvider>
          <FeatureGate flag="desktop.swarm">
            <div data-testid="gated-content">Visible</div>
          </FeatureGate>
        </FeatureFlagProvider>,
      )

      expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument()
    })

    it('renders nothing for unknown flag', () => {
      render(
        <FeatureFlagProvider>
          <FeatureGate flag="unknown.flag">
            <div data-testid="gated-content">Visible</div>
          </FeatureGate>
        </FeatureFlagProvider>,
      )

      expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument()
    })
  })

  describe('useFeatureFlag without provider', () => {
    it('returns false by default (from context default)', () => {
      const { result } = renderHook(() => useFeatureFlag('some.flag'))
      expect(result.current).toBe(false)
    })
  })

  describe('useFeatureFlags without provider', () => {
    it('returns default context values', () => {
      const { result } = renderHook(() => useFeatureFlags())
      expect(typeof result.current.isEnabled).toBe('function')
      expect(typeof result.current.setFlag).toBe('function')
      expect(result.current.isEnabled('any')).toBe(false)
      // setFlag should not throw
      result.current.setFlag('any', true)
    })
  })
})
