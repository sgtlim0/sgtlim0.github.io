import type { Meta, StoryObj } from '@storybook/react';
import StepProgress from '@hchat/ui/user/components/StepProgress';

const meta: Meta<typeof StepProgress> = {
  title: 'User/Atoms/StepProgress',
  component: StepProgress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepProgress>;

const twoSteps = [
  { label: '엔진 선택' },
  { label: '파일 업로드' },
];

const fiveSteps = [
  { label: '주제 선택' },
  { label: '개요 작성' },
  { label: '내용 생성' },
  { label: '편집 및 검토' },
  { label: '최종 완성' },
];

export const TwoStepsFirst: Story = {
  args: {
    steps: twoSteps,
    currentStep: 1,
  },
};

export const TwoStepsSecond: Story = {
  args: {
    steps: twoSteps,
    currentStep: 2,
  },
};

export const FiveStepsFirst: Story = {
  args: {
    steps: fiveSteps,
    currentStep: 1,
  },
};

export const FiveStepsThird: Story = {
  args: {
    steps: fiveSteps,
    currentStep: 3,
  },
};

export const FiveStepsLast: Story = {
  args: {
    steps: fiveSteps,
    currentStep: 5,
  },
};
