import type { Meta, StoryObj } from '@storybook/react';
import EngineSelector from '@hchat/ui/user/components/EngineSelector';

const meta: Meta<typeof EngineSelector> = {
  title: 'User/Molecules/EngineSelector',
  component: EngineSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EngineSelector>;

export const InternalSelected: Story = {
  args: {
    selectedEngine: 'internal',
    onSelect: (engine) => console.log('Selected:', engine),
  },
};

export const DeepLSelected: Story = {
  args: {
    selectedEngine: 'deepl',
    onSelect: (engine) => console.log('Selected:', engine),
  },
};
