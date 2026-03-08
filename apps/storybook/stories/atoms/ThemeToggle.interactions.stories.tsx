import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import ThemeToggle from '@/components/ThemeToggle'
import ThemeProvider from '@/components/ThemeProvider'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Atoms/ThemeToggle/Interactions',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const ToggleDarkMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()

    await userEvent.click(button)
    await userEvent.click(button)
  },
}
