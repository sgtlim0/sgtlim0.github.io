import type { Meta, StoryObj } from '@storybook/react';
import HeroBanner from '@hchat/ui/hmg/HeroBanner';

const meta: Meta<typeof HeroBanner> = {
  title: 'HMG/Molecules/HeroBanner',
  component: HeroBanner,
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
type Story = StoryObj<typeof HeroBanner>;

export const Default: Story = {
  args: {
    title: 'H Chat 사용 가이드',
    description: 'H Chat의 다양한 기능과 활용 방법을 안내합니다.',
  },
};

export const Publications: Story = {
  args: {
    title: 'H Chat 발행물',
    description: '최신 릴리즈 노트와 기술 문서를 확인하세요.',
  },
};

export const StepGuide: Story = {
  args: {
    title: 'H Chat 빠른 시작 가이드',
    description: '5분 안에 H Chat을 시작하는 방법을 배워보세요.',
  },
};
