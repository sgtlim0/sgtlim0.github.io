import type { Meta, StoryObj } from '@storybook/react';
import HmgStatCard from '@hchat/ui/hmg/HmgStatCard';

const meta: Meta<typeof HmgStatCard> = {
  title: 'HMG/Atoms/HmgStatCard',
  component: HmgStatCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof HmgStatCard>;

export const Default: Story = { args: { label: 'AI 채팅', value: '128' } };
export const GroupChat: Story = { args: { label: '그룹 채팅', value: '42' } };
export const ToolUsage: Story = { args: { label: '도구 사용', value: '89' } };
export const Bookmarks: Story = { args: { label: '북마크', value: '15' } };
export const Row: Story = {
  render: () => (
    <div className="flex gap-5">
      <HmgStatCard label="AI 채팅" value="128" />
      <HmgStatCard label="그룹 채팅" value="42" />
      <HmgStatCard label="도구 사용" value="89" />
      <HmgStatCard label="북마크" value="15" />
    </div>
  ),
};
