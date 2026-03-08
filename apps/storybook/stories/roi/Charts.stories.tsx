import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart } from '@hchat/ui/roi';

// === MiniLineChart ===
const lineMeta: Meta<typeof MiniLineChart> = {
  title: 'ROI/Charts/MiniLineChart',
  component: MiniLineChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 500, padding: 24, background: 'var(--roi-card-bg, #fff)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};
export default lineMeta;

type LineStory = StoryObj<typeof MiniLineChart>;

export const Default: LineStory = {
  args: {
    data: [
      { label: '9월', value: 320 },
      { label: '10월', value: 480 },
      { label: '11월', value: 720 },
      { label: '12월', value: 1050 },
      { label: '1월', value: 1680 },
      { label: '2월', value: 2450 },
    ],
    height: 200,
  },
};

export const CustomColor: LineStory = {
  args: {
    data: [
      { label: 'W1', value: 145 },
      { label: 'W2', value: 152 },
      { label: 'W3', value: 170 },
      { label: 'W4', value: 185 },
      { label: 'W5', value: 198 },
      { label: 'W6', value: 218 },
    ],
    height: 160,
    color: 'var(--roi-chart-2)',
  },
};
