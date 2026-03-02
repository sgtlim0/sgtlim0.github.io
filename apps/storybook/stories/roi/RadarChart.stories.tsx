import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RadarChart } from '@hchat/ui';

const meta: Meta<typeof RadarChart> = {
  title: 'ROI/Charts/RadarChart',
  component: RadarChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 500, padding: 24, background: 'var(--roi-card-bg, #fff)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof RadarChart>;

export const DepartmentSatisfaction: Story = {
  args: {
    axes: ['업무품질', '속도향상', '부담경감', '정확성', '추천의향'],
    datasets: [
      { label: '개발팀', values: [88, 92, 85, 90, 87], color: 'var(--roi-chart-1)' },
      { label: '마케팅팀', values: [78, 75, 80, 72, 76], color: 'var(--roi-chart-2)' },
      { label: '영업팀', values: [65, 70, 68, 60, 62], color: 'var(--roi-chart-3)' },
    ],
    size: 200,
  },
};
