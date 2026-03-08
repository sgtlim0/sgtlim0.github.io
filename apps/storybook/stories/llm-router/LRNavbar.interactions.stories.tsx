import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { ThemeProvider } from '@hchat/ui'
import LRNavbar from '@hchat/ui/llm-router/LRNavbar'

const meta: Meta<typeof LRNavbar> = {
  title: 'LLM Router/Organisms/LRNavbar/Interactions',
  component: LRNavbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LRNavbar>

export const RendersLoggedOutState: Story = {
  args: { isAuthenticated: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/LLM Router|H Chat/i)).toBeTruthy()
  },
}

export const RendersLoggedInState: Story = {
  args: { isAuthenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/LLM Router|H Chat/i)).toBeTruthy()
  },
}
