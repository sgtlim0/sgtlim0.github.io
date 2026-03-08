/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for remaining uncovered admin components that use hooks internally:
 * - AdminRealtimeDashboard (uses realtimeHooks)
 * - CustomDashboard (uses widgetHooks)
 * - LoginPage (uses useAuth, useRouter)
 * - NotificationCenter (uses notificationHooks)
 * - WorkflowBuilder (uses workflowHooks)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ============ Mock realtimeHooks for AdminRealtimeDashboard ============
vi.mock('../src/admin/services/realtimeHooks', () => ({
  useRealtimeMetrics: vi.fn().mockReturnValue([
    { id: 'm1', label: 'Active Users', value: 1247, previousValue: 1100, unit: '', trend: 'up' as const, changePercent: 13.4 },
    { id: 'm2', label: 'QPM', value: 342, previousValue: 300, unit: '', trend: 'up' as const, changePercent: 14.0 },
    { id: 'm3', label: 'Avg Response', value: 250, previousValue: 280, unit: 'ms', trend: 'down' as const, changePercent: -10.7 },
    { id: 'm4', label: 'Error Rate', value: 0.5, previousValue: 0.3, unit: '%', trend: 'up' as const, changePercent: 66.7 },
  ]),
  useRealtimeTimeSeries: vi.fn().mockReturnValue([
    { timestamp: Date.now() - 60000, value: 100 },
    { timestamp: Date.now() - 30000, value: 120 },
    { timestamp: Date.now(), value: 115 },
  ]),
  useRealtimeActivities: vi.fn().mockReturnValue([
    { id: 'a1', type: 'query' as const, user: 'user@test.com', message: 'Query sent', timestamp: Date.now() - 5000 },
  ]),
  useRealtimeStats: vi.fn().mockReturnValue({
    activeUsers: 1247,
    queriesPerMinute: 342,
    avgResponseTime: 250,
    errorRate: 0.5,
    totalTokensUsed: 5000000,
    modelDistribution: [
      { model: 'GPT-4o', count: 450, percentage: 45 },
      { model: 'Claude 3.5', count: 300, percentage: 30 },
    ],
  }),
}))

// ============ Mock widgetHooks for CustomDashboard ============
vi.mock('../src/admin/services/widgetHooks', () => ({
  useDashboardLayout: vi.fn().mockReturnValue({
    layout: { id: 'layout-1', name: 'Default', widgets: [], columns: 4, createdAt: Date.now(), updatedAt: Date.now() },
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'Active Users', size: 'md', visible: true, position: { x: 0, y: 0 }, settings: {} },
    ],
    catalog: [
      { type: 'metric-card', name: 'Metric Card', description: 'Desc', icon: '📊', defaultSize: 'sm', minSize: 'sm', maxSize: 'lg', category: 'monitoring' },
    ],
    addWidget: vi.fn(),
    removeWidget: vi.fn(),
    resizeWidget: vi.fn(),
    toggleWidget: vi.fn(),
    resetLayout: vi.fn(),
    saveLayout: vi.fn(),
    layouts: [{ id: 'layout-1', name: 'Default', widgets: [], columns: 4, createdAt: Date.now(), updatedAt: Date.now() }],
    switchLayout: vi.fn(),
    createLayout: vi.fn(),
    deleteLayout: vi.fn(),
  }),
}))

// ============ Mock notificationHooks for NotificationCenter ============
vi.mock('../src/admin/services/notificationHooks', () => ({
  useNotifications: vi.fn().mockReturnValue({
    notifications: [
      {
        id: 'n1',
        type: 'warning' as const,
        priority: 'high' as const,
        title: 'High CPU Usage',
        message: 'CPU at 95%',
        source: 'System',
        timestamp: Date.now() - 60000,
        read: false,
        channels: ['push' as const],
      },
      {
        id: 'n2',
        type: 'info' as const,
        priority: 'low' as const,
        title: 'Version Update',
        message: 'New version',
        source: 'System',
        timestamp: Date.now() - 120000,
        read: true,
        channels: ['email' as const],
      },
    ],
    stats: {
      total: 2,
      unread: 1,
      byType: { info: 1, warning: 1, error: 0, success: 0 },
      byPriority: { low: 1, medium: 0, high: 1, critical: 0 },
    },
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  }),
  useNotificationPreferences: vi.fn(),
}))

