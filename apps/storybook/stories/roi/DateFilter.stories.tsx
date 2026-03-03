import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import DateFilter from '@hchat/ui/roi/DateFilter';

const meta: Meta<typeof DateFilter> = {
  title: 'ROI/Atoms/DateFilter',
  component: DateFilter,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof DateFilter>;

export const Default: Story = {
  args: {
    value: '2026.02',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('2026.02');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DateFilter value={value} onChange={setValue} />
        <span style={{ fontSize: 14, color: '#64748B' }}>선택: {value}</span>
      </div>
    );
  },
};
