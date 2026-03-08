/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LiveMetricCard } from '../src/admin/LiveMetricCard'
import { LiveActivityFeed } from '../src/admin/LiveActivityFeed'
import { LiveModelDistribution } from '../src/admin/LiveModelDistribution'
import { LiveLineChart } from '../src/admin/LiveLineChart'
import TenantSelector from '../src/admin/TenantSelector'
import TenantManagement from '../src/admin/TenantManagement'
import NotificationPanel from '../src/admin/NotificationPanel'
import NotificationPreferences from '../src/admin/NotificationPreferences'
import WidgetCatalogPanel from '../src/admin/WidgetCatalogPanel'
import WidgetRenderer from '../src/admin/WidgetRenderer'
import WorkflowCanvas from '../src/admin/WorkflowCanvas'
import WorkflowNodeCatalog from '../src/admin/WorkflowNodeCatalog'
import WorkflowTemplateGallery from '../src/admin/WorkflowTemplateGallery'
import type { RealtimeMetric, RealtimeActivity, RealtimeDataPoint } from '../src/admin/services/realtimeTypes'
import type { Tenant } from '../src/admin/services/tenantTypes'
import type { Notification, NotificationPreference as NotifPref } from '../src/admin/services/notificationTypes'
import type { WidgetCatalogItem } from '../src/admin/services/widgetTypes'
import type { WorkflowNode, WorkflowEdge, WorkflowTemplate, NodeCatalogItem } from '../src/admin/services/workflowTypes'

// ============ LiveMetricCard ============
describe('LiveMetricCard', () => {
  const makeMetric = (overrides: Partial<RealtimeMetric> = {}): RealtimeMetric => ({
    id: 'm1',
    label: 'Active Users',
    value: 1247,
    previousValue: 1100,
    unit: '',
    trend: 'up',
    changePercent: 13.4,
    ...overrides,
  })

  it('should render label', () => {
    render(<LiveMetricCard metric={makeMetric()} />)
    expect(screen.getByText('Active Users')).toBeDefined()
  })

  it('should render value', () => {
    render(<LiveMetricCard metric={makeMetric()} />)
    expect(screen.getByText('1,247')).toBeDefined()
  })

  it('should render percentage value with %', () => {
    render(<LiveMetricCard metric={makeMetric({ value: 98.5, unit: '%' })} />)
    expect(screen.getByText('98.5%')).toBeDefined()
  })

  it('should render ms value', () => {
    render(<LiveMetricCard metric={makeMetric({ value: 250, unit: 'ms' })} />)
    expect(screen.getByText('250ms')).toBeDefined()
  })

  it('should show up arrow for up trend', () => {
    const { container } = render(<LiveMetricCard metric={makeMetric({ trend: 'up' })} />)
    expect(container.textContent).toContain('\u2191')
  })

  it('should show down arrow for down trend', () => {
    const { container } = render(<LiveMetricCard metric={makeMetric({ trend: 'down' })} />)
    expect(container.textContent).toContain('\u2193')
  })

  it('should show right arrow for stable trend', () => {
    const { container } = render(<LiveMetricCard metric={makeMetric({ trend: 'stable' })} />)
    expect(container.textContent).toContain('\u2192')
  })

  it('should render change percent', () => {
    render(<LiveMetricCard metric={makeMetric({ changePercent: 13.4 })} />)
    expect(screen.getByText('+13.4%')).toBeDefined()
  })

  it('should render negative change percent without +', () => {
    render(<LiveMetricCard metric={makeMetric({ changePercent: -5.2 })} />)
    expect(screen.getByText('-5.2%')).toBeDefined()
  })
})

