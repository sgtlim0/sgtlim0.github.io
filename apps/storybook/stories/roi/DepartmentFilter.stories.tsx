import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import DepartmentFilter from '@hchat/ui/roi/DepartmentFilter';

const meta: Meta<typeof DepartmentFilter> = {
  title: 'ROI/Atoms/DepartmentFilter',
  component: DepartmentFilter,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof DepartmentFilter>;

export const Default: Story = {
  args: {
    value: '전체 부서',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('전체 부서');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DepartmentFilter value={value} onChange={setValue} />
        <span style={{ fontSize: 14, color: '#64748B' }}>선택: {value}</span>
      </div>
    );
  },
};
