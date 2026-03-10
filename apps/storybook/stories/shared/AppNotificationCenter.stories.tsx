import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import React, { useEffect } from 'react'
import { AppNotificationCenter } from '@hchat/ui'
import { useNotificationCenter } from '@hchat/ui'

/**
 * Wrapper that seeds notifications for testing.
 */
function SeededNotificationCenter() {
  const { add } = useNotificationCenter({ persistKey: 'storybook-notif-demo' })

  useEffect(() => {
    // Clear previous localStorage data to start fresh
    localStorage.removeItem('storybook-notif-demo')

    add({ title: 'Build succeeded', body: 'Production deploy completed.', type: 'success' })
    add({ title: 'New comment', body: 'Someone replied to your thread.', type: 'info', source: 'Chat' })
    add({ title: 'API rate limit warning', type: 'warning' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AppNotificationCenter options={{ persistKey: 'storybook-notif-demo' }} />
}

const meta: Meta<typeof AppNotificationCenter> = {
  title: 'Shared/AppNotificationCenter',
  component: AppNotificationCenter,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof AppNotificationCenter>

export const Default: Story = {
  render: () => <SeededNotificationCenter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Bell button should be visible
    const bellButton = canvas.getByRole('button')
    await expect(bellButton).toBeInTheDocument()

    // Open the dropdown
    await userEvent.click(bellButton)

    // The dialog should appear
    await waitFor(() => {
      expect(canvas.getByRole('dialog')).toBeInTheDocument()
    })

    // Notification items should be visible
    await expect(canvas.getByText('Build succeeded')).toBeInTheDocument()
    await expect(canvas.getByText('API rate limit warning')).toBeInTheDocument()
  },
}

export const MarkAllAsRead: Story = {
  render: () => <SeededNotificationCenter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open dropdown
    await userEvent.click(canvas.getByRole('button'))

    await waitFor(() => {
      expect(canvas.getByRole('dialog')).toBeInTheDocument()
    })

    // Click "모두 읽음" button
    const markAllBtn = canvas.getByText('모두 읽음')
    await userEvent.click(markAllBtn)

    // After marking all read, the "모두 읽음" button should disappear
    await waitFor(() => {
      expect(canvas.queryByText('모두 읽음')).not.toBeInTheDocument()
    })
  },
}
