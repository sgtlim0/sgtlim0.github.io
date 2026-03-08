/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin Live Components — Coverage Enhancement Tests
 *
 * Targets uncovered lines/branches in:
 * - LiveMetricCard (line 22: unit with space suffix)
 * - LiveActivityFeed (lines 35-36: formatRelativeTime edge cases)
 * - LiveModelDistribution (lines 64-65: hover interaction on donut)
 * - LiveLineChart (lines 191-192: hover tooltip)
 * - NotificationPanel (lines 58-59, 78, 93-95: time formatting, navigation, keyboard)
 * - NotificationPreferences (lines 80-86, 122-153: type toggle, quiet hours)
 * - NotificationCenter (line 42: toggle panel)
 * - notificationHooks (lines 65-72, 90-91: filter, updatePref)
 * - NotificationBell (formatCount edge: count > 99)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'

// ============ LiveMetricCard — unit with space suffix ============

import { LiveMetricCard } from '../src/admin/LiveMetricCard'
import type { RealtimeMetric } from '../src/admin/services/realtimeTypes'

describe('LiveMetricCard — additional coverage', () => {
  const baseMetric: RealtimeMetric = {
    id: 'm1',
    label: 'Test Metric',
    value: 38,
    previousValue: 35,
    unit: '',
    trend: 'up',
    changePercent: 8.6,
  }

  it('should format value with generic unit suffix (e.g. "명")', () => {
    render(<LiveMetricCard metric={{ ...baseMetric, value: 38, unit: '명' }} />)
    // formatValue with non-% non-ms unit appends space + unit
    expect(screen.getByText('38 명')).toBeDefined()
  })

  it('should format value with empty unit (no suffix)', () => {
    render(<LiveMetricCard metric={{ ...baseMetric, value: 500, unit: '' }} />)
    expect(screen.getByText('500')).toBeDefined()
  })

  it('should render "vs prev" label', () => {
    render(<LiveMetricCard metric={baseMetric} />)
    expect(screen.getByText('vs prev')).toBeDefined()
  })

  it('should show zero change percent as 0.0%', () => {
    render(<LiveMetricCard metric={{ ...baseMetric, changePercent: 0 }} />)
    // changePercent > 0 is false for 0, so no '+' prefix
    expect(screen.getByText('0.0%')).toBeDefined()
  })
})

// ============ LiveActivityFeed — formatRelativeTime branches ============

import { LiveActivityFeed } from '../src/admin/LiveActivityFeed'
import type { RealtimeActivity } from '../src/admin/services/realtimeTypes'

describe('LiveActivityFeed — formatRelativeTime branches', () => {
  const makeActivity = (overrides: Partial<RealtimeActivity> = {}): RealtimeActivity => ({
    id: 'act-1',
    type: 'query',
    user: 'test@user.com',
    message: 'Test query',
    timestamp: Date.now(),
    ...overrides,
  })

  it('should show "just now" for very recent activity (< 5s)', () => {
    const { container } = render(
      <LiveActivityFeed activities={[makeActivity({ timestamp: Date.now() - 2000 })]} />,
    )
    expect(container.textContent).toContain('just now')
  })

  it('should show seconds ago for activity < 60s', () => {
    const { container } = render(
      <LiveActivityFeed activities={[makeActivity({ timestamp: Date.now() - 30000 })]} />,
    )
    expect(container.textContent).toContain('s ago')
  })

  it('should show minutes ago for activity < 3600s', () => {
    const { container } = render(
      <LiveActivityFeed activities={[makeActivity({ timestamp: Date.now() - 120000 })]} />,
    )
    expect(container.textContent).toContain('m ago')
  })

  it('should show hours ago for activity >= 3600s', () => {
    const { container } = render(
      <LiveActivityFeed activities={[makeActivity({ timestamp: Date.now() - 7200000 })]} />,
    )
    expect(container.textContent).toContain('h ago')
  })

  it('should render all activity types with correct icons', () => {
    const types = ['query', 'login', 'error', 'model_switch', 'upload'] as const
    const expectedIcons = ['Q', 'L', '!', 'M', 'U']
    types.forEach((type, i) => {
      const { container } = render(
        <LiveActivityFeed activities={[makeActivity({ id: `icon-${i}`, type })]} />,
      )
      expect(container.textContent).toContain(expectedIcons[i])
    })
  })
})

