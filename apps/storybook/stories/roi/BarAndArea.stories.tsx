import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MiniBarChart, AreaChart } from '@hchat/ui';

// === MiniBarChart ===
const barMeta: Meta<typeof MiniBarChart> = {
  title: 'ROI/Charts/MiniBarChart',
  component: MiniBarChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 500, padding: 24, background: 'var(--roi-card-bg, #fff)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};
export default barMeta;

type BarStory = StoryObj<typeof MiniBarChart>;

export const WeeklyAIHours: BarStory = {
  args: {
    data: [
      { label: 'W1', value: 120 },
      { label: 'W2', value: 135 },
      { label: 'W3', value: 150 },
      { label: 'W4', value: 168 },
      { label: 'W5', value: 190 },
      { label: 'W6', value: 205 },
      { label: 'W7', value: 215 },
      { label: 'W8', value: 240 },
      { label: 'W9', value: 255 },
      { label: 'W10', value: 270 },
    ],
    height: 200,
  },
};
