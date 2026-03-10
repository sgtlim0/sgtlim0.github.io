import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ReactNode } from 'react'

// Mock featureFlags getSnapshot to return stable reference (same as existing tests)
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

import ThemeProvider, { useTheme } from '../src/ThemeProvider'
import FeatureFlagProvider, { useFeatureFlags } from '../src/utils/FeatureFlagProvider'
import { AnalyticsProvider, useAnalyticsContext } from '../src/utils/AnalyticsProvider'
import { ToastQueueProvider, useToastQueue2 } from '../src/ToastQueueProvider'
import { ModalProvider, useModalContext } from '../src/hooks/ModalProvider'
import { HotkeyProvider, useHotkeyRegistryFromContext } from '../src/hooks/HotkeyProvider'

// ---------------------------------------------------------------------------
// Shared wrapper: all providers stacked
// ---------------------------------------------------------------------------

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <AnalyticsProvider enabled={false}>
          <ToastQueueProvider>
            <ModalProvider>
              <HotkeyProvider>
                {children}
              </HotkeyProvider>
            </ModalProvider>
          </ToastQueueProvider>
        </AnalyticsProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  )
}

function ReversedProviders({ children }: { children: ReactNode }) {
  return (
    <HotkeyProvider>
      <ModalProvider>
        <ToastQueueProvider>
          <AnalyticsProvider enabled={false}>
            <FeatureFlagProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </FeatureFlagProvider>
          </AnalyticsProvider>
        </ToastQueueProvider>
      </ModalProvider>
    </HotkeyProvider>
  )
}

// ---------------------------------------------------------------------------
// Consumer component that exercises every provider
// ---------------------------------------------------------------------------

