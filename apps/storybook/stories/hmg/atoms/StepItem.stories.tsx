import type { Meta, StoryObj } from '@storybook/react';
import StepItem from '@hchat/ui/hmg/StepItem';

const meta: Meta<typeof StepItem> = {
  title: 'HMG/Atoms/StepItem',
  component: StepItem,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof StepItem>;

export const Default: Story = {
  args: {
    step: 1,
    title: 'H Chat 접속',
    description: '웹 브라우저에서 H Chat에 접속합니다.',
  },
};

export const WithArrow: Story = {
  args: {
    step: 2,
    title: '모델 선택',
    description: '사용할 AI 모델을 선택합니다.',
    showArrow: true,
  },
};

export const AllSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <StepItem
        step={1}
        title="H Chat 접속"
        description="웹 브라우저에서 H Chat에 접속합니다."
        showArrow
      />
      <StepItem
        step={2}
        title="모델 선택"
        description="사용할 AI 모델을 선택합니다."
        showArrow
      />
      <StepItem
        step={3}
        title="대화 시작"
        description="질문을 입력하고 AI와 대화를 시작합니다."
        showArrow
      />
      <StepItem
        step={4}
        title="도구 활용"
        description="필요한 경우 추가 도구를 활용합니다."
        showArrow
      />
      <StepItem
        step={5}
        title="결과 확인"
        description="AI의 응답을 확인하고 필요시 추가 질문을 합니다."
      />
    </div>
  ),
};