// ============ LiveActivityFeed ============
describe('LiveActivityFeed', () => {
  const makeActivity = (overrides: Partial<RealtimeActivity> = {}): RealtimeActivity => ({
    id: 'act-1',
    type: 'query',
    user: 'hong@hyundai.com',
    message: 'GPT-4o 모델 쿼리',
    timestamp: Date.now() - 30000,
    ...overrides,
  })

  it('should render header', () => {
    render(<LiveActivityFeed activities={[]} />)
    expect(screen.getByText('Live Activity')).toBeDefined()
  })

  it('should show empty state when no activities', () => {
    render(<LiveActivityFeed activities={[]} />)
    expect(screen.getByText('No recent activity')).toBeDefined()
  })

  it('should render activity user', () => {
    render(<LiveActivityFeed activities={[makeActivity()]} />)
    expect(screen.getByText('hong@hyundai.com')).toBeDefined()
  })

  it('should render activity message', () => {
    render(<LiveActivityFeed activities={[makeActivity()]} />)
    expect(screen.getByText('GPT-4o 모델 쿼리')).toBeDefined()
  })

  it('should render multiple activities', () => {
    const activities = [
      makeActivity({ id: 'a1', user: 'user1' }),
      makeActivity({ id: 'a2', user: 'user2' }),
    ]
    render(<LiveActivityFeed activities={activities} />)
    expect(screen.getByText('user1')).toBeDefined()
    expect(screen.getByText('user2')).toBeDefined()
  })

  it('should render type icon for each activity type', () => {
    const types = ['query', 'login', 'error', 'model_switch', 'upload'] as const
    types.forEach((type, i) => {
      const { container } = render(
        <LiveActivityFeed activities={[makeActivity({ id: `t-${i}`, type })]} />,
      )
      expect(container.textContent).toBeDefined()
    })
  })
})

// ============ LiveModelDistribution ============
describe('LiveModelDistribution', () => {
  const distribution = [
    { model: 'GPT-4o', count: 450, percentage: 45 },
    { model: 'Claude 3.5', count: 300, percentage: 30 },
    { model: 'Gemini', count: 150, percentage: 15 },
  ]

  it('should render title', () => {
    render(<LiveModelDistribution distribution={distribution} />)
    expect(screen.getByText('Model Distribution')).toBeDefined()
  })

  it('should render model names', () => {
    render(<LiveModelDistribution distribution={distribution} />)
    expect(screen.getByText('GPT-4o')).toBeDefined()
    expect(screen.getByText('Claude 3.5')).toBeDefined()
  })

  it('should render total count', () => {
    render(<LiveModelDistribution distribution={distribution} />)
    expect(screen.getByText('900')).toBeDefined()
  })

  it('should render percentages', () => {
    render(<LiveModelDistribution distribution={distribution} />)
    expect(screen.getByText('45.0%')).toBeDefined()
    expect(screen.getByText('30.0%')).toBeDefined()
  })

  it('should render SVG donut chart', () => {
    const { container } = render(<LiveModelDistribution distribution={distribution} />)
    expect(container.querySelector('svg')).toBeDefined()
  })
})

