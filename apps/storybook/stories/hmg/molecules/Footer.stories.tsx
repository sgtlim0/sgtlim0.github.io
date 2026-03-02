import type { Meta, StoryObj } from '@storybook/react';
import Footer from '@hchat/ui/hmg/Footer';

const meta: Meta<typeof Footer> = {
  title: 'HMG/Molecules/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '1440px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {},
};
