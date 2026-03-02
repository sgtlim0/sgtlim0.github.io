import type { Meta, StoryObj } from '@storybook/react';
import UserGNB from '@hchat/ui/user/components/UserGNB';

const meta: Meta<typeof UserGNB> = {
  title: 'User/Atoms/UserGNB',
  component: UserGNB,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof UserGNB>;

export const ChatTab: Story = {
  args: {
    activeTab: 'chat',
    userEmail: 'wooggi@gmail.com',
  },
};

export const TranslateTab: Story = {
  args: {
    activeTab: 'translate',
    userEmail: 'wooggi@gmail.com',
  },
};

export const DocsTab: Story = {
  args: {
    activeTab: 'docs',
    userEmail: 'wooggi@gmail.com',
  },
};

export const OcrTab: Story = {
  args: {
    activeTab: 'ocr',
    userEmail: 'user.name@example.com',
  },
};

export const WithoutEmail: Story = {
  args: {
    activeTab: 'chat',
  },
};
