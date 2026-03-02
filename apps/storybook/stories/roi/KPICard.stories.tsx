import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KPICard } from '@hchat/ui';

const meta: Meta<typeof KPICard> = {
  title: 'ROI/KPICard',
  component: KPICard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof KPICard>;

export const Positive: Story = {
  args: {
    label: '총 절감 시간',
    value: '2,450h',
    trend: '+12%',
    trendUp: true,
  },
};

export const Negative: Story = {
  args: {
    label: '비활성 사용자',
    value: '62명',
    trend: '-8',
    trendUp: false,
  },
};

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%', maxWidth: 1200 }}>
    <KPICard label="총 절감 시간" value="2,450h" trend="+12%" trendUp />
    <KPICard label="총 비용 절감" value="₩127M" trend="+18%" trendUp />
    <KPICard label="ROI" value="340%" trend="+45%p" trendUp />
    <KPICard label="활성 사용률" value="78%" trend="+5%p" trendUp />
  </div>
);
