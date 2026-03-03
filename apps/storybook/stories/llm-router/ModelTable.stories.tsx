import type { Meta, StoryObj } from '@storybook/react';
import ModelTable from '@hchat/ui/llm-router/ModelTable';
import { models } from '@hchat/ui/llm-router/mockData';

const meta: Meta<typeof ModelTable> = {
  title: 'LLM Router/Organisms/ModelTable',
  component: ModelTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ModelTable>;

export const AllModels: Story = {
  args: { models },
};

export const FilteredByProvider: Story = {
  args: { models, initialProvider: 'OpenAI' },
};

export const FilteredByCategory: Story = {
  args: { models, initialCategory: 'code' },
};
