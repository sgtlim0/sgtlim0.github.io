import type { Meta, StoryObj } from '@storybook/react';
import SettingsRow from '@/components/admin/SettingsRow';

const meta: Meta<typeof SettingsRow> = {
  title: 'Admin/Molecules/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 600 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SettingsRow>;

export const ToggleEnabled: Story = {
  args: { label: 'Claude 3.5 Sonnet', description: '일일 한도: 100,000 토큰', enabled: true, onEdit: () => {} },
};

export const ToggleDisabled: Story = {
  args: { label: 'GPT-4 Turbo', description: '일일 한도: 50,000 토큰', enabled: false, onEdit: () => {} },
};

export const MultipleRows: Story = {
  render: () => (
    <div>
      <SettingsRow label="Claude 3.5 Sonnet" description="일일 한도: 100,000 토큰" enabled onEdit={() => {}} />
      <SettingsRow label="GPT-4o" description="일일 한도: 50,000 토큰" enabled onEdit={() => {}} />
      <SettingsRow label="Gemini Pro 1.5" description="일일 한도: 80,000 토큰" enabled={false} onEdit={() => {}} />
    </div>
  ),
};
