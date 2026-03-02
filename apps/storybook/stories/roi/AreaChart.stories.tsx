import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AreaChart } from '@hchat/ui';

const meta: Meta<typeof AreaChart> = {
  title: 'ROI/Charts/AreaChart',
  component: AreaChart,
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

type Story = StoryObj<typeof AreaChart>;

export const CumulativeSavings: Story = {
  args: {
    data: [
      { label: '9월', value: 18 },
      { label: '10월', value: 38 },
      { label: '11월', value: 62 },
      { label: '12월', value: 85 },
      { label: '1월', value: 108 },
      { label: '2월', value: 127 },
    ],
    height: 200,
  },
};
