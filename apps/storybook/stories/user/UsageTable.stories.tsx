import type { Meta, StoryObj } from '@storybook/react';
import UsageTable from '@hchat/ui/user/components/UsageTable';
import { mockModelUsage } from '@hchat/ui/user/services/mockData';
import type { ModelUsage } from '@hchat/ui/user/services/types';

const meta: Meta<typeof UsageTable> = {
  title: 'User/Molecules/UsageTable',
  component: UsageTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UsageTable>;

export const ZeroUsage: Story = {
  args: {
    usage: mockModelUsage,
  },
};

export const WithUsage: Story = {
  args: {
    usage: [
      { modelName: 'OPENAI_CHAT_GPT4', currentUsage: '12,450 토큰 사용', cost: 2480 },
      { modelName: 'OPENAI_CHAT_GPT3_5', currentUsage: '8,200 토큰 사용', cost: 820 },
      { modelName: 'OPENAI_ASSISTANT', currentUsage: '3,100 토큰 사용', cost: 620 },
      { modelName: 'OPENAI_ASSISTANT_FILE', currentUsage: '1,500 토큰 사용', cost: 300 },
      { modelName: 'CLAUDE_DOC_CREATE_NEW', currentUsage: '5,800 토큰 사용', cost: 1160 },
      { modelName: 'CLAUDE_DOC_GEN_PART', currentUsage: '2,300 토큰 사용', cost: 460 },
      { modelName: 'DEEPL_TRANSLATE_FILE', currentUsage: '450 문자 번역', cost: 90 },
      { modelName: 'OPENAI_COMPLETION_OCR', currentUsage: '12 페이지 처리', cost: 240 },
      { modelName: 'OPENAI_DALL_E3', currentUsage: '3 이미지 생성', cost: 1200 },
    ] as ModelUsage[],
  },
};

export const HighUsage: Story = {
  args: {
    usage: [
      { modelName: 'OPENAI_CHAT_GPT4', currentUsage: '127,450 토큰 사용', cost: 25490 },
      { modelName: 'OPENAI_CHAT_GPT3_5', currentUsage: '98,200 토큰 사용', cost: 9820 },
      { modelName: 'OPENAI_ASSISTANT', currentUsage: '43,100 토큰 사용', cost: 8620 },
      { modelName: 'OPENAI_ASSISTANT_FILE', currentUsage: '21,500 토큰 사용', cost: 4300 },
      { modelName: 'CLAUDE_DOC_CREATE_NEW', currentUsage: '65,800 토큰 사용', cost: 13160 },
      { modelName: 'CLAUDE_DOC_GEN_PART', currentUsage: '32,300 토큰 사용', cost: 6460 },
      { modelName: 'DEEPL_TRANSLATE_FILE', currentUsage: '8,450 문자 번역', cost: 1690 },
      { modelName: 'OPENAI_COMPLETION_OCR', currentUsage: '212 페이지 처리', cost: 4240 },
      { modelName: 'OPENAI_DALL_E3', currentUsage: '45 이미지 생성', cost: 18000 },
    ] as ModelUsage[],
  },
};