// ============ Mock workflowHooks for WorkflowBuilder ============
vi.mock('../src/admin/services/workflowHooks', () => ({
  useWorkflowEditor: vi.fn().mockReturnValue({
    workflowName: 'Test Workflow',
    setWorkflowName: vi.fn(),
    nodes: [
      { id: 'n1', type: 'input', label: 'Input Node', description: 'Gets input', position: { x: 100, y: 100 }, config: {}, status: 'idle' },
    ],
    edges: [],
    selectedNodeId: null,
    selectedNode: null,
    selectedNodeSchema: null,
    catalog: [
      { type: 'llm', name: 'LLM Call', description: 'Calls LLM', icon: '🤖', category: 'processing', configSchema: [] },
    ],
    templates: [
      { id: 'tpl-1', name: 'RAG Pipeline', description: 'Basic RAG', category: 'rag', nodes: [], edges: [], icon: '🔗' },
    ],
    addNode: vi.fn(),
    deleteNode: vi.fn(),
    updateNodeConfig: vi.fn(),
    updateNodeStatus: vi.fn(),
    selectNode: vi.fn(),
    loadTemplate: vi.fn(),
    newWorkflow: vi.fn(),
    resetStatuses: vi.fn(),
  }),
  useWorkflowExecution: vi.fn().mockReturnValue({
    executing: false,
    results: {},
    execute: vi.fn(),
    clearResults: vi.fn(),
  }),
}))

// ============ Mock useAuth for LoginPage ============
vi.mock('../src/admin/auth/AuthProvider', () => {
  const loginFn = vi.fn()
  return {
    useAuth: vi.fn().mockReturnValue({
      login: loginFn,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
    __mockLogin: loginFn,
  }
})

// ============ Mock next/navigation for LoginPage ============
vi.mock('next/navigation', () => {
  const pushFn = vi.fn()
  return {
    useRouter: vi.fn().mockReturnValue({
      push: pushFn,
    }),
    __mockPush: pushFn,
  }
})

import AdminRealtimeDashboard from '../src/admin/AdminRealtimeDashboard'
import CustomDashboard from '../src/admin/CustomDashboard'
import LoginPage from '../src/admin/LoginPage'
import NotificationCenter from '../src/admin/NotificationCenter'
import WorkflowBuilder from '../src/admin/WorkflowBuilder'
import { useAuth } from '../src/admin/auth/AuthProvider'

// ============ AdminRealtimeDashboard ============
describe('AdminRealtimeDashboard', () => {
  it('should render the header', () => {
    render(<AdminRealtimeDashboard />)
    expect(screen.getByText('실시간 모니터링')).toBeDefined()
  })

  it('should render the live indicator', () => {
    render(<AdminRealtimeDashboard />)
    expect(screen.getByText('실시간')).toBeDefined()
  })

  it('should render metric cards', () => {
    render(<AdminRealtimeDashboard />)
    expect(screen.getByText('Active Users')).toBeDefined()
  })

  it('should render section titles', () => {
    render(<AdminRealtimeDashboard />)
    expect(screen.getByText('분당 쿼리 수')).toBeDefined()
    expect(screen.getByText('모델 사용 분포')).toBeDefined()
    expect(screen.getByText('평균 응답 시간 추이')).toBeDefined()
    expect(screen.getByText('최근 활동')).toBeDefined()
  })

  it('should render loading state when stats is null', async () => {
    const { useRealtimeStats } = await import('../src/admin/services/realtimeHooks')
    ;(useRealtimeStats as any).mockReturnValueOnce(null)

    const { container } = render(<AdminRealtimeDashboard />)
    // Should render skeleton (animate-pulse)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })
})

// ============ CustomDashboard ============
describe('CustomDashboard', () => {
  it('should render the header', () => {
    render(<CustomDashboard />)
    expect(screen.getByText('대시보드 커스터마이징')).toBeDefined()
  })

  it('should render widget count', () => {
    render(<CustomDashboard />)
    expect(screen.getByText(/위젯 1개/)).toBeDefined()
  })

  it('should render edit button', () => {
    render(<CustomDashboard />)
    expect(screen.getByText('편집')).toBeDefined()
  })

  it('should show editing controls when edit clicked', () => {
    render(<CustomDashboard />)
    fireEvent.click(screen.getByText('편집'))
    expect(screen.getByText('위젯 추가')).toBeDefined()
    expect(screen.getByText('초기화')).toBeDefined()
    expect(screen.getByText('저장')).toBeDefined()
  })

  it('should show new layout button', () => {
    render(<CustomDashboard />)
    expect(screen.getByText('+ 새 레이아웃')).toBeDefined()
  })

  it('should render layout selector', () => {
    render(<CustomDashboard />)
    expect(screen.getByText('Default')).toBeDefined()
  })
})

// ============ LoginPage ============
describe('LoginPage', () => {
  // Get the mock login function from the mocked useAuth
  const getLoginMock = () => (useAuth as any)().login

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login title', () => {
    render(<LoginPage />)
    expect(screen.getByText('H Chat Admin')).toBeDefined()
  })

  it('should render email input', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('이메일')).toBeDefined()
  })

  it('should render password input', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('비밀번호')).toBeDefined()
  })

  it('should render login button', () => {
    render(<LoginPage />)
    expect(screen.getByText('로그인')).toBeDefined()
  })

  it('should render remember me checkbox', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('로그인 상태 유지')).toBeDefined()
  })

  it('should render demo info', () => {
    render(<LoginPage />)
    expect(screen.getByText('데모 계정')).toBeDefined()
    expect(screen.getByText('admin@hchat.ai')).toBeDefined()
  })

  it('should show error when submitting empty form', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('로그인'))
    expect(screen.getByText('이메일과 비밀번호를 입력해주세요.')).toBeDefined()
  })

  it('should call login on form submit', async () => {
    const loginMock = getLoginMock()
    loginMock.mockResolvedValue(undefined)
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'admin@hchat.ai' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByText('로그인'))
    expect(loginMock).toHaveBeenCalledWith({ email: 'admin@hchat.ai', password: 'pass123', rememberMe: false })
  })

  it('should show error message on login failure', async () => {
    const loginMock = getLoginMock()
    loginMock.mockRejectedValue(new Error('잘못된 이메일 또는 비밀번호입니다.'))
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('로그인'))

    // Wait for the error message
    await vi.waitFor(() => {
      expect(screen.getByText('잘못된 이메일 또는 비밀번호입니다.')).toBeDefined()
    })
  })

  it('should render version footer', () => {
    render(<LoginPage />)
    expect(screen.getByText('H Chat Admin v1.0')).toBeDefined()
  })
})

