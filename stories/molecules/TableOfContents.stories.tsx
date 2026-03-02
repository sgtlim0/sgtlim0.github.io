import type { Meta, StoryObj } from '@storybook/react';
import TableOfContents from '@/components/TableOfContents';
import type { Heading } from '@/lib/headings';

const meta: Meta<typeof TableOfContents> = {
  title: 'Molecules/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

const typicalHeadings: Heading[] = [
  { id: '주요-기능', text: '주요 기능', level: 2 },
  { id: '실시간-스트리밍', text: '실시간 스트리밍', level: 3 },
  { id: '이미지-업로드', text: '이미지 업로드', level: 3 },
  { id: '페르소나-시스템', text: '페르소나 시스템', level: 2 },
  { id: '모델-선택', text: '모델 선택', level: 2 },
  { id: '지원-모델-목록', text: '지원 모델 목록', level: 3 },
  { id: '모델-비교', text: '모델 비교', level: 3 },
  { id: '설정', text: '설정', level: 3 },
];

export const WithHeadings: Story = {
  args: { headings: typicalHeadings },
};

export const DeepNesting: Story = {
  args: {
    headings: [
      { id: 'section-1', text: '섹션 1', level: 2 },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `sub-1-${i}`,
        text: `하위 항목 ${i + 1}`,
        level: 3,
      })),
      { id: 'section-2', text: '섹션 2', level: 2 },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `sub-2-${i}`,
        text: `하위 항목 ${i + 6}`,
        level: 3,
      })),
    ],
  },
};

export const Empty: Story = {
  args: { headings: [] },
};
