import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import CodeBlock from '@hchat/ui/llm-router/CodeBlock'

const meta: Meta<typeof CodeBlock> = {
  title: 'LLM Router/Molecules/CodeBlock/Interactions',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CodeBlock>

export const SwitchLanguageTab: Story = {
  args: {
    examples: [
      { language: 'cURL', code: 'curl -X POST https://api.hchat.ai/v1/chat' },
      { language: 'Python', code: 'import requests\nresponse = requests.post(...)' },
      { language: 'JavaScript', code: 'const response = await fetch(...)' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('cURL')).toBeInTheDocument()
    await expect(canvas.getByText('Python')).toBeInTheDocument()
    await expect(canvas.getByText('JavaScript')).toBeInTheDocument()

    await userEvent.click(canvas.getByText('Python'))
    await expect(canvas.getByText(/import requests/)).toBeInTheDocument()
  },
}