function AllConsumer() {
  const { theme, toggleTheme } = useTheme()
  const { isEnabled, setFlag, flags } = useFeatureFlags()
  const { trackEvent } = useAnalyticsContext()
  const { addToast, clearAll } = useToastQueue2()
  const { stack, openModal, closeModal, closeAll: closeAllModals } = useModalContext()
  const hotkeys = useHotkeyRegistryFromContext()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="flag-streaming">{String(isEnabled('chat.streaming'))}</span>
      <span data-testid="flag-count">{flags.length}</span>
      <span data-testid="modal-count">{stack.length}</span>
      <span data-testid="hotkey-count">{hotkeys.length}</span>

      <button data-testid="toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="set-flag" onClick={() => setFlag('chat.streaming', false)}>Disable Streaming</button>
      <button data-testid="track" onClick={() => trackEvent('test', { foo: 'bar' })}>Track</button>
      <button data-testid="add-toast" onClick={() => addToast({ type: 'success', title: 'Done', duration: 0 })}>
        Add Toast
      </button>
      <button data-testid="clear-toasts" onClick={clearAll}>Clear Toasts</button>
      <button data-testid="open-modal" onClick={() => openModal('m1')}>Open Modal</button>
      <button data-testid="close-modal" onClick={() => closeModal('m1')}>Close Modal</button>
      <button data-testid="close-all-modals" onClick={closeAllModals}>Close All</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('Integration: Provider stack', () => {
  describe('all providers render together', () => {
    it('should render children with all providers stacked', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      expect(screen.getByTestId('theme').textContent).toBe('light')
      expect(screen.getByTestId('flag-streaming').textContent).toBe('true')
      expect(Number(screen.getByTestId('flag-count').textContent)).toBeGreaterThanOrEqual(4)
      expect(screen.getByTestId('modal-count').textContent).toBe('0')
      expect(screen.getByTestId('hotkey-count').textContent).toBe('0')
    })

    it('should render children with reversed provider order', () => {
      render(
        <ReversedProviders>
          <AllConsumer />
        </ReversedProviders>,
      )

      expect(screen.getByTestId('theme').textContent).toBe('light')
      expect(screen.getByTestId('flag-streaming').textContent).toBe('true')
      expect(Number(screen.getByTestId('flag-count').textContent)).toBeGreaterThanOrEqual(4)
    })
  })

  describe('cross-provider interactions', () => {
    it('should toggle theme while other providers remain functional', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })

      expect(screen.getByTestId('theme').textContent).toBe('dark')
      // Feature flags still accessible
      expect(screen.getByTestId('flag-streaming').textContent).toBe('true')
    })

    it('should update feature flags while modal and toast remain stable', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      // Open a modal first
      act(() => {
        fireEvent.click(screen.getByTestId('open-modal'))
      })
      expect(screen.getByTestId('modal-count').textContent).toBe('1')

      // Now change a feature flag
      act(() => {
        fireEvent.click(screen.getByTestId('set-flag'))
      })
      // Modal still open
      expect(screen.getByTestId('modal-count').textContent).toBe('1')
    })

    it('should add toast while modals and theme work', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('add-toast'))
      })

      // Toast rendered in the notification region
      expect(screen.getByRole('region', { name: 'Notifications' })).toBeDefined()
      expect(screen.getByText('Done')).toBeDefined()

      // Theme still toggleable
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    })

    it('should manage modal stack independently of other providers', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-modal'))
      })
      expect(screen.getByTestId('modal-count').textContent).toBe('1')

      act(() => {
        fireEvent.click(screen.getByTestId('close-modal'))
      })
      expect(screen.getByTestId('modal-count').textContent).toBe('0')
    })

    it('should fire analytics without affecting other providers', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      // Should not throw even though analytics is disabled
      expect(() => {
        act(() => {
          fireEvent.click(screen.getByTestId('track'))
        })
      }).not.toThrow()

      // Other providers still intact
      expect(screen.getByTestId('theme').textContent).toBe('light')
    })
  })

  describe('provider order independence', () => {
    it('should produce identical behavior regardless of provider order', () => {
      const { unmount: unmountA } = render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      const themeA = screen.getByTestId('theme').textContent
      const flagA = screen.getByTestId('flag-streaming').textContent
      const modalA = screen.getByTestId('modal-count').textContent
      const hotkeyA = screen.getByTestId('hotkey-count').textContent
      unmountA()

      localStorage.clear()

      render(
        <ReversedProviders>
          <AllConsumer />
        </ReversedProviders>,
      )

      expect(screen.getByTestId('theme').textContent).toBe(themeA)
      expect(screen.getByTestId('flag-streaming').textContent).toBe(flagA)
      expect(screen.getByTestId('modal-count').textContent).toBe(modalA)
      expect(screen.getByTestId('hotkey-count').textContent).toBe(hotkeyA)
    })

    it('should allow theme toggle in reversed order', () => {
      render(
        <ReversedProviders>
          <AllConsumer />
        </ReversedProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    })

    it('should allow toast in reversed order', () => {
      render(
        <ReversedProviders>
          <AllConsumer />
        </ReversedProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('add-toast'))
      })
      expect(screen.getByText('Done')).toBeDefined()
    })

    it('should allow modal in reversed order', () => {
      render(
        <ReversedProviders>
          <AllConsumer />
        </ReversedProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-modal'))
      })
      expect(screen.getByTestId('modal-count').textContent).toBe('1')

      act(() => {
        fireEvent.click(screen.getByTestId('close-all-modals'))
      })
      expect(screen.getByTestId('modal-count').textContent).toBe('0')
    })
  })

  describe('concurrent state changes across providers', () => {
    it('should handle rapid state changes across multiple providers', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
        fireEvent.click(screen.getByTestId('set-flag'))
        fireEvent.click(screen.getByTestId('open-modal'))
        fireEvent.click(screen.getByTestId('add-toast'))
      })

      expect(screen.getByTestId('theme').textContent).toBe('dark')
      expect(screen.getByTestId('modal-count').textContent).toBe('1')
      expect(screen.getByText('Done')).toBeDefined()
    })

    it('should clear toasts without affecting modal state', () => {
      render(
        <AllProviders>
          <AllConsumer />
        </AllProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('add-toast'))
        fireEvent.click(screen.getByTestId('open-modal'))
      })

      expect(screen.getByText('Done')).toBeDefined()
      expect(screen.getByTestId('modal-count').textContent).toBe('1')

      act(() => {
        fireEvent.click(screen.getByTestId('clear-toasts'))
      })

      // Toasts cleared but modal still open
      expect(screen.queryByText('Done')).toBeNull()
      expect(screen.getByTestId('modal-count').textContent).toBe('1')
    })
  })
})
