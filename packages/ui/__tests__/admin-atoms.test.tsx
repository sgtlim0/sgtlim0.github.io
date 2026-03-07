import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BarChartRow from '../src/admin/BarChartRow'
import UserCard from '../src/admin/UserCard'
import SettingsRow from '../src/admin/SettingsRow'
import NotificationBell from '../src/admin/NotificationBell'

describe('BarChartRow', () => {
  it('should render label and percentage', () => {
    render(<BarChartRow label="채팅" value={80} maxValue={100} />)
    expect(screen.getByText('채팅')).toBeDefined()
    expect(screen.getByText('80%')).toBeDefined()
  })

  it('should calculate percentage correctly', () => {
    render(<BarChartRow label="OCR" value={50} maxValue={200} />)
    expect(screen.getByText('25%')).toBeDefined()
  })

  it('should render custom displayValue', () => {
    render(<BarChartRow label="Test" value={30} maxValue={100} displayValue="3,000건" />)
    expect(screen.getByText('3,000건')).toBeDefined()
  })

  it('should handle zero maxValue', () => {
    render(<BarChartRow label="Empty" value={0} maxValue={0} />)
    expect(screen.getByText('0%')).toBeDefined()
  })

  it('should render bar with correct width', () => {
    const { container } = render(<BarChartRow label="Test" value={75} maxValue={100} />)
    const bar = container.querySelector('.rounded-full.transition-all') as HTMLElement
    expect(bar?.style.width).toBe('75%')
  })
})

describe('UserCard', () => {
  const defaultProps = {
    name: '홍길동',
    userId: 'hong123',
    department: '개발팀',
    totalConversations: 150,
    monthlyTokens: '23,456',
    status: 'active' as const,
  }

  it('should render user info', () => {
    render(<UserCard {...defaultProps} />)
    expect(screen.getByText('홍길동')).toBeDefined()
    expect(screen.getByText('(hong123)')).toBeDefined()
    expect(screen.getByText('개발팀')).toBeDefined()
  })

  it('should render avatar initial', () => {
    render(<UserCard {...defaultProps} />)
    expect(screen.getByText('홍')).toBeDefined()
  })

  it('should render active status', () => {
    render(<UserCard {...defaultProps} />)
    expect(screen.getByText('활성')).toBeDefined()
  })

  it('should render inactive status', () => {
    render(<UserCard {...defaultProps} status="inactive" />)
    expect(screen.getByText('비활성')).toBeDefined()
  })

  it('should render suspended status', () => {
    render(<UserCard {...defaultProps} status="suspended" />)
    expect(screen.getByText('정지')).toBeDefined()
  })

  it('should render conversation count', () => {
    render(<UserCard {...defaultProps} />)
    expect(screen.getByText('150회')).toBeDefined()
  })

  it('should call onViewDetail', () => {
    const onViewDetail = vi.fn()
    render(<UserCard {...defaultProps} onViewDetail={onViewDetail} />)
    fireEvent.click(screen.getByText('상세 보기'))
    expect(onViewDetail).toHaveBeenCalledTimes(1)
  })

  it('should call onManagePermission', () => {
    const onManagePermission = vi.fn()
    render(<UserCard {...defaultProps} onManagePermission={onManagePermission} />)
    fireEvent.click(screen.getByText('권한 설정'))
    expect(onManagePermission).toHaveBeenCalledTimes(1)
  })

  it('should have accessible labels', () => {
    render(<UserCard {...defaultProps} />)
    expect(screen.getByLabelText('홍길동 상세 보기')).toBeDefined()
    expect(screen.getByLabelText('홍길동 권한 설정')).toBeDefined()
  })
})

describe('SettingsRow', () => {
  it('should render label', () => {
    render(<SettingsRow label="알림 설정" />)
    expect(screen.getByText('알림 설정')).toBeDefined()
  })

  it('should render description', () => {
    render(<SettingsRow label="Test" description="매일 9시 발송" />)
    expect(screen.getByText('매일 9시 발송')).toBeDefined()
  })

  it('should render toggle switch', () => {
    render(<SettingsRow label="알림" onToggle={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeDefined()
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<SettingsRow label="Test" enabled onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('should show disabled state', () => {
    const onToggle = vi.fn()
    render(<SettingsRow label="Test" enabled={false} onToggle={onToggle} />)
    const toggle = screen.getByRole('switch')
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('should render edit button when onEdit provided', () => {
    const onEdit = vi.fn()
    render(<SettingsRow label="API 키" onEdit={onEdit} />)
    fireEvent.click(screen.getByText('수정'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('should not render edit button when no onEdit', () => {
    render(<SettingsRow label="Test" />)
    expect(screen.queryByText('수정')).toBeNull()
  })

  it('should have accessible label for toggle', () => {
    render(<SettingsRow label="이메일 알림" />)
    expect(screen.getByLabelText('이메일 알림 토글')).toBeDefined()
  })
})

describe('NotificationBell', () => {
  it('should render bell button', () => {
    render(<NotificationBell unreadCount={0} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should show unread count', () => {
    render(<NotificationBell unreadCount={5} onToggle={() => {}} />)
    expect(screen.getByText('5')).toBeDefined()
  })

  it('should show 99+ for large counts', () => {
    render(<NotificationBell unreadCount={150} onToggle={() => {}} />)
    expect(screen.getByText('99+')).toBeDefined()
  })

  it('should not show badge when count is 0', () => {
    const { container } = render(<NotificationBell unreadCount={0} onToggle={() => {}} />)
    const badge = container.querySelector('.rounded-full.text-white')
    expect(badge).toBeNull()
  })

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<NotificationBell unreadCount={3} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should have accessible label with count', () => {
    render(<NotificationBell unreadCount={7} onToggle={() => {}} />)
    expect(screen.getByLabelText('알림 (7건 미읽음)')).toBeDefined()
  })

  it('should have accessible label without count', () => {
    render(<NotificationBell unreadCount={0} onToggle={() => {}} />)
    expect(screen.getByLabelText('알림')).toBeDefined()
  })

  it('should apply pulse animation for urgent', () => {
    const { container } = render(<NotificationBell unreadCount={1} hasUrgent onToggle={() => {}} />)
    const badge = container.querySelector('.notification-bell-pulse')
    expect(badge).toBeDefined()
  })
})
