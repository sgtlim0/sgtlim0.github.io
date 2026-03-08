import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within, userEvent } from '@storybook/test'
import LanguageToggle from '@hchat/ui/i18n/LanguageToggle'
import { I18nProvider } from '@hchat/ui'

const meta: Meta<typeof LanguageToggle> = {
  title: 'Shared/LanguageToggle/Interactions',
  component: LanguageToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LanguageToggle>

export const ToggleLanguage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()

    await userEvent.click(button)
  },
}
