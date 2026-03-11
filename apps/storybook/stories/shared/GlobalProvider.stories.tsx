import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { GlobalProvider, useGlobalContext } from '@hchat/ui'

function ProviderStatusDisplay() {
  const ctx = useGlobalContext()

  const items = [
    { label: 'Analytics', active: ctx.analytics },
    { label: 'Feature Flags', active: ctx.featureFlags },
    { label: 'Hotkeys', active: ctx.hotkeys },
    { label: 'Toasts', active: ctx.toasts },
    { label: 'Modals', active: ctx.modals },
    { label: 'Event Bus', active: ctx.eventBus },
    { label: 'Query', active: ctx.query },
  ]

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">GlobalProvider Status</h2>
      <ul className="space-y-2" data-testid="provider-list">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-sm"
            data-testid={`provider-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                item.active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span>{item.label}</span>
            <span className="text-xs text-gray-500">
              {item.active ? 'enabled' : 'disabled'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const meta: Meta<typeof GlobalProvider> = {
  title: 'Shared/GlobalProvider',
  component: GlobalProvider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof GlobalProvider>

export const AllEnabled: Story = {
  render: () => (
    <GlobalProvider>
      <ProviderStatusDisplay />
    </GlobalProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('GlobalProvider Status')).toBeInTheDocument()

    const list = canvas.getByTestId('provider-list')
    await expect(list).toBeInTheDocument()

    // All providers should show "enabled"
    const enabledLabels = canvas.getAllByText('enabled')
    await expect(enabledLabels.length).toBe(7)
  },
}

export const SelectiveDisable: Story = {
  render: () => (
    <GlobalProvider analytics={{ enabled: false }} hotkeys={false} modals={false}>
      <ProviderStatusDisplay />
    </GlobalProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('GlobalProvider Status')).toBeInTheDocument()

    // 3 disabled, 4 enabled
    const enabledLabels = canvas.getAllByText('enabled')
    const disabledLabels = canvas.getAllByText('disabled')
    await expect(enabledLabels.length).toBe(4)
    await expect(disabledLabels.length).toBe(3)

    // Verify specific disabled providers
    const analyticsRow = canvas.getByTestId('provider-analytics')
    await expect(analyticsRow).toHaveTextContent('disabled')

    const hotkeysRow = canvas.getByTestId('provider-hotkeys')
    await expect(hotkeysRow).toHaveTextContent('disabled')

    const modalsRow = canvas.getByTestId('provider-modals')
    await expect(modalsRow).toHaveTextContent('disabled')
  },
}

export const MinimalConfig: Story = {
  render: () => (
    <GlobalProvider
      analytics={{ enabled: false }}
      featureFlags={false}
      hotkeys={false}
      toasts={false}
      modals={false}
      eventBus={false}
      query={false}
    >
      <ProviderStatusDisplay />
    </GlobalProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All providers should show "disabled"
    const disabledLabels = canvas.getAllByText('disabled')
    await expect(disabledLabels.length).toBe(7)
  },
}
