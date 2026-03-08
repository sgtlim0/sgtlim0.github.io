import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { ToolGrid } from '@hchat/ui/desktop'
import type { DesktopTool } from '@hchat/ui/desktop'

const tools: DesktopTool[] = [
  { id: 'tool-001', name: '이미지 생성', description: 'DALL-E 3를 사용한 이미지 생성', icon: '🎨', category: 'image', isAvailable: true },
  { id: 'tool-002', name: '코드 실행', description: 'Python/JavaScript 코드 실행 환경', icon: '▶️', category: 'code', isAvailable: true },
  { id: 'tool-003', name: 'OCR', description: '이미지에서 텍스트 추출 (점검 중)', icon: '👁️', category: 'image', isAvailable: false },
]

const meta: Meta<typeof ToolGrid> = {
  title: 'Desktop/ToolGrid/Interactions',
  component: ToolGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

export const RendersToolNames: Story = {
  args: { tools },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('이미지 생성')).toBeInTheDocument()
    await expect(canvas.getByText('코드 실행')).toBeInTheDocument()
    await expect(canvas.getByText('OCR')).toBeInTheDocument()
  },
}
