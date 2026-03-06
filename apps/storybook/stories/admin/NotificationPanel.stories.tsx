import type { Meta, StoryObj } from '@storybook/react'
import { NotificationPanel } from '@hchat/ui/admin'
import type { Notification } from '@hchat/ui/admin/services/notificationTypes'

const now = Date.now()

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    priority: 'critical',
    title: '모델 응답 오류',
    message: 'GPT-4o 오류율 5% 초과',
    source: 'model',
    timestamp: now - 60000,
    read: false,
    channels: ['push', 'email'],
    actionUrl: '/providers',
  },
  {
    id: '2',
    type: 'warning',
    priority: 'high',
    title: 'API 사용량 경고',
    message: '일일 한도 80% 도달',
    source: 'system',
    timestamp: now - 300000,
    read: false,
    channels: ['push'],
  },
  {
    id: '3',
    type: 'success',
    priority: 'low',
    title: '백업 완료',
    message: '일일 백업 성공',
    source: 'system',
    timestamp: now - 600000,
    read: true,
    channels: ['push'],
  },
  {
    id: '4',
    type: 'info',
    priority: 'medium',
    title: '새 모델 배포',
    message: 'Claude 4.5 배포 완료',
    source: 'model',
    timestamp: now - 1200000,
    read: true,
    channels: ['push', 'slack'],
  },
  {
    id: '5',
    type: 'warning',
    priority: 'high',
    title: '비정상 접근',
    message: '미확인 IP 로그인 시도',
    source: 'security',
    timestamp: now - 1800000,
    read: true,
    channels: ['push', 'email', 'slack'],
  },
]

const meta: Meta<typeof NotificationPanel> = {
  title: 'Admin/Notifications/NotificationPanel',
  component: NotificationPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 20, maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    onMarkRead: () => {},
    onMarkAllRead: () => {},
    onNavigate: () => {},
  },
}

export const Empty: Story = {
  args: {
    notifications: [],
    onMarkRead: () => {},
    onMarkAllRead: () => {},
    onNavigate: () => {},
  },
}

export const AllUnread: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, read: false })),
    onMarkRead: () => {},
    onMarkAllRead: () => {},
    onNavigate: () => {},
  },
}