// ============ NotificationCenter ============
describe('NotificationCenter', () => {
  it('should render center title', () => {
    render(<NotificationCenter />)
    expect(screen.getByText('알림 센터')).toBeDefined()
  })

  it('should render statistics panel', () => {
    render(<NotificationCenter />)
    expect(screen.getByText('알림 통계')).toBeDefined()
  })

  it('should render total count labels', () => {
    render(<NotificationCenter />)
    // 전체 appears in both filter tabs and stats; verify at least one
    expect(screen.getAllByText('전체').length).toBeGreaterThan(0)
    expect(screen.getByText('미읽음')).toBeDefined()
  })

  it('should render notifications from hook', () => {
    render(<NotificationCenter />)
    expect(screen.getByText('High CPU Usage')).toBeDefined()
    expect(screen.getByText('Version Update')).toBeDefined()
  })

  it('should render type stats', () => {
    render(<NotificationCenter />)
    // These labels appear in both the filter tabs and the stats panel
    expect(screen.getAllByText('정보').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('경고').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('오류').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('성공').length).toBeGreaterThanOrEqual(1)
  })
})

// ============ WorkflowBuilder ============
describe('WorkflowBuilder', () => {
  it('should render workflow name input', () => {
    render(<WorkflowBuilder />)
    expect(screen.getByDisplayValue('Test Workflow')).toBeDefined()
  })

  it('should render node count', () => {
    render(<WorkflowBuilder />)
    expect(screen.getByText('노드 1개')).toBeDefined()
  })

  it('should render action buttons', () => {
    render(<WorkflowBuilder />)
    expect(screen.getByText('새로 만들기')).toBeDefined()
    expect(screen.getByText('실행')).toBeDefined()
    expect(screen.getByText('저장')).toBeDefined()
  })

  it('should render node catalog toggle', () => {
    render(<WorkflowBuilder />)
    expect(screen.getByText('카탈로그 닫기')).toBeDefined()
  })

  it('should toggle between editor and templates view', () => {
    render(<WorkflowBuilder />)
    fireEvent.click(screen.getByText('템플릿에서'))
    expect(screen.getByText('워크플로우 템플릿')).toBeDefined()
  })

  it('should render canvas with nodes', () => {
    render(<WorkflowBuilder />)
    expect(screen.getByText('Input Node')).toBeDefined()
  })
})
