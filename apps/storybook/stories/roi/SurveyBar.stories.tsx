import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SurveyBar } from '@hchat/ui'

const meta: Meta<typeof SurveyBar> = {
  title: 'ROI/SurveyBar',
  component: SurveyBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SurveyBar>

export const High: Story = { args: { label: '업무 효율 향상', value: 85 } }
export const Medium: Story = { args: { label: '학습 곡선', value: 52 } }
export const Low: Story = { args: { label: '기술적 어려움', value: 15 } }

export const Multiple = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 500 }}>
    <SurveyBar label="업무 효율 향상" value={85} />
    <SurveyBar label="커뮤니케이션 개선" value={72} />
    <SurveyBar label="학습 곡선" value={52} />
    <SurveyBar label="기술적 어려움" value={15} />
  </div>
)
