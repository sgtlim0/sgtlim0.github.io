import type { Meta } from '@storybook/nextjs-vite'
import { ToastProvider, useToast } from '@hchat/ui'

function ToastTrigger({
  type,
  message,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}) {
  const { toast } = useToast()
  return (
    <button
      onClick={() => toast(message, type)}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      Show {type} toast
    </button>
  )
}

const meta: Meta = {
  title: 'Shared/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
}
export default meta

export const Success = () => <ToastTrigger type="success" message="저장되었습니다!" />
export const Error = () => <ToastTrigger type="error" message="오류가 발생했습니다." />
export const Warning = () => <ToastTrigger type="warning" message="주의가 필요합니다." />
export const Info = () => <ToastTrigger type="info" message="새로운 업데이트가 있습니다." />
export const AllTypes = () => (
  <div style={{ display: 'flex', gap: 8 }}>
    <ToastTrigger type="success" message="성공!" />
    <ToastTrigger type="error" message="에러!" />
    <ToastTrigger type="warning" message="경고!" />
    <ToastTrigger type="info" message="정보!" />
  </div>
)
