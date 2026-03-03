import type { Meta, StoryObj } from '@storybook/react';
import DocsSidebar from '@hchat/ui/llm-router/DocsSidebar';

const meta: Meta<typeof DocsSidebar> = {
  title: 'LLM Router/Organisms/DocsSidebar',
  component: DocsSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'none' },
  decorators: [
    (Story) => (
      <div style={{ height: 500, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DocsSidebar>;

export const Default: Story = {
  args: {
    items: [
      {
        title: '시작하기',
        href: '/docs/getting-started',
        children: [
          { title: '소개', href: '/docs/intro' },
          { title: '빠른 시작', href: '/docs/quickstart' },
          { title: '인증', href: '/docs/auth' },
        ],
      },
      {
        title: 'API 레퍼런스',
        href: '/docs/api',
        children: [
          { title: 'Chat Completions', href: '/docs/api/chat' },
          { title: 'Embeddings', href: '/docs/api/embeddings' },
          { title: 'Images', href: '/docs/api/images' },
        ],
      },
      {
        title: '가이드',
        href: '/docs/guides',
        children: [
          { title: '모델 선택', href: '/docs/guides/models' },
          { title: '비용 최적화', href: '/docs/guides/cost' },
        ],
      },
      { title: 'Changelog', href: '/docs/changelog' },
    ],
  },
};
