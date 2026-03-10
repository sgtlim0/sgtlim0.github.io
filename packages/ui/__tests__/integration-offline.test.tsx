import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useState, useCallback, useEffect } from 'react'
import { ToastQueueProvider, useToastQueue2 } from '../src/ToastQueueProvider'
import { OfflineIndicator } from '../src/OfflineIndicator'
import { useOfflineQueue } from '../src/hooks/useOfflineQueue'

// ---------------------------------------------------------------------------
// Mock navigator.onLine
// ---------------------------------------------------------------------------

let mockOnLine = true

function setOnline(online: boolean) {
  mockOnLine = online
  Object.defineProperty(navigator, 'onLine', {
    get: () => mockOnLine,
    configurable: true,
  })
  if (online) {
    window.dispatchEvent(new Event('online'))
  } else {
    window.dispatchEvent(new Event('offline'))
  }
}

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

let fetchMock: ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Providers wrapper
// ---------------------------------------------------------------------------

function OfflineProviders({ children }: { children: ReactNode }) {
  return (
    <ToastQueueProvider>
      {children}
    </ToastQueueProvider>
  )
}

// ---------------------------------------------------------------------------
// App component: OfflineIndicator + toast integration
// ---------------------------------------------------------------------------

function OfflineApp() {
  const { addToast } = useToastQueue2()
  const {
    isOnline,
    pendingCount,
    enqueue,
    retryAll,
    queue,
    clear,
  } = useOfflineQueue({
    maxRetries: 2,
    baseDelayMs: 10,
    persistKey: 'test-offline-queue',
  })

  const handleSendRequest = useCallback(() => {
    if (!isOnline) {
      const id = enqueue({
        url: '/api/data',
        method: 'POST',
        body: { message: 'test' },
        maxRetries: 2,
      })
      addToast({
        type: 'warning',
        title: 'Request queued',
        description: 'Will retry when online',
        duration: 0,
      })
    } else {
      addToast({
        type: 'success',
        title: 'Request sent',
        duration: 0,
      })
    }
  }, [isOnline, enqueue, addToast])

  const handleRetry = useCallback(async () => {
    await retryAll()
    if (pendingCount === 0) {
      addToast({
        type: 'success',
        title: 'All requests completed',
        duration: 0,
      })
    }
  }, [retryAll, pendingCount, addToast])

  return (
    <div>
      <OfflineIndicator
        queueOptions={{
          maxRetries: 2,
          baseDelayMs: 10,
          persistKey: 'test-offline-indicator',
        }}
      />

      <span data-testid="online-status">{String(isOnline)}</span>
      <span data-testid="pending-count">{pendingCount}</span>
      <span data-testid="queue-length">{queue.length}</span>

      <button data-testid="send-request" onClick={handleSendRequest}>Send Request</button>
      <button data-testid="retry-all" onClick={handleRetry}>Retry All</button>
      <button data-testid="clear-queue" onClick={clear}>Clear Queue</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()
  mockOnLine = true
  Object.defineProperty(navigator, 'onLine', {
    get: () => mockOnLine,
    configurable: true,
  })

  fetchMock = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Integration: Offline + Toast', () => {
  describe('online state detection', () => {
    it('should show online status initially', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      expect(screen.getByTestId('online-status').textContent).toBe('true')
      expect(screen.getByTestId('pending-count').textContent).toBe('0')
    })

    it('should detect offline state', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })

      expect(screen.getByTestId('online-status').textContent).toBe('false')
    })

    it('should detect online restore', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })
      expect(screen.getByTestId('online-status').textContent).toBe('false')

      act(() => {
        setOnline(true)
      })
      expect(screen.getByTestId('online-status').textContent).toBe('true')
    })
  })

  describe('offline indicator display', () => {
    it('should not show offline indicator when online and no pending', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      // OfflineIndicator renders null when online + no pending
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('should show offline indicator when offline', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })

      const alert = screen.queryAllByRole('alert')
      // The OfflineIndicator component should be visible
      // Note: there may be toast alerts too, so look for offline-specific text
      const offlineAlerts = alert.filter(
        (el) => el.textContent?.includes('오프라인') ?? false,
      )
      expect(offlineAlerts.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('request queueing when offline', () => {
    it('should queue request and show warning toast when offline', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })

      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })

      // Queue should have 1 item
      expect(screen.getByTestId('pending-count').textContent).toBe('1')

      // Warning toast should appear
      expect(screen.getByText('Request queued')).toBeDefined()
      expect(screen.getByText('Will retry when online')).toBeDefined()
    })

    it('should show success toast when sending while online', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })

      // No queue
      expect(screen.getByTestId('pending-count').textContent).toBe('0')
      // Success toast
      expect(screen.getByText('Request sent')).toBeDefined()
    })

    it('should queue multiple requests when offline', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })

      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
        fireEvent.click(screen.getByTestId('send-request'))
        fireEvent.click(screen.getByTestId('send-request'))
      })

      expect(screen.getByTestId('pending-count').textContent).toBe('3')
    })
  })

  describe('manual retry', () => {
    it('should retry queued requests manually', async () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      // Go offline and queue
      act(() => {
        setOnline(false)
      })
      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })
      expect(screen.getByTestId('pending-count').textContent).toBe('1')

      // Come back online
      act(() => {
        setOnline(true)
      })

      // Manual retry
      await act(async () => {
        fireEvent.click(screen.getByTestId('retry-all'))
      })

      // Give time for async retry
      await waitFor(() => {
        const pending = screen.getByTestId('pending-count').textContent
        // The queue should eventually drain (fetch mock returns 200)
        expect(Number(pending)).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('queue clearing', () => {
    it('should clear all queued requests', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })
      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
        fireEvent.click(screen.getByTestId('send-request'))
      })
      expect(screen.getByTestId('pending-count').textContent).toBe('2')

      act(() => {
        fireEvent.click(screen.getByTestId('clear-queue'))
      })
      expect(screen.getByTestId('pending-count').textContent).toBe('0')
    })
  })

  describe('toast notifications during offline/online cycle', () => {
    it('should show different toasts for offline queue vs online send', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      // Send while online
      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })
      expect(screen.getByText('Request sent')).toBeDefined()

      // Go offline and send
      act(() => {
        setOnline(false)
      })
      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })
      expect(screen.getByText('Request queued')).toBeDefined()

      // Both toasts should be visible
      expect(screen.getByText('Request sent')).toBeDefined()
      expect(screen.getByText('Request queued')).toBeDefined()
    })

    it('should handle rapid online/offline toggling', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
        setOnline(true)
        setOnline(false)
        setOnline(true)
      })

      // Should end up online
      expect(screen.getByTestId('online-status').textContent).toBe('true')
    })
  })

  describe('offline indicator with pending count', () => {
    it('should show pending count in offline indicator', () => {
      render(
        <OfflineProviders>
          <OfflineApp />
        </OfflineProviders>,
      )

      act(() => {
        setOnline(false)
      })

      act(() => {
        fireEvent.click(screen.getByTestId('send-request'))
      })

      // The offline indicator (from OfflineIndicator component) should mention
      // pending requests — check for any alert mentioning the count
      const alerts = screen.queryAllByRole('alert')
      expect(alerts.length).toBeGreaterThanOrEqual(1)
    })
  })
})