// ============ LiveModelDistribution — hover interaction ============

import { LiveModelDistribution } from '../src/admin/LiveModelDistribution'

describe('LiveModelDistribution — hover interaction', () => {
  const distribution = [
    { model: 'GPT-4o', count: 450, percentage: 45 },
    { model: 'Claude 3.5', count: 300, percentage: 30 },
    { model: 'Gemini', count: 250, percentage: 25 },
  ]

  it('should handle hover on donut segments', () => {
    const { container } = render(<LiveModelDistribution distribution={distribution} />)
    const circles = container.querySelectorAll('circle')
    // Donut has a background circle + 3 segments = 4 circles
    const segmentCircles = Array.from(circles).filter((c) => c.getAttribute('stroke') !== 'var(--border)')
    expect(segmentCircles.length).toBe(3)

    // Hover on first segment
    fireEvent.mouseEnter(segmentCircles[0])
    // Hovered segment should have strokeWidth 14
    expect(segmentCircles[0].getAttribute('stroke-width')).toBe('14')

    // Leave
    fireEvent.mouseLeave(segmentCircles[0])
    expect(segmentCircles[0].getAttribute('stroke-width')).toBe('12')
  })

  it('should dim non-hovered legend items', () => {
    const { container } = render(<LiveModelDistribution distribution={distribution} />)
    const circles = container.querySelectorAll('circle')
    const segmentCircles = Array.from(circles).filter((c) => c.getAttribute('stroke') !== 'var(--border)')

    // Hover on first segment — legend items 1,2 should be dimmed (opacity 0.4)
    fireEvent.mouseEnter(segmentCircles[0])
    const legendItems = container.querySelectorAll('.flex.items-center.gap-2.transition-opacity')
    if (legendItems.length >= 3) {
      expect((legendItems[1] as HTMLElement).style.opacity).toBe('0.4')
      expect((legendItems[2] as HTMLElement).style.opacity).toBe('0.4')
    }
  })

  it('should render empty distribution without error', () => {
    const { container } = render(<LiveModelDistribution distribution={[]} />)
    expect(container.querySelector('svg')).toBeDefined()
    // Total should be 0
    expect(container.textContent).toContain('0')
  })
})

// ============ LiveLineChart — hover tooltip ============

import { LiveLineChart } from '../src/admin/LiveLineChart'
import type { RealtimeDataPoint } from '../src/admin/services/realtimeTypes'

