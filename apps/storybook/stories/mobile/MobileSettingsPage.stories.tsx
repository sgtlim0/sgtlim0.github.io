import type { Meta, StoryObj } from '@storybook/react'
import { MobileSettingsPage } from '@hchat/ui/mobile'
import type { MobileSetting } from '@hchat/ui/mobile'

const mockSettings: MobileSetting[] = [
  { id: 's1', label: '다크 모드', type: 'toggle', value: false, section: 'general' },
  { id: 's2', label: '언어', type: 'select', value: '한국어', section: 'general' },
  { id: 's3', label: '기본 모델', type: 'select', value: 'H Chat Pro', section: 'general' },
  { id: 's4', label: '푸시 알림', type: 'toggle', value: true, section: 'notification' },
  { id: 's5', label: '채팅 알림', type: 'toggle', value: true, section: 'notification' },
  { id: 's6', label: '업데이트 알림', type: 'toggle', value: false, section: 'notification' },
  { id: 's7', label: '대화 기록 저장', type: 'toggle', value: true, section: 'privacy' },
  { id: 's8', label: '사용 데이터 수집', type: 'toggle', value: false, section: 'privacy' },
  { id: 's9', label: '개인정보 처리방침', type: 'link', value: '/privacy', section: 'privacy' },
  { id: 's10', label: '앱 버전', type: 'link', value: 'v1.0.0', section: 'about' },
  { id: 's11', label: '이용약관', type: 'link', value: '/terms', section: 'about' },
  { id: 's12', label: '오픈소스 라이선스', type: 'link', value: '/licenses', section: 'about' },
]

const meta: Meta<typeof MobileSettingsPage> = {
  title: 'Mobile/MobileSettingsPage',
  component: MobileSettingsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', maxWidth: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    settings: mockSettings,
    userName: '홍길동',
    userEmail: 'hong@hchat.ai',
  },
}
