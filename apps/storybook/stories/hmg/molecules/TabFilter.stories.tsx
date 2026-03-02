import type { Meta, StoryObj } from '@storybook/react';
import TabFilter from '@hchat/ui/hmg/TabFilter';

const meta: Meta<typeof TabFilter> = {
  title: 'HMG/Molecules/TabFilter',
  component: TabFilter,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        return <Story />;
      }
      return (
        <div suppressHydrationWarning>
          <Story />
        </div>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof TabFilter>;

export const Default: Story = {
  args: {
    tabs: ['전체', '가이드', '릴리즈 노트', '기술 문서'],
    activeTab: '전체',
    onTabChange: (tab: string) => {
      // eslint-disable-next-line no-console
      console.log('Tab changed to:', tab);
    },
  },
};