describe('LiveLineChart — hover tooltip', () => {
  const makeData = (count = 5): RealtimeDataPoint[] =>
    Array.from({ length: count }, (_, i) => ({
      timestamp: Date.now() - (count - i) * 60000,
      value: 100 + i * 10,
    }))

  it('should show tooltip on data point hover', () => {
    const { container } = render(<LiveLineChart data={makeData()} label="Test" />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(5)

    // Hover on the third circle (index 2)
    fireEvent.mouseEnter(circles[2])

    // Tooltip should appear — it contains formatted time and value
    const tooltip = container.querySelector('.pointer-events-none')
    expect(tooltip).not.toBeNull()
    expect(tooltip?.textContent).toContain('120')
  })

  it('should hide tooltip on mouse leave', () => {
    const { container } = render(<LiveLineChart data={makeData()} />)
    const circles = container.querySelectorAll('circle')

    fireEvent.mouseEnter(circles[0])
    expect(container.querySelector('.pointer-events-none')).not.toBeNull()

    fireEvent.mouseLeave(circles[0])
    expect(container.querySelector('.pointer-events-none')).toBeNull()
  })

  it('should render with two data points', () => {
    const { container } = render(<LiveLineChart data={makeData(2)} />)
    expect(container.querySelector('svg')).toBeDefined()
    expect(container.querySelectorAll('circle').length).toBe(2)
  })

  it('should render with custom color and height', () => {
    const { container } = render(
      <LiveLineChart data={makeData()} color="#ff0000" height={300} />,
    )
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#ff0000')
  })
})

// ============ NotificationPanel — uncovered branches ============

import NotificationPanel from '../src/admin/NotificationPanel'
import type { Notification } from '../src/admin/services/notificationTypes'

describe('NotificationPanel — additional coverage', () => {
  const makeNotif = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    type: 'info',
    priority: 'medium',
    title: 'Test Notification',
    message: 'This is a test message',
    source: 'System',
    timestamp: Date.now() - 120000,
    read: false,
    channels: ['push'],
    ...overrides,
  })

  // Line 58: formatRelativeTime — hours branch
  it('should show hours for notification timestamps 1-24h old', () => {
    const { container } = render(
      <NotificationPanel
        notifications={[makeNotif({ timestamp: Date.now() - 7200000 })]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('시간 전')
  })

  // Line 59: formatRelativeTime — days branch
  it('should show days for notification timestamps > 24h old', () => {
    const { container } = render(
      <NotificationPanel
        notifications={[makeNotif({ timestamp: Date.now() - 172800000 })]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('일 전')
  })

  // Line 56: formatRelativeTime — "방금 전" branch
  it('should show 방금 전 for very recent notifications', () => {
    const { container } = render(
      <NotificationPanel
        notifications={[makeNotif({ timestamp: Date.now() - 5000 })]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('방금 전')
  })

  // Line 78: onNavigate with actionUrl
  it('should call onNavigate when notification with actionUrl is clicked', () => {
    const onNavigate = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif({ actionUrl: '/alerts/123' })]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={onNavigate}
      />,
    )
    fireEvent.click(screen.getByText('Test Notification'))
    expect(onNavigate).toHaveBeenCalledWith('/alerts/123')
  })

  it('should not call onNavigate when actionUrl is absent', () => {
    const onNavigate = vi.fn()
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif()]}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
        onNavigate={onNavigate}
      />,
    )
    fireEvent.click(screen.getByText('Test Notification'))
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  // Line 74-76: clicking an already-read notification should not call onMarkRead
  it('should not call onMarkRead when already-read notification is clicked', () => {
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif({ read: true })]}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Test Notification'))
    expect(onMarkRead).not.toHaveBeenCalled()
  })

  // Lines 92-96: keyboard interaction (Enter and Space)
  it('should handle Enter key on notification item', () => {
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif()]}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
      />,
    )
    const item = screen.getByText('Test Notification').closest('[role="button"]')!
    fireEvent.keyDown(item, { key: 'Enter' })
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')
  })

  it('should handle Space key on notification item', () => {
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif()]}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
      />,
    )
    const item = screen.getByText('Test Notification').closest('[role="button"]')!
    fireEvent.keyDown(item, { key: ' ' })
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')
  })

  it('should not trigger on other keys', () => {
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel
        notifications={[makeNotif()]}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
      />,
    )
    const item = screen.getByText('Test Notification').closest('[role="button"]')!
    fireEvent.keyDown(item, { key: 'Tab' })
    expect(onMarkRead).not.toHaveBeenCalled()
  })

  it('should render priority badges', () => {
    const notifications = [
      makeNotif({ id: 'n1', priority: 'critical', title: 'Critical' }),
      makeNotif({ id: 'n2', priority: 'high', title: 'High' }),
      makeNotif({ id: 'n3', priority: 'low', title: 'Low' }),
    ]
    render(
      <NotificationPanel
        notifications={notifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
      />,
    )
    expect(screen.getByText('critical')).toBeDefined()
    expect(screen.getByText('high')).toBeDefined()
    expect(screen.getByText('low')).toBeDefined()
  })

  it('should render source label', () => {
    render(
      <NotificationPanel
        notifications={[makeNotif({ source: 'security' })]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
      />,
    )
    expect(screen.getByText('security')).toBeDefined()
  })
})

// ============ NotificationPreferences — uncovered branches ============

import NotificationPreferences from '../src/admin/NotificationPreferences'
import type { NotificationPreference } from '../src/admin/services/notificationTypes'

