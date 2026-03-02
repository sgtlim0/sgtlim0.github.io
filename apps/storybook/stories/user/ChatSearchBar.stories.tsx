import type { Meta, StoryObj } from '@storybook/react';
import ChatSearchBar from '@hchat/ui/user/components/ChatSearchBar';

const meta: Meta<typeof ChatSearchBar> = {
  title: 'User/Molecules/ChatSearchBar',
  component: ChatSearchBar,
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
type Story = StoryObj<typeof ChatSearchBar>;

export const Default: Story = {
  args: {
    onSubmit: (query) => console.log('Submitted:', query),
    onAttach: () => console.log('Attach clicked'),
  },
};

export const WithoutAttach: Story = {
  args: {
    onSubmit: (query) => console.log('Submitted:', query),
  },
};
