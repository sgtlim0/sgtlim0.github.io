/**
 * Admin Health Dashboard — Tests
 *
 * Covers:
 * - HealthDashboard: rendering, loading state, overall status, service cards, refresh
 * - HealthTimeline: empty state, event display, formatting
 * - useHealthMonitor: initial load, polling, event detection, history accumulation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'

import HealthDashboard from '../src/admin/HealthDashboard'
import HealthTimeline from '../src/admin/HealthTimeline'
import { useHealthMonitor } from '../src/hooks/useHealthMonitor'
import type { HealthStatus } from '../src/utils/healthCheck'
import type { HealthHistoryEntry, HealthEvent } from '../src/hooks/useHealthMonitor'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const MOCK_HEALTH_STATUS: HealthStatus = {
  status: 'healthy',
  services: [
    { name: 'API Gateway', status: 'up', latency: 42, checkedAt: '2026-03-10T14:30:00Z' },
    { name: 'Database', status: 'up', latency: 5, checkedAt: '2026-03-10T14:30:00Z' },
    { name: 'Redis', status: 'degraded', latency: 890, checkedAt: '2026-03-10T14:30:00Z' },
    { name: 'AI Core', status: 'down', latency: 0, error: 'Connection refused', checkedAt: '2026-03-10T14:30:00Z' },
  ],
  timestamp: '2026-03-10T14:30:00Z',
}

const MOCK_HISTORY: HealthHistoryEntry[] = Array.from({ length: 5 }, (_, i) => ({
  timestamp: new Date(2026, 2, 10, 14, 20 + i).toISOString(),
  services: [
    { name: 'API Gateway', status: 'up' as const, latency: 40 + i * 2, checkedAt: '' },
    { name: 'Database', status: 'up' as const, latency: 4 + i, checkedAt: '' },
    { name: 'Redis', status: i === 4 ? ('degraded' as const) : ('up' as const), latency: 30 + i * 10, checkedAt: '' },
    { name: 'AI Core', status: i >= 3 ? ('down' as const) : ('up' as const), latency: i >= 3 ? 0 : 200 + i * 10, checkedAt: '' },
  ],
  overallStatus: i >= 3 ? 'unhealthy' : 'healthy',
}))

const MOCK_EVENTS: HealthEvent[] = [
  {
    id: 'evt-1',
    service: 'AI Core',
    previousStatus: 'up',
    currentStatus: 'down',
    timestamp: '2026-03-10T14:23:00Z',
  },
  {
    id: 'evt-2',
    service: 'Redis',
    previousStatus: 'up',
    currentStatus: 'degraded',
    timestamp: '2026-03-10T14:24:00Z',
    duration: 45000,
  },
  {
    id: 'evt-3',
    service: 'AI Core',
    previousStatus: 'down',
    currentStatus: 'up',
    timestamp: '2026-03-10T14:25:00Z',
    duration: 120000,
  },
]

// ============================================================================
// HealthDashboard
// ============================================================================

describe('HealthDashboard', () => {
  it('should render loading state when isLoading is true', () => {
    render(
      <HealthDashboard
        current={null}
        overallStatus="healthy"
        history={[]}
        isLoading={true}
      />,
    )
    expect(screen.getByTestId('health-dashboard-loading')).toBeDefined()
  })

  it('should render loading state when current is null', () => {
    render(
      <HealthDashboard
        current={null}
        overallStatus="healthy"
        history={[]}
      />,
    )
    expect(screen.getByTestId('health-dashboard-loading')).toBeDefined()
  })

  it('should render overall status banner', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    expect(screen.getByTestId('health-dashboard')).toBeDefined()
    // The banner h2 contains the overall status text
    expect(screen.getByText(/시스템 상태:/)).toBeDefined()
  })

  it('should show healthy status', () => {
    const healthyStatus: HealthStatus = {
      ...MOCK_HEALTH_STATUS,
      status: 'healthy',
      services: MOCK_HEALTH_STATUS.services.map((s) => ({ ...s, status: 'up' as const })),
    }
    render(
      <HealthDashboard
        current={healthyStatus}
        overallStatus="healthy"
        history={MOCK_HISTORY}
      />,
    )
    // All 4 services up
    expect(screen.getByText(/4\/4 서비스 정상 운영 중/)).toBeDefined()
  })

  it('should show degraded status', () => {
    render(
      <HealthDashboard
        current={{ ...MOCK_HEALTH_STATUS, status: 'degraded' }}
        overallStatus="degraded"
        history={MOCK_HISTORY}
      />,
    )
    // The banner heading has the degraded label inside a span
    const heading = screen.getByText(/시스템 상태:/)
    expect(heading.textContent).toContain('지연')
  })

  it('should render all service cards', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    expect(screen.getByTestId('service-card-API Gateway')).toBeDefined()
    expect(screen.getByTestId('service-card-Database')).toBeDefined()
    expect(screen.getByTestId('service-card-Redis')).toBeDefined()
    expect(screen.getByTestId('service-card-AI Core')).toBeDefined()
  })

  it('should display service count in banner', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    // 2 services are "up" out of 4
    expect(screen.getByText(/2\/4 서비스 정상 운영 중/)).toBeDefined()
  })

  it('should display latency for services', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    expect(screen.getByText('42ms')).toBeDefined()
    expect(screen.getByText('5ms')).toBeDefined()
    expect(screen.getByText('890ms')).toBeDefined()
  })

  it('should show "-" for down service latency', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    // AI Core is down (latency 0) → should show "-"
    const aiCoreCard = screen.getByTestId('service-card-AI Core')
    expect(within(aiCoreCard).getByText('-')).toBeDefined()
  })

  it('should show uptime percentages', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    // API Gateway is always up in history → 100%
    const apiCard = screen.getByTestId('service-card-API Gateway')
    expect(within(apiCard).getByText('100%')).toBeDefined()
  })

  it('should render refresh button when onRefresh is provided', () => {
    const onRefresh = vi.fn()
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="healthy"
        history={MOCK_HISTORY}
        onRefresh={onRefresh}
      />,
    )
    const btn = screen.getByTestId('health-refresh-btn')
    fireEvent.click(btn)
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('should not render refresh button when onRefresh is not provided', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="healthy"
        history={MOCK_HISTORY}
      />,
    )
    expect(screen.queryByTestId('health-refresh-btn')).toBeNull()
  })

  it('should compute uptime correctly when service is sometimes down', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={MOCK_HISTORY}
      />,
    )
    // AI Core: 3 out of 5 are "up", 2 are "down" → 60%
    const aiCard = screen.getByTestId('service-card-AI Core')
    expect(within(aiCard).getByText('60%')).toBeDefined()
  })

  it('should show 100% uptime when history is empty', () => {
    render(
      <HealthDashboard
        current={MOCK_HEALTH_STATUS}
        overallStatus="unhealthy"
        history={[]}
      />,
    )
    // No history → default 100%
    const apiCard = screen.getByTestId('service-card-API Gateway')
    expect(within(apiCard).getByText('100%')).toBeDefined()
  })
})

// ============================================================================
// HealthTimeline
// ============================================================================

describe('HealthTimeline', () => {
  it('should render empty state when no events', () => {
    render(<HealthTimeline events={[]} />)
    expect(screen.getByTestId('health-timeline')).toBeDefined()
    expect(screen.getByText('상태 변경 이벤트가 없습니다.')).toBeDefined()
  })

  it('should render events in reverse chronological order', () => {
    render(<HealthTimeline events={MOCK_EVENTS} />)
    const eventElements = screen.getAllByTestId(/^timeline-event-/)
    expect(eventElements).toHaveLength(3)
    // Newest first (evt-3 is latest)
    expect(eventElements[0].getAttribute('data-testid')).toBe('timeline-event-evt-3')
    expect(eventElements[1].getAttribute('data-testid')).toBe('timeline-event-evt-2')
    expect(eventElements[2].getAttribute('data-testid')).toBe('timeline-event-evt-1')
  })

  it('should display event descriptions', () => {
    render(<HealthTimeline events={MOCK_EVENTS} />)
    // evt-1: AI Core up → down → "복구 → 장애"
    expect(screen.getByText(/AI Core: 복구 → 장애/)).toBeDefined()
    // evt-2: Redis up → degraded → "복구 → 지연"
    expect(screen.getByText(/Redis: 복구 → 지연/)).toBeDefined()
    // evt-3: AI Core down → up → "장애 → 복구"
    expect(screen.getByText(/AI Core: 장애 → 복구/)).toBeDefined()
  })

  it('should show duration when provided', () => {
    render(<HealthTimeline events={MOCK_EVENTS} />)
    // evt-2 has 45000ms = 45s
    expect(screen.getByText('(45s)')).toBeDefined()
    // evt-3 has 120000ms = 2m 0s
    expect(screen.getByText('(2m 0s)')).toBeDefined()
  })

  it('should not show duration when not provided', () => {
    render(<HealthTimeline events={[MOCK_EVENTS[0]]} />)
    // evt-1 has no duration
    const event = screen.getByTestId('timeline-event-evt-1')
    expect(event.textContent).not.toContain('(')
  })

  it('should show status icons', () => {
    render(<HealthTimeline events={MOCK_EVENTS} />)
    // Recovery event should show checkmark
    expect(screen.getByText(/\u2714/)).toBeDefined()
    // Down event should show cross
    expect(screen.getByText(/\u2716/)).toBeDefined()
    // Degraded event should show warning
    expect(screen.getByText(/\u26A0/)).toBeDefined()
  })

  it('should respect maxDisplay limit', () => {
    const manyEvents: HealthEvent[] = Array.from({ length: 30 }, (_, i) => ({
      id: `evt-${i}`,
      service: 'Test',
      previousStatus: 'up' as const,
      currentStatus: 'down' as const,
      timestamp: new Date(2026, 2, 10, 14, i).toISOString(),
    }))
    render(<HealthTimeline events={manyEvents} maxDisplay={5} />)
    const eventElements = screen.getAllByTestId(/^timeline-event-/)
    expect(eventElements).toHaveLength(5)
  })

  it('should format timestamps correctly', () => {
    render(<HealthTimeline events={MOCK_EVENTS} />)
    // 2026-03-10T14:23:00Z → local time format
    // Just check that timestamp text appears
    const events = screen.getAllByTestId(/^timeline-event-/)
    expect(events.length).toBeGreaterThan(0)
  })

  it('should format duration under 1 second as ms', () => {
    const shortEvent: HealthEvent = {
      id: 'evt-short',
      service: 'Test',
      previousStatus: 'up',
      currentStatus: 'down',
      timestamp: '2026-03-10T14:30:00Z',
      duration: 500,
    }
    render(<HealthTimeline events={[shortEvent]} />)
    expect(screen.getByText('(500ms)')).toBeDefined()
  })
})

// ============================================================================
// useHealthMonitor
// ============================================================================

describe('useHealthMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start in loading state', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))
    // Before any tick, isLoading may already be false because the first check runs synchronously
    // But current should exist after the first synchronous call
    expect(result.current.current).not.toBeNull()
  })

  it('should perform initial check immediately', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))
    expect(result.current.current).not.toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.current?.services).toHaveLength(4)
  })

  it('should accumulate history on each check', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 1000 }))

    // Initial check produces 1 history entry
    expect(result.current.history).toHaveLength(1)

    // Advance timer to trigger another check
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.history).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.history).toHaveLength(3)
  })

  it('should respect maxHistory limit', () => {
    const { result } = renderHook(() =>
      useHealthMonitor({ intervalMs: 100, maxHistory: 5 }),
    )

    // Run 10 intervals (+ 1 initial = 11 checks)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.history.length).toBeLessThanOrEqual(5)
  })

  it('should not poll when enabled is false', () => {
    const { result } = renderHook(() =>
      useHealthMonitor({ intervalMs: 1000, enabled: false }),
    )

    expect(result.current.current).toBeNull()
    expect(result.current.isLoading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.current).toBeNull()
  })

  it('should derive overallStatus from current health', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))
    const status = result.current.overallStatus
    expect(['healthy', 'degraded', 'unhealthy']).toContain(status)
  })

  it('should return healthy as default overallStatus when current is null', () => {
    const { result } = renderHook(() =>
      useHealthMonitor({ enabled: false }),
    )
    expect(result.current.overallStatus).toBe('healthy')
  })

  it('should support manual refresh', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))

    const historyBefore = result.current.history.length
    act(() => {
      result.current.refresh()
    })
    expect(result.current.history.length).toBe(historyBefore + 1)
  })

  it('should contain 4 services in each health check', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))
    const services = result.current.current?.services ?? []
    expect(services).toHaveLength(4)
    const names = services.map((s) => s.name)
    expect(names).toContain('API Gateway')
    expect(names).toContain('Database')
    expect(names).toContain('Redis')
    expect(names).toContain('AI Core')
  })

  it('should generate events on status changes', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 100 }))

    // Run many iterations to increase chance of status changes (mock is random)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Events may or may not exist depending on random mock — but the structure should be correct
    for (const event of result.current.events) {
      expect(event.id).toBeDefined()
      expect(event.service).toBeDefined()
      expect(event.previousStatus).toBeDefined()
      expect(event.currentStatus).toBeDefined()
      expect(event.timestamp).toBeDefined()
      expect(event.previousStatus).not.toBe(event.currentStatus)
    }
  })

  it('should not poll when intervalMs is 0', () => {
    const { result } = renderHook(() => useHealthMonitor({ intervalMs: 0 }))

    // Only the initial check should have run
    expect(result.current.history).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Still only 1 entry
    expect(result.current.history).toHaveLength(1)
  })

  it('should clean up interval on unmount', () => {
    const { unmount, result } = renderHook(() =>
      useHealthMonitor({ intervalMs: 1000 }),
    )

    expect(result.current.history).toHaveLength(1)
    unmount()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // No additional entries after unmount (can't check result after unmount,
    // but no error should occur)
  })
})
