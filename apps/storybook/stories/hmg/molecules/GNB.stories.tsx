import type { Meta, StoryObj } from '@storybook/react';
import GNB from '@hchat/ui/hmg/GNB';

const meta: Meta<typeof GNB> = {
  title: 'HMG/Molecules/GNB',
  component: GNB,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '1440px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof GNB>;

export const Default: Story = {
  args: {
    brand: '현대자동차그룹',
    menuItems: [
      { label: '회사소개', href: '/about' },
      { label: '사업영역', href: '/business' },
      { label: '기술혁신', href: '/innovation' },
      { label: '지속가능경영', href: '/sustainability' },
    ],
  },
};

export const AdminVariant: Story = {
  args: {
    brand: 'H Chat Admin',
    menuItems: [
      { label: '사용내역', href: '/usage' },
      { label: '통계', href: '/stats' },
      { label: '설정', href: '/settings' },
    ],
  },
};

export const DashboardVariant: Story = {
  args: {
    brand: 'H Chat',
    menuItems: [
      { label: '기능', href: '/features' },
      { label: '가이드', href: '/guide' },
      { label: '설정', href: '/settings' },
    ],
  },
};
