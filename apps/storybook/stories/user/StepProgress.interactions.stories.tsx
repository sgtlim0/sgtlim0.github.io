import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import StepProgress from '@hchat/ui/user/components/StepProgress'

const meta: Meta<typeof StepProgress> = {
  title: 'User/Atoms/StepProgress/Interactions',
  component: StepProgress,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StepProgress>

export const RendersAllSteps: Story = {
  args: {
    steps: [
      { label: '주제 선택' },
      { label: '개요 작성' },
      { label: '내용 생성' },
    ],
    currentStep: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('주제 선택')).toBeInTheDocument()
    await expect(canvas.getByText('개요 작성')).toBeInTheDocument()
    await expect(canvas.getByText('내용 생성')).toBeInTheDocument()
  },
}