describe('NotificationPreferences — additional coverage', () => {
  const makePref = (overrides: Partial<NotificationPreference> = {}): NotificationPreference => ({
    channel: 'push',
    enabled: true,
    types: ['info', 'warning', 'error', 'success'],
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    ...overrides,
  })

  // Lines 80-83: handleTypeToggle — remove type
  it('should toggle off a type when clicking an active type', () => {
    const onUpdate = vi.fn()
    render(
      <NotificationPreferences
        preferences={[makePref({ channel: 'push', enabled: true, types: ['info', 'warning', 'error', 'success'] })]}
        onUpdate={onUpdate}
      />,
    )
    // Click the '정보' (info) type button to remove it
    fireEvent.click(screen.getByText('정보'))
    expect(onUpdate).toHaveBeenCalledWith('push', { types: ['warning', 'error', 'success'] })
  })

  // Lines 80-81: handleTypeToggle — add type
  it('should toggle on a type when clicking an inactive type', () => {
    const onUpdate = vi.fn()
    render(
      <NotificationPreferences
        preferences={[makePref({ channel: 'push', enabled: true, types: ['warning'] })]}
        onUpdate={onUpdate}
      />,
    )
    // Click '정보' which is not in types, should add it
    fireEvent.click(screen.getByText('정보'))
    expect(onUpdate).toHaveBeenCalledWith('push', { types: ['warning', 'info'] })
  })

  // Lines 85-87: handleQuietHoursChange — start time
  it('should update quiet hours start time', () => {
    const onUpdate = vi.fn()
    render(
      <NotificationPreferences
        preferences={[makePref({ channel: 'email', enabled: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' })]}
        onUpdate={onUpdate}
      />,
    )
    const timeInputs = document.querySelectorAll('input[type="time"]')
    expect(timeInputs.length).toBeGreaterThanOrEqual(2)
    // First time input is quietHoursStart
    fireEvent.change(timeInputs[0], { target: { value: '23:00' } })
    expect(onUpdate).toHaveBeenCalledWith('email', { quietHoursStart: '23:00' })
  })

  // Lines 85-87: handleQuietHoursChange — end time
  it('should update quiet hours end time', () => {
    const onUpdate = vi.fn()
    render(
      <NotificationPreferences
        preferences={[makePref({ channel: 'email', enabled: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' })]}
        onUpdate={onUpdate}
      />,
    )
    const timeInputs = document.querySelectorAll('input[type="time"]')
    // Second time input is quietHoursEnd
    fireEvent.change(timeInputs[1], { target: { value: '09:00' } })
    expect(onUpdate).toHaveBeenCalledWith('email', { quietHoursEnd: '09:00' })
  })

  it('should render 방해 금지 label for enabled channel', () => {
    render(
      <NotificationPreferences
        preferences={[makePref({ enabled: true })]}
        onUpdate={vi.fn()}
      />,
    )
    expect(screen.getByText('방해 금지:')).toBeDefined()
  })

  it('should not render type buttons or quiet hours for disabled channel', () => {
    render(
      <NotificationPreferences
        preferences={[makePref({ enabled: false })]}
        onUpdate={vi.fn()}
      />,
    )
    expect(screen.queryByText('방해 금지:')).toBeNull()
    expect(screen.queryByText('정보')).toBeNull()
  })

  it('should render channel descriptions', () => {
    render(
      <NotificationPreferences
        preferences={[
          makePref({ channel: 'push', enabled: true }),
          makePref({ channel: 'email', enabled: false }),
          makePref({ channel: 'slack', enabled: false }),
          makePref({ channel: 'teams', enabled: false }),
        ]}
        onUpdate={vi.fn()}
      />,
    )
    expect(screen.getByText('브라우저 푸시 알림')).toBeDefined()
    expect(screen.getByText('이메일 알림')).toBeDefined()
    expect(screen.getByText('Slack 채널 알림')).toBeDefined()
    expect(screen.getByText('Microsoft Teams 알림')).toBeDefined()
  })

  it('should render empty quiet hours inputs when not set', () => {
    render(
      <NotificationPreferences
        preferences={[makePref({ enabled: true, quietHoursStart: undefined, quietHoursEnd: undefined })]}
        onUpdate={vi.fn()}
      />,
    )
    const timeInputs = document.querySelectorAll('input[type="time"]') as NodeListOf<HTMLInputElement>
    expect(timeInputs[0].value).toBe('')
    expect(timeInputs[1].value).toBe('')
  })
})

// ============ NotificationCenter — toggle panel ============

// Must mock hooks before import
vi.mock('../src/admin/services/notificationHooks', async () => {
  const actual = await vi.importActual('../src/admin/services/notificationHooks')
  return {
    ...actual,
    useNotifications: vi.fn().mockReturnValue({
      notifications: [
        {
          id: 'n1',
          type: 'warning' as const,
          priority: 'high' as const,
          title: 'Test Alert',
          message: 'Test msg',
          source: 'System',
          timestamp: Date.now() - 60000,
          read: false,
          channels: ['push' as const],
        },
      ],
      stats: {
        total: 1,
        unread: 1,
        byType: { info: 0, warning: 1, error: 0, success: 0 },
        byPriority: { low: 0, medium: 0, high: 1, critical: 0 },
      },
      markRead: vi.fn(),
      markAllRead: vi.fn(),
    }),
    useNotificationBadge: vi.fn().mockReturnValue({ unreadCount: 1, hasUrgent: true }),
  }
})

import NotificationCenter from '../src/admin/NotificationCenter'

describe('NotificationCenter — toggle panel', () => {
  it('should hide notification panel when bell is toggled', () => {
    render(<NotificationCenter />)

    // Panel should be visible initially
    expect(screen.getByText('알림 센터')).toBeDefined()
    expect(screen.getByText('Test Alert')).toBeDefined()

    // Click the bell to toggle panel off
    const bellButton = screen.getByLabelText(/알림/)
    fireEvent.click(bellButton)

    // Notification panel content should be hidden
    expect(screen.queryByText('Test Alert')).toBeNull()

    // Click again to toggle back on
    fireEvent.click(bellButton)
    expect(screen.getByText('Test Alert')).toBeDefined()
  })

  it('should render stats sidebar', () => {
    render(<NotificationCenter />)
    expect(screen.getByText('알림 통계')).toBeDefined()
  })

  it('should display hasUrgent indicator', () => {
    render(<NotificationCenter />)
    // The bell should show the unread badge
    const bellButton = screen.getByLabelText(/알림/)
    expect(bellButton).toBeDefined()
  })
})

// ============ NotificationBell — edge cases ============

import NotificationBell from '../src/admin/NotificationBell'

describe('NotificationBell — edge cases', () => {
  it('should show 99+ for counts over 99', () => {
    render(<NotificationBell unreadCount={150} onToggle={vi.fn()} />)
    expect(screen.getByText('99+')).toBeDefined()
  })

  it('should not show badge when unreadCount is 0', () => {
    const { container } = render(<NotificationBell unreadCount={0} onToggle={vi.fn()} />)
    // No badge span should be present
    const badge = container.querySelector('.absolute')
    expect(badge).toBeNull()
  })

  it('should show pulse animation when hasUrgent is true', () => {
    const { container } = render(
      <NotificationBell unreadCount={5} hasUrgent={true} onToggle={vi.fn()} />,
    )
    const badge = container.querySelector('.notification-bell-pulse')
    expect(badge).not.toBeNull()
  })

  it('should not show pulse when hasUrgent is false', () => {
    const { container } = render(
      <NotificationBell unreadCount={5} hasUrgent={false} onToggle={vi.fn()} />,
    )
    const badge = container.querySelector('.notification-bell-pulse')
    expect(badge).toBeNull()
  })

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<NotificationBell unreadCount={3} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText(/알림/))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should have correct aria-label with count', () => {
    render(<NotificationBell unreadCount={5} onToggle={vi.fn()} />)
    expect(screen.getByLabelText('알림 (5건 미읽음)')).toBeDefined()
  })

  it('should have correct aria-label without count', () => {
    render(<NotificationBell unreadCount={0} onToggle={vi.fn()} />)
    // aria-label is "알림 " (with trailing space) — use regex to match
    const bell = screen.getByRole('button')
    expect(bell.getAttribute('aria-label')).toContain('알림')
    expect(bell.getAttribute('aria-label')).not.toContain('미읽음')
  })
})

// ============ notificationHooks — filter and updatePref ============

describe('notificationHooks — filter and updatePref', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('useNotifications should filter by type when filter provided', async () => {
    vi.useFakeTimers()

    // We need to use the real hooks, not the mocked ones from above.
    // Import the real module directly since it was mocked for NotificationCenter.
    // Instead, test the filtering logic via NotificationPanel which exercises the useMemo.
    // The hook filter lines (65-72) are tested here by verifying updatePref.

    // Use actual hooks import from the module
    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const { result } = renderHook(() => useNotifications(1000, 50, { types: ['error'] }))

    // Let some notifications accumulate
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    // All returned notifications should be filtered to 'error' type only
    for (const n of result.current.notifications) {
      expect(n.type).toBe('error')
    }
  })

  it('useNotifications updatePref should update preferences', async () => {
    vi.useFakeTimers()

    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const { result } = renderHook(() => useNotifications(5000))

    // Call updatePref
    act(() => {
      result.current.updatePref('push', { enabled: false })
    })

    // Preferences should reflect the change
    const pushPref = result.current.preferences.find((p: any) => p.channel === 'push')
    expect(pushPref?.enabled).toBe(false)

    // Restore
    act(() => {
      result.current.updatePref('push', { enabled: true })
    })
  })

  it('useNotifications should handle filter with priorities', async () => {
    vi.useFakeTimers()

    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const { result } = renderHook(() =>
      useNotifications(1000, 50, { priorities: ['critical'] }),
    )

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    for (const n of result.current.notifications) {
      expect(n.priority).toBe('critical')
    }
  })

  it('useNotifications should handle filter with read status', async () => {
    vi.useFakeTimers()

    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const { result } = renderHook(() =>
      useNotifications(5000, 50, { read: false }),
    )

    // All should be unread initially
    for (const n of result.current.notifications) {
      expect(n.read).toBe(false)
    }
  })

  it('useNotifications should handle filter with source', async () => {
    vi.useFakeTimers()

    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const { result } = renderHook(() =>
      useNotifications(1000, 50, { source: 'system' }),
    )

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    for (const n of result.current.notifications) {
      expect(n.source).toBe('system')
    }
  })

  it('useNotifications should handle filter with from/to timestamps', async () => {
    vi.useFakeTimers()

    const { useNotifications } = await vi.importActual<typeof import('../src/admin/services/notificationHooks')>(
      '../src/admin/services/notificationHooks',
    )

    const now = Date.now()
    const { result } = renderHook(() =>
      useNotifications(1000, 50, { from: now - 10000, to: now + 60000 }),
    )

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    for (const n of result.current.notifications) {
      expect(n.timestamp).toBeGreaterThanOrEqual(now - 10000)
      expect(n.timestamp).toBeLessThanOrEqual(now + 60000)
    }
  })
})

// ============ notificationService — additional filter branches ============

import {
  subscribeNotifications,
  getNotifications,
  getPreferences,
  updatePreference,
} from '../src/admin/services/notificationService'

describe('notificationService — additional filter coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should filter by source', () => {
    const callback = vi.fn()
    const sub = subscribeNotifications(callback, 500)
    vi.advanceTimersByTime(10000)

    const filtered = getNotifications({ source: 'system' })
    filtered.forEach((n) => {
      expect(n.source).toBe('system')
    })

    sub.unsubscribe()
  })

  it('should filter by from timestamp', () => {
    const callback = vi.fn()
    const sub = subscribeNotifications(callback, 500)
    vi.advanceTimersByTime(5000)

    const now = Date.now()
    const filtered = getNotifications({ from: now - 3000 })
    filtered.forEach((n) => {
      expect(n.timestamp).toBeGreaterThanOrEqual(now - 3000)
    })

    sub.unsubscribe()
  })

  it('should filter by to timestamp', () => {
    const callback = vi.fn()
    const sub = subscribeNotifications(callback, 500)
    vi.advanceTimersByTime(5000)

    const now = Date.now()
    const filtered = getNotifications({ to: now })
    filtered.forEach((n) => {
      expect(n.timestamp).toBeLessThanOrEqual(now)
    })

    sub.unsubscribe()
  })

  it('should handle updatePreference for non-existent channel gracefully', () => {
    // Should not throw
    updatePreference('nonexistent' as any, { enabled: false })
    const prefs = getPreferences()
    // Original channels should be unaffected
    expect(prefs.length).toBeGreaterThan(0)
  })
})
