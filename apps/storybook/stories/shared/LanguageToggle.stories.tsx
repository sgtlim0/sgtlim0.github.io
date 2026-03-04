import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import LanguageToggle from '@hchat/ui/i18n/LanguageToggle'
import { I18nProvider } from '@hchat/ui'

const meta: Meta<typeof LanguageToggle> = {
  title: 'Shared/LanguageToggle',
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

export const Default: Story = {}
