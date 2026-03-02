import type { Meta, StoryObj } from '@storybook/react';
import BarChartRow from '@/components/admin/BarChartRow';

const meta: Meta<typeof BarChartRow> = {
  title: 'Admin/Molecules/BarChartRow',
  component: BarChartRow,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof BarChartRow>;

export const ModelUsage: Story = {
  args: { label: 'Claude 3.5', value: 45, maxValue: 100, color: 'bg-admin-teal', displayValue: '45%' },
};

export const UserRanking: Story = {
  args: { label: '김철수', value: 125000, maxValue: 200000, color: 'bg-admin-blue', displayValue: '125,000' },
};

export const MultipleRows: Story = {
  render: () => (
    <div className="space-y-1">
      <BarChartRow label="Claude 3.5" value={45} maxValue={100} color="bg-admin-teal" displayValue="45%" />
      <BarChartRow label="GPT-4" value={30} maxValue={100} color="bg-admin-blue" displayValue="30%" />
      <BarChartRow label="Gemini" value={15} maxValue={100} color="bg-admin-accent" displayValue="15%" />
      <BarChartRow label="기타" value={10} maxValue={100} color="bg-admin-green" displayValue="10%" />
    </div>
  ),
};
