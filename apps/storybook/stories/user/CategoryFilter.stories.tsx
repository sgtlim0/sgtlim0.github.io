import type { Meta, StoryObj } from '@storybook/react';
import CategoryFilter from '@hchat/ui/user/components/CategoryFilter';

const allCategories = ['전체', '채팅', '업무', '번역', '정리', '보고', '그림', '글쓰기'];

const meta: Meta<typeof CategoryFilter> = {
  title: 'User/Atoms/CategoryFilter',
  component: CategoryFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CategoryFilter>;

export const AllSelected: Story = {
  args: {
    categories: allCategories,
    activeCategory: '전체',
    onSelect: (category) => console.log('Selected:', category),
  },
};

export const ChatSelected: Story = {
  args: {
    categories: allCategories,
    activeCategory: '채팅',
    onSelect: (category) => console.log('Selected:', category),
  },
};

export const TranslateSelected: Story = {
  args: {
    categories: allCategories,
    activeCategory: '번역',
    onSelect: (category) => console.log('Selected:', category),
  },
};

export const LimitedCategories: Story = {
  args: {
    categories: ['전체', '채팅', '업무'],
    activeCategory: '업무',
    onSelect: (category) => console.log('Selected:', category),
  },
};
