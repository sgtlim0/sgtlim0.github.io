import type { Meta, StoryObj } from '@storybook/react';
import InsightCard from '@hchat/ui/roi/InsightCard';

const meta: Meta<typeof InsightCard> = {
  title: 'ROI/Atoms/InsightCard',
  component: InsightCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InsightCard>;

export const Positive: Story = {
  args: {
    type: 'positive',
    title: 'AI 도입 효과 우수',
    description: '월간 업무 시간 절감이 15% 증가했습니다. 번역 기능의 활용률이 특히 높습니다.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: '일부 부서 활용률 저조',
    description: '마케팅 부서의 AI 활용률이 20% 미만입니다. 교육 프로그램을 검토해 주세요.',
  },
};

export const Cost: Story = {
  args: {
    type: 'cost',
    title: '비용 최적화 가능',
    description: 'GPT-4o 사용량이 높습니다. Haiku 모델로 전환 시 월 ₩2.5M 절감 가능합니다.',
  },
};
