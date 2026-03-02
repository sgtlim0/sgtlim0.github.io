import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DonutChart } from '@hchat/ui';

const meta: Meta<typeof DonutChart> = {
  title: 'ROI/Charts/DonutChart',
  component: DonutChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 400, padding: 24, background: 'var(--roi-card-bg, #fff)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DonutChart>;

export const ModelCostEfficiency: Story = {
  args: {
    segments: [
      { label: 'Claude Sonnet', value: 45, color: 'var(--roi-chart-1)' },
      { label: 'GPT-4o', value: 30, color: 'var(--roi-chart-2)' },
      { label: 'Gemini Pro', value: 17, color: 'var(--roi-chart-3)' },
      { label: 'Claude Haiku', value: 8, color: 'var(--roi-chart-4)' },
    ],
  },
};

export const FeatureSavings: Story = {
  args: {
    segments: [
      { label: '코드 리뷰', value: 28, color: 'var(--roi-chart-1)' },
      { label: '문서 요약', value: 22, color: 'var(--roi-chart-2)' },
      { label: '번역', value: 18, color: 'var(--roi-chart-3)' },
      { label: '이메일 작성', value: 14, color: 'var(--roi-chart-4)' },
      { label: '데이터 분석', value: 12, color: 'var(--roi-chart-5)' },
      { label: '기타', value: 6, color: 'var(--roi-divider)' },
    ],
  },
};