// ============ LiveLineChart ============
describe('LiveLineChart', () => {
  const makeData = (count = 5): RealtimeDataPoint[] =>
    Array.from({ length: count }, (_, i) => ({
      timestamp: Date.now() - (count - i) * 60000,
      value: 100 + i * 10,
    }))

  it('should return null for empty data', () => {
    const { container } = render(<LiveLineChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render SVG with data', () => {
    const { container } = render(<LiveLineChart data={makeData()} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('should render label when provided', () => {
    render(<LiveLineChart data={makeData()} label="Queries/min" />)
    expect(screen.getByText('Queries/min')).toBeDefined()
  })

  it('should not render label when not provided', () => {
    render(<LiveLineChart data={makeData()} />)
    expect(screen.queryByText('Queries/min')).toBeNull()
  })

  it('should render polyline', () => {
    const { container } = render(<LiveLineChart data={makeData()} />)
    expect(container.querySelector('polyline')).toBeDefined()
  })

  it('should render data point circles', () => {
    const { container } = render(<LiveLineChart data={makeData(3)} />)
    const circles = container.querySelectorAll('circle.cursor-pointer')
    expect(circles.length).toBe(3)
  })
})

// ============ TenantSelector ============
describe('TenantSelector', () => {
  const makeTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
    id: 'tenant-1',
    name: 'Hyundai Motors',
    domain: 'hyundai.com',
    logo: 'H',
    theme: { primaryColor: '#003DA5', accentColor: '#0078D4', sidebarBg: '#f5f5f5', headerBg: '#fff' },
    plan: 'enterprise',
    maxUsers: 5000,
    activeUsers: 3200,
    createdAt: '2025-01-01',
    status: 'active',
    ...overrides,
  })

  it('should render tenant names', () => {
    const tenants = [makeTenant(), makeTenant({ id: 't2', name: 'Kia' })]
    render(<TenantSelector tenants={tenants} activeTenantId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Hyundai Motors')).toBeDefined()
    expect(screen.getByText('Kia')).toBeDefined()
  })

  it('should render plan badges', () => {
    render(<TenantSelector tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Enterprise')).toBeDefined()
  })

  it('should render domain', () => {
    render(<TenantSelector tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('hyundai.com')).toBeDefined()
  })

  it('should render user counts', () => {
    render(<TenantSelector tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('3,200/5,000')).toBeDefined()
  })

  it('should call onSelect when tenant clicked', () => {
    const onSelect = vi.fn()
    render(<TenantSelector tenants={[makeTenant()]} activeTenantId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Hyundai Motors'))
    expect(onSelect).toHaveBeenCalledWith('tenant-1')
  })
})

// ============ TenantManagement ============
describe('TenantManagement', () => {
  const makeTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
    id: 'tenant-1',
    name: 'Hyundai',
    domain: 'hyundai.com',
    logo: 'H',
    theme: { primaryColor: '#003DA5', accentColor: '#0078D4', sidebarBg: '#f5f5f5', headerBg: '#fff' },
    plan: 'enterprise',
    maxUsers: 5000,
    activeUsers: 3200,
    createdAt: '2025-01-01',
    status: 'active',
    ...overrides,
  })

  it('should render title', () => {
    render(
      <TenantManagement tenants={[]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText('테넌트 관리')).toBeDefined()
  })

  it('should render tenant count', () => {
    const tenants = [makeTenant(), makeTenant({ id: 't2', name: 'Kia', status: 'trial' })]
    render(
      <TenantManagement tenants={tenants} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText(/2개 조직/)).toBeDefined()
  })

  it('should render tenant names in table', () => {
    render(
      <TenantManagement tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText('Hyundai')).toBeDefined()
  })

  it('should filter tenants by search', () => {
    const tenants = [makeTenant(), makeTenant({ id: 't2', name: 'Kia', domain: 'kia.com' })]
    render(
      <TenantManagement tenants={tenants} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    const searchInput = screen.getByLabelText('테넌트 검색')
    fireEvent.change(searchInput, { target: { value: 'Kia' } })
    expect(screen.getByText('Kia')).toBeDefined()
    expect(screen.queryByText('Hyundai')).toBeNull()
  })

  it('should show empty state when search has no results', () => {
    render(
      <TenantManagement tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    const searchInput = screen.getByLabelText('테넌트 검색')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeDefined()
  })

  it('should call onSelect when 전환 clicked', () => {
    const onSelect = vi.fn()
    render(
      <TenantManagement tenants={[makeTenant()]} activeTenantId={null} onSelect={onSelect} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('전환'))
    expect(onSelect).toHaveBeenCalledWith('tenant-1')
  })

  it('should call onDelete when 삭제 clicked', () => {
    const onDelete = vi.fn()
    render(
      <TenantManagement tenants={[makeTenant()]} activeTenantId={null} onSelect={vi.fn()} onDelete={onDelete} onUpdate={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('삭제'))
    expect(onDelete).toHaveBeenCalledWith('tenant-1')
  })

  it('should show 정지 button for active tenants', () => {
    render(
      <TenantManagement tenants={[makeTenant({ status: 'active' })]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText('정지')).toBeDefined()
  })

  it('should show 활성화 button for suspended tenants', () => {
    render(
      <TenantManagement tenants={[makeTenant({ status: 'suspended' })]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText('활성화')).toBeDefined()
  })

  it('should call onUpdate to suspend active tenant', () => {
    const onUpdate = vi.fn()
    render(
      <TenantManagement tenants={[makeTenant({ status: 'active' })]} activeTenantId={null} onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={onUpdate} />,
    )
    fireEvent.click(screen.getByText('정지'))
    expect(onUpdate).toHaveBeenCalledWith('tenant-1', 'suspended')
  })

  it('should show 선택됨 when tenant is active', () => {
    render(
      <TenantManagement tenants={[makeTenant()]} activeTenantId="tenant-1" onSelect={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByText('선택됨')).toBeDefined()
  })
})

// ============ NotificationPanel ============
describe('NotificationPanel', () => {
  const makeNotif = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    type: 'info',
    priority: 'medium',
    title: 'System Update',
    message: 'A new version is available.',
    source: 'System',
    timestamp: Date.now() - 120000,
    read: false,
    channels: ['push'],
    ...overrides,
  })

  it('should render header', () => {
    render(<NotificationPanel notifications={[]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />)
    expect(screen.getByText('알림')).toBeDefined()
  })

  it('should show empty state when no notifications', () => {
    render(<NotificationPanel notifications={[]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />)
    expect(screen.getByText('새 알림이 없습니다')).toBeDefined()
  })

  it('should render notification title', () => {
    render(
      <NotificationPanel notifications={[makeNotif()]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.getByText('System Update')).toBeDefined()
  })

  it('should render notification message', () => {
    render(
      <NotificationPanel notifications={[makeNotif()]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.getByText('A new version is available.')).toBeDefined()
  })

  it('should show unread count badge', () => {
    const notifications = [makeNotif({ read: false }), makeNotif({ id: 'n2', read: true })]
    render(
      <NotificationPanel notifications={notifications} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.getByText('1')).toBeDefined()
  })

  it('should show mark-all-read button when unread exist', () => {
    render(
      <NotificationPanel notifications={[makeNotif()]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.getByText('모두 읽음')).toBeDefined()
  })

  it('should not show mark-all-read when all read', () => {
    render(
      <NotificationPanel notifications={[makeNotif({ read: true })]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.queryByText('모두 읽음')).toBeNull()
  })

  it('should call onMarkAllRead when button clicked', () => {
    const onMarkAllRead = vi.fn()
    render(
      <NotificationPanel notifications={[makeNotif()]} onMarkRead={vi.fn()} onMarkAllRead={onMarkAllRead} />,
    )
    fireEvent.click(screen.getByText('모두 읽음'))
    expect(onMarkAllRead).toHaveBeenCalled()
  })

  it('should call onMarkRead when unread notification clicked', () => {
    const onMarkRead = vi.fn()
    render(
      <NotificationPanel notifications={[makeNotif()]} onMarkRead={onMarkRead} onMarkAllRead={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('System Update'))
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')
  })

  it('should render filter tabs', () => {
    render(
      <NotificationPanel notifications={[]} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    expect(screen.getByText('전체')).toBeDefined()
    expect(screen.getByText('정보')).toBeDefined()
    expect(screen.getByText('경고')).toBeDefined()
    expect(screen.getByText('오류')).toBeDefined()
    expect(screen.getByText('성공')).toBeDefined()
  })

  it('should filter notifications by type', () => {
    const notifications = [
      makeNotif({ id: 'n1', type: 'info', title: 'Info Notif' }),
      makeNotif({ id: 'n2', type: 'error', title: 'Error Notif' }),
    ]
    render(
      <NotificationPanel notifications={notifications} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('오류'))
    expect(screen.getByText('Error Notif')).toBeDefined()
    expect(screen.queryByText('Info Notif')).toBeNull()
  })
})

// ============ NotificationPreferences ============
describe('NotificationPreferences', () => {
  const makePref = (overrides: Partial<NotifPref> = {}): NotifPref => ({
    channel: 'push',
    enabled: true,
    types: ['info', 'warning', 'error', 'success'],
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    ...overrides,
  })

  it('should render header', () => {
    render(<NotificationPreferences preferences={[makePref()]} onUpdate={vi.fn()} />)
    expect(screen.getByText('알림 설정')).toBeDefined()
  })

  it('should render channel name', () => {
    render(<NotificationPreferences preferences={[makePref({ channel: 'push' })]} onUpdate={vi.fn()} />)
    expect(screen.getByText('Push')).toBeDefined()
  })

  it('should render active count', () => {
    const prefs = [makePref({ channel: 'push', enabled: true }), makePref({ channel: 'email', enabled: false })]
    render(<NotificationPreferences preferences={prefs} onUpdate={vi.fn()} />)
    expect(screen.getByText('1/2 활성')).toBeDefined()
  })

  it('should call onUpdate when toggle clicked', () => {
    const onUpdate = vi.fn()
    render(<NotificationPreferences preferences={[makePref({ channel: 'push', enabled: true })]} onUpdate={onUpdate} />)
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(onUpdate).toHaveBeenCalledWith('push', { enabled: false })
  })

  it('should render type filter buttons when enabled', () => {
    render(<NotificationPreferences preferences={[makePref({ enabled: true })]} onUpdate={vi.fn()} />)
    expect(screen.getByText('정보')).toBeDefined()
    expect(screen.getByText('경고')).toBeDefined()
  })
})

// ============ WidgetCatalogPanel ============
describe('WidgetCatalogPanel', () => {
  const makeCatalogItem = (overrides: Partial<WidgetCatalogItem> = {}): WidgetCatalogItem => ({
    type: 'metric-card',
    name: 'Metric Card',
    description: 'Shows a single metric value',
    icon: '📊',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'monitoring',
    ...overrides,
  })

  it('should render title', () => {
    render(<WidgetCatalogPanel catalog={[]} onAdd={vi.fn()} />)
    expect(screen.getByText('위젯 추가')).toBeDefined()
  })

  it('should render catalog items', () => {
    render(<WidgetCatalogPanel catalog={[makeCatalogItem()]} onAdd={vi.fn()} />)
    expect(screen.getByText('Metric Card')).toBeDefined()
  })

  it('should render item description', () => {
    render(<WidgetCatalogPanel catalog={[makeCatalogItem()]} onAdd={vi.fn()} />)
    expect(screen.getByText('Shows a single metric value')).toBeDefined()
  })

  it('should call onAdd when add button clicked', () => {
    const onAdd = vi.fn()
    render(<WidgetCatalogPanel catalog={[makeCatalogItem()]} onAdd={onAdd} />)
    fireEvent.click(screen.getByText('추가'))
    expect(onAdd).toHaveBeenCalledWith('metric-card')
  })

  it('should filter by search', () => {
    const items = [
      makeCatalogItem({ type: 'metric-card', name: 'Metric Card' }),
      makeCatalogItem({ type: 'line-chart', name: 'Line Chart', category: 'analytics' }),
    ]
    render(<WidgetCatalogPanel catalog={items} onAdd={vi.fn()} />)
    const input = screen.getByPlaceholderText('위젯 검색...')
    fireEvent.change(input, { target: { value: 'Line' } })
    expect(screen.getByText('Line Chart')).toBeDefined()
    expect(screen.queryByText('Metric Card')).toBeNull()
  })

  it('should show empty state when no results', () => {
    render(<WidgetCatalogPanel catalog={[makeCatalogItem()]} onAdd={vi.fn()} />)
    const input = screen.getByPlaceholderText('위젯 검색...')
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeDefined()
  })
})

// ============ WidgetRenderer ============
describe('WidgetRenderer', () => {
  it('should render metric-card widget', () => {
    const { container } = render(<WidgetRenderer type="metric-card" />)
    expect(container.textContent).toContain('12,847')
  })

  it('should render line-chart widget', () => {
    const { container } = render(<WidgetRenderer type="line-chart" />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('should render bar-chart widget', () => {
    render(<WidgetRenderer type="bar-chart" />)
    expect(screen.getByText('GPT-4')).toBeDefined()
    expect(screen.getByText('Claude')).toBeDefined()
  })

  it('should render donut-chart widget', () => {
    const { container } = render(<WidgetRenderer type="donut-chart" />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('should render activity-feed widget', () => {
    render(<WidgetRenderer type="activity-feed" />)
    expect(screen.getByText(/admin@hchat.ai/)).toBeDefined()
  })

  it('should render model-distribution widget', () => {
    render(<WidgetRenderer type="model-distribution" />)
    expect(screen.getByText('GPT-4o')).toBeDefined()
  })

  it('should render notification-summary widget', () => {
    render(<WidgetRenderer type="notification-summary" />)
    expect(screen.getByText('긴급')).toBeDefined()
  })

  it('should render user-stats widget', () => {
    render(<WidgetRenderer type="user-stats" />)
    expect(screen.getByText('1,247')).toBeDefined()
  })

  it('should render quick-actions widget', () => {
    render(<WidgetRenderer type="quick-actions" />)
    expect(screen.getByText('사용자 추가')).toBeDefined()
  })

  it('should render status-overview widget', () => {
    render(<WidgetRenderer type="status-overview" />)
    expect(screen.getByText('API 서버')).toBeDefined()
  })

  it('should render unknown widget fallback', () => {
    render(<WidgetRenderer type={'unknown-type' as any} />)
    expect(screen.getByText(/Unknown widget/)).toBeDefined()
  })
})

// ============ WorkflowCanvas ============
describe('WorkflowCanvas', () => {
  const makeNode = (overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
    id: 'node-1',
    type: 'llm',
    label: 'GPT-4o Call',
    description: 'Calls LLM',
    position: { x: 100, y: 100 },
    config: {},
    status: 'idle',
    ...overrides,
  })

  const makeEdge = (overrides: Partial<WorkflowEdge> = {}): WorkflowEdge => ({
    id: 'edge-1',
    sourceId: 'node-1',
    targetId: 'node-2',
    ...overrides,
  })

  it('should render empty state when no nodes', () => {
    render(<WorkflowCanvas nodes={[]} edges={[]} />)
    expect(screen.getByText(/노드를 추가하여/)).toBeDefined()
  })

  it('should render node cards', () => {
    render(<WorkflowCanvas nodes={[makeNode()]} edges={[]} />)
    expect(screen.getByText('GPT-4o Call')).toBeDefined()
  })

  it('should render SVG with edges', () => {
    const nodes = [
      makeNode({ id: 'n1', position: { x: 100, y: 100 } }),
      makeNode({ id: 'n2', label: 'Transform', position: { x: 100, y: 300 } }),
    ]
    const edges = [makeEdge({ sourceId: 'n1', targetId: 'n2' })]
    const { container } = render(<WorkflowCanvas nodes={nodes} edges={edges} />)
    expect(container.querySelector('path')).toBeDefined()
  })

  it('should call onSelectNode when node card is clicked', () => {
    const onSelect = vi.fn()
    render(<WorkflowCanvas nodes={[makeNode()]} edges={[]} onSelectNode={onSelect} />)
    fireEvent.click(screen.getByText('GPT-4o Call'))
    expect(onSelect).toHaveBeenCalledWith('node-1')
  })

  it('should render edge labels', () => {
    const nodes = [
      makeNode({ id: 'n1', position: { x: 100, y: 100 } }),
      makeNode({ id: 'n2', label: 'Out', position: { x: 100, y: 300 } }),
    ]
    const edges = [makeEdge({ sourceId: 'n1', targetId: 'n2', label: 'success' })]
    render(<WorkflowCanvas nodes={nodes} edges={edges} />)
    expect(screen.getByText('success')).toBeDefined()
  })
})

// ============ WorkflowNodeCatalog ============
describe('WorkflowNodeCatalog', () => {
  const makeCatalogNode = (overrides: Partial<NodeCatalogItem> = {}): NodeCatalogItem => ({
    type: 'llm',
    name: 'LLM Call',
    description: 'Calls an LLM model',
    icon: '🤖',
    category: 'processing',
    configSchema: [],
    ...overrides,
  })

  it('should render title', () => {
    render(<WorkflowNodeCatalog catalog={[]} onAddNode={vi.fn()} />)
    expect(screen.getByText('노드 추가')).toBeDefined()
  })

  it('should render catalog items', () => {
    render(<WorkflowNodeCatalog catalog={[makeCatalogNode()]} onAddNode={vi.fn()} />)
    expect(screen.getByText('LLM Call')).toBeDefined()
  })

  it('should render item description', () => {
    render(<WorkflowNodeCatalog catalog={[makeCatalogNode()]} onAddNode={vi.fn()} />)
    expect(screen.getByText('Calls an LLM model')).toBeDefined()
  })

  it('should call onAddNode when add button clicked', () => {
    const onAddNode = vi.fn()
    render(<WorkflowNodeCatalog catalog={[makeCatalogNode()]} onAddNode={onAddNode} />)
    fireEvent.click(screen.getByText('추가'))
    expect(onAddNode).toHaveBeenCalledWith('llm')
  })

  it('should filter by search', () => {
    const items = [
      makeCatalogNode({ type: 'llm', name: 'LLM Call' }),
      makeCatalogNode({ type: 'input', name: 'Input Node', category: 'input-output' }),
    ]
    render(<WorkflowNodeCatalog catalog={items} onAddNode={vi.fn()} />)
    const input = screen.getByPlaceholderText('노드 검색...')
    fireEvent.change(input, { target: { value: 'Input' } })
    expect(screen.getByText('Input Node')).toBeDefined()
    expect(screen.queryByText('LLM Call')).toBeNull()
  })

  it('should show empty state for no results', () => {
    render(<WorkflowNodeCatalog catalog={[makeCatalogNode()]} onAddNode={vi.fn()} />)
    const input = screen.getByPlaceholderText('노드 검색...')
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeDefined()
  })
})

// ============ WorkflowTemplateGallery ============
describe('WorkflowTemplateGallery', () => {
  const makeTemplate = (overrides: Partial<WorkflowTemplate> = {}): WorkflowTemplate => ({
    id: 'tpl-1',
    name: 'RAG Pipeline',
    description: 'A basic RAG workflow template',
    category: 'rag',
    nodes: [
      { id: 'n1', type: 'input', label: 'Input', description: '', position: { x: 0, y: 0 }, config: {}, status: 'idle' },
    ],
    edges: [],
    icon: '🔗',
    ...overrides,
  })

  it('should render title', () => {
    render(<WorkflowTemplateGallery templates={[]} onSelect={vi.fn()} />)
    expect(screen.getByText('워크플로우 템플릿')).toBeDefined()
  })

  it('should render template count', () => {
    render(<WorkflowTemplateGallery templates={[makeTemplate()]} onSelect={vi.fn()} />)
    expect(screen.getByText('1개 템플릿')).toBeDefined()
  })

  it('should render template name', () => {
    render(<WorkflowTemplateGallery templates={[makeTemplate()]} onSelect={vi.fn()} />)
    expect(screen.getByText('RAG Pipeline')).toBeDefined()
  })

  it('should render template description', () => {
    render(<WorkflowTemplateGallery templates={[makeTemplate()]} onSelect={vi.fn()} />)
    expect(screen.getByText('A basic RAG workflow template')).toBeDefined()
  })

  it('should render node/edge counts', () => {
    render(<WorkflowTemplateGallery templates={[makeTemplate()]} onSelect={vi.fn()} />)
    expect(screen.getByText(/노드 1개/)).toBeDefined()
    expect(screen.getByText(/엣지 0개/)).toBeDefined()
  })

  it('should call onSelect when template button clicked', () => {
    const onSelect = vi.fn()
    render(<WorkflowTemplateGallery templates={[makeTemplate()]} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('이 템플릿으로 시작'))
    expect(onSelect).toHaveBeenCalledWith('tpl-1')
  })

  it('should show empty state when no templates', () => {
    render(<WorkflowTemplateGallery templates={[]} onSelect={vi.fn()} />)
    expect(screen.getByText(/사용 가능한 템플릿이 없습니다/)).toBeDefined()
  })
})
