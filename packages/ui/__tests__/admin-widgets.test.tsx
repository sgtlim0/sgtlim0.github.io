/**
 * Admin Dashboard Widgets — Unit Tests
 *
 * Covers:
 * - SystemStatusWidget: render, loading, error, status variants, formatting
 * - QuickStatsWidget: render, loading, error, change %, formatting
 * - RecentActivityWidget: render, loading, error, sorting, event types, empty state
 * - AdminDashboard: widget grid integration
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import SystemStatusWidget from '../src/admin/SystemStatusWidget'
import type { SystemStatusItem } from '../src/admin/SystemStatusWidget'
import QuickStatsWidget from '../src/admin/QuickStatsWidget'
import type { QuickStat } from '../src/admin/QuickStatsWidget'
import RecentActivityWidget from '../src/admin/RecentActivityWidget'
import type { ActivityEvent } from '../src/admin/RecentActivityWidget'

// ===================== SystemStatusWidget =====================

describe('SystemStatusWidget', () => {
  const healthyItems: SystemStatusItem[] = [
    { name: 'API Gateway', status: 'healthy', responseTime: 42, uptime: 99.98, lastChecked: '2026-03-10 14:30:00' },
    { name: 'Auth Service', status: 'healthy', responseTime: 18, uptime: 99.99, lastChecked: '2026-03-10 14:30:00' },
  ]

  const mixedItems: SystemStatusItem[] = [
    { name: 'API Gateway', status: 'healthy', responseTime: 42, uptime: 99.98, lastChecked: '2026-03-10 14:30:00' },
    { name: 'LLM Proxy', status: 'degraded', responseTime: 890, uptime: 98.50, lastChecked: '2026-03-10 14:29:55' },
  ]

  const unhealthyItems: SystemStatusItem[] = [
    { name: 'Redis Cache', status: 'unhealthy', responseTime: 0, uptime: 95.20, lastChecked: '2026-03-10 14:28:00' },
  ]

  it('should render with default items', () => {
    render(<SystemStatusWidget />)
    expect(screen.getByText('시스템 상태')).toBeDefined()
    expect(screen.getByText('API Gateway')).toBeDefined()
  })

  it('should render custom items', () => {
    render(<SystemStatusWidget items={healthyItems} />)
    expect(screen.getByText('API Gateway')).toBeDefined()
    expect(screen.getByText('Auth Service')).toBeDefined()
  })

  it('should show overall healthy status when all items are healthy', () => {
    render(<SystemStatusWidget items={healthyItems} />)
    expect(screen.getByText('정상')).toBeDefined()
  })

  it('should show overall degraded status when any item is degraded', () => {
    render(<SystemStatusWidget items={mixedItems} />)
    expect(screen.getByText('지연')).toBeDefined()
  })

  it('should show overall unhealthy status when any item is unhealthy', () => {
    render(<SystemStatusWidget items={unhealthyItems} />)
    expect(screen.getByText('장애')).toBeDefined()
  })

  it('should format response time in ms', () => {
    render(<SystemStatusWidget items={healthyItems} />)
    expect(screen.getByText('42ms')).toBeDefined()
    expect(screen.getByText('18ms')).toBeDefined()
  })

  it('should show dash for zero response time', () => {
    render(<SystemStatusWidget items={unhealthyItems} />)
    expect(screen.getByText('-')).toBeDefined()
  })

  it('should format uptime as percentage', () => {
    render(<SystemStatusWidget items={healthyItems} />)
    expect(screen.getByText('99.98%')).toBeDefined()
    expect(screen.getByText('99.99%')).toBeDefined()
  })

  it('should format last checked time as HH:MM:SS', () => {
    render(<SystemStatusWidget items={healthyItems} />)
    const timeElements = screen.getAllByText('14:30:00')
    expect(timeElements.length).toBe(2)
  })

  it('should render loading state', () => {
    render(<SystemStatusWidget loading />)
    expect(screen.getByText('시스템 상태')).toBeDefined()
    expect(screen.getByTestId('system-status-loading')).toBeDefined()
  })

  it('should render error state', () => {
    render(<SystemStatusWidget error="연결 실패" />)
    expect(screen.getByText('시스템 상태')).toBeDefined()
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText('연결 실패')).toBeDefined()
  })

  it('should not render items when loading', () => {
    render(<SystemStatusWidget loading items={healthyItems} />)
    expect(screen.queryByText('API Gateway')).toBeNull()
  })

  it('should not render items when error', () => {
    render(<SystemStatusWidget error="에러" items={healthyItems} />)
    expect(screen.queryByText('API Gateway')).toBeNull()
  })
})

// ===================== QuickStatsWidget =====================

describe('QuickStatsWidget', () => {
  const customStats: QuickStat[] = [
    { label: '활성 사용자', value: 200, previousValue: 180 },
    { label: '대화 수', value: 1000, previousValue: 1000 },
    { label: 'API 호출', value: 50_000, previousValue: 60_000, format: 'compact' },
    { label: '응답 시간', value: 300, previousValue: 0 },
  ]

  it('should render with default stats', () => {
    render(<QuickStatsWidget />)
    expect(screen.getByText('오늘의 현황')).toBeDefined()
    expect(screen.getByText('오늘 활성 사용자')).toBeDefined()
  })

  it('should render custom stats', () => {
    render(<QuickStatsWidget stats={customStats} />)
    expect(screen.getByText('활성 사용자')).toBeDefined()
    expect(screen.getByText('대화 수')).toBeDefined()
  })

  it('should display positive change with + prefix', () => {
    const stats: QuickStat[] = [
      { label: 'Users', value: 110, previousValue: 100 },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('+10.0% 전일 대비')).toBeDefined()
  })

  it('should display negative change without + prefix', () => {
    const stats: QuickStat[] = [
      { label: 'Users', value: 90, previousValue: 100 },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('-10.0% 전일 대비')).toBeDefined()
  })

  it('should display zero change when values are equal', () => {
    const stats: QuickStat[] = [
      { label: 'Users', value: 100, previousValue: 100 },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('0.0% 전일 대비')).toBeDefined()
  })

  it('should handle zero previous value gracefully', () => {
    const stats: QuickStat[] = [
      { label: 'Users', value: 100, previousValue: 0 },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('0.0% 전일 대비')).toBeDefined()
  })

  it('should format compact values with K suffix', () => {
    const stats: QuickStat[] = [
      { label: 'Calls', value: 45_892, previousValue: 42_000, format: 'compact' },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('45.9K')).toBeDefined()
  })

  it('should format compact values with M suffix', () => {
    const stats: QuickStat[] = [
      { label: 'Tokens', value: 2_500_000, previousValue: 2_000_000, format: 'compact' },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('2.5M')).toBeDefined()
  })

  it('should format number values with locale string', () => {
    const stats: QuickStat[] = [
      { label: 'Users', value: 1_234, previousValue: 1_000 },
    ]
    render(<QuickStatsWidget stats={stats} />)
    expect(screen.getByText('1,234')).toBeDefined()
  })

  it('should render loading state', () => {
    render(<QuickStatsWidget loading />)
    expect(screen.getByText('오늘의 현황')).toBeDefined()
    expect(screen.getByTestId('quick-stats-loading')).toBeDefined()
  })

  it('should render error state', () => {
    render(<QuickStatsWidget error="데이터 로딩 실패" />)
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText('데이터 로딩 실패')).toBeDefined()
  })

  it('should not render stats when loading', () => {
    render(<QuickStatsWidget loading stats={customStats} />)
    expect(screen.queryByText('200')).toBeNull()
  })
})

// ===================== RecentActivityWidget =====================

describe('RecentActivityWidget', () => {
  const now = Date.now()

  const customEvents: ActivityEvent[] = [
    { id: 'e1', type: 'login', message: '관리자 로그인', user: 'admin@hchat.ai', timestamp: now - 30_000 },
    { id: 'e2', type: 'settings', message: '설정 변경', user: 'admin@hchat.ai', timestamp: now - 120_000 },
    { id: 'e3', type: 'error', message: 'API 오류', user: 'system', timestamp: now - 600_000 },
    { id: 'e4', type: 'user', message: '사용자 등록', user: 'hr@hchat.ai', timestamp: now - 3_600_000 },
    { id: 'e5', type: 'api', message: 'API 키 발급', user: 'dev@hchat.ai', timestamp: now - 7_200_000 },
    { id: 'e6', type: 'deploy', message: '배포 완료', user: 'ci-bot', timestamp: now - 90_000_000 },
  ]

  it('should render with default events', () => {
    render(<RecentActivityWidget />)
    expect(screen.getByText('최근 활동')).toBeDefined()
  })

  it('should render custom events', () => {
    render(<RecentActivityWidget events={customEvents} />)
    expect(screen.getByText('관리자 로그인')).toBeDefined()
    expect(screen.getByText('설정 변경')).toBeDefined()
  })

  it('should sort events by timestamp descending (newest first)', () => {
    const { container } = render(<RecentActivityWidget events={customEvents} />)
    const messages = container.querySelectorAll('.text-sm.text-text-primary.truncate')
    expect(messages[0].textContent).toBe('관리자 로그인')
    expect(messages[1].textContent).toBe('설정 변경')
  })

  it('should limit events to maxItems', () => {
    render(<RecentActivityWidget events={customEvents} maxItems={3} />)
    expect(screen.getByText('최근 3건')).toBeDefined()
    expect(screen.getByText('관리자 로그인')).toBeDefined()
    expect(screen.queryByText('사용자 등록')).toBeNull()
  })

  it('should render correct icons for each event type', () => {
    const events: ActivityEvent[] = [
      { id: '1', type: 'login', message: 'Login', user: 'u', timestamp: now },
      { id: '2', type: 'settings', message: 'Settings', user: 'u', timestamp: now - 1000 },
      { id: '3', type: 'error', message: 'Error', user: 'u', timestamp: now - 2000 },
      { id: '4', type: 'user', message: 'User', user: 'u', timestamp: now - 3000 },
      { id: '5', type: 'api', message: 'API', user: 'u', timestamp: now - 4000 },
      { id: '6', type: 'deploy', message: 'Deploy', user: 'u', timestamp: now - 5000 },
    ]
    const { container } = render(<RecentActivityWidget events={events} />)
    const icons = container.querySelectorAll('.w-7.h-7')
    expect(icons[0].textContent).toBe('L')
    expect(icons[1].textContent).toBe('S')
    expect(icons[2].textContent).toBe('!')
    expect(icons[3].textContent).toBe('U')
    expect(icons[4].textContent).toBe('A')
    expect(icons[5].textContent).toBe('D')
  })

  it('should show relative time: 방금 전', () => {
    const events: ActivityEvent[] = [
      { id: '1', type: 'login', message: 'Recent', user: 'u', timestamp: Date.now() - 10_000 },
    ]
    const { container } = render(<RecentActivityWidget events={events} />)
    expect(container.textContent).toContain('방금 전')
  })

  it('should show relative time: 분 전', () => {
    const events: ActivityEvent[] = [
      { id: '1', type: 'login', message: 'Minutes', user: 'u', timestamp: Date.now() - 300_000 },
    ]
    const { container } = render(<RecentActivityWidget events={events} />)
    expect(container.textContent).toContain('분 전')
  })

  it('should show relative time: 시간 전', () => {
    const events: ActivityEvent[] = [
      { id: '1', type: 'login', message: 'Hours', user: 'u', timestamp: Date.now() - 7_200_000 },
    ]
    const { container } = render(<RecentActivityWidget events={events} />)
    expect(container.textContent).toContain('시간 전')
  })

  it('should show relative time: 일 전', () => {
    const events: ActivityEvent[] = [
      { id: '1', type: 'login', message: 'Days', user: 'u', timestamp: Date.now() - 172_800_000 },
    ]
    const { container } = render(<RecentActivityWidget events={events} />)
    expect(container.textContent).toContain('일 전')
  })

  it('should show user names', () => {
    render(<RecentActivityWidget events={customEvents} />)
    const adminElements = screen.getAllByText('admin@hchat.ai')
    expect(adminElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('system')).toBeDefined()
  })

  it('should render empty state', () => {
    render(<RecentActivityWidget events={[]} />)
    expect(screen.getByText('활동 내역이 없습니다')).toBeDefined()
  })

  it('should render loading state', () => {
    render(<RecentActivityWidget loading />)
    expect(screen.getByText('최근 활동')).toBeDefined()
    expect(screen.getByTestId('recent-activity-loading')).toBeDefined()
  })

  it('should render error state', () => {
    render(<RecentActivityWidget error="데이터 로딩 실패" />)
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText('데이터 로딩 실패')).toBeDefined()
  })

  it('should not render events when loading', () => {
    render(<RecentActivityWidget loading events={customEvents} />)
    expect(screen.queryByText('관리자 로그인')).toBeNull()
  })

  it('should not mutate the original events array', () => {
    const events: ActivityEvent[] = [
      { id: '2', type: 'login', message: 'B', user: 'u', timestamp: now - 1000 },
      { id: '1', type: 'login', message: 'A', user: 'u', timestamp: now },
    ]
    const originalOrder = [...events]
    render(<RecentActivityWidget events={events} />)
    expect(events[0].id).toBe(originalOrder[0].id)
    expect(events[1].id).toBe(originalOrder[1].id)
  })
})

// ===================== AdminDashboard — widget integration =====================

describe('AdminDashboard — widget grid integration', () => {
  it('should render all three widgets in the dashboard', async () => {
    // Dynamic import to avoid issues with module mock from other test files
    const { default: AdminDashboard } = await import('../src/admin/AdminDashboard')
    render(<AdminDashboard />)

    // Existing elements still present
    expect(screen.getByText('관리자 대시보드')).toBeDefined()
    expect(screen.getByText('총 대화 수')).toBeDefined()

    // New widgets
    expect(screen.getByText('시스템 상태')).toBeDefined()
    expect(screen.getByText('오늘의 현황')).toBeDefined()
    expect(screen.getByText('최근 활동')).toBeDefined()
  })
})
