import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { TreeView } from '@hchat/ui'
import type { TreeNode } from '@hchat/ui'

const fileTree: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', isLeaf: true },
          { id: 'Modal.tsx', label: 'Modal.tsx', isLeaf: true },
          { id: 'Sidebar.tsx', label: 'Sidebar.tsx', isLeaf: true },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [
          { id: 'useAuth.ts', label: 'useAuth.ts', isLeaf: true },
          { id: 'useTheme.ts', label: 'useTheme.ts', isLeaf: true },
        ],
      },
      { id: 'index.ts', label: 'index.ts', isLeaf: true },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon.ico', label: 'favicon.ico', isLeaf: true },
      { id: 'logo.svg', label: 'logo.svg', isLeaf: true },
    ],
  },
  { id: 'package.json', label: 'package.json', isLeaf: true },
  { id: 'tsconfig.json', label: 'tsconfig.json', isLeaf: true },
]

const meta: Meta<typeof TreeView> = {
  title: 'Shared/TreeView',
  component: TreeView,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof TreeView>

export const FileTree: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-6 border rounded-lg">
      <TreeView
        nodes={fileTree}
        defaultExpanded={['src']}
        defaultSelected="index.ts"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render tree
    const tree = canvas.getByRole('tree')
    expect(tree).toBeTruthy()

    // "src" should be expanded by default
    const srcItem = canvasElement.querySelector('[data-node-id="src"]')
    expect(srcItem).toBeTruthy()
    expect(srcItem?.getAttribute('aria-expanded')).toBe('true')

    // Click "components" to expand
    const componentsItem = canvasElement.querySelector('[data-node-id="components"]')
    if (componentsItem) {
      await userEvent.click(componentsItem)

      await waitFor(() => {
        expect(componentsItem.getAttribute('aria-expanded')).toBe('true')
      })

      // Children should be visible
      expect(canvas.getByText('Button.tsx')).toBeTruthy()
      expect(canvas.getByText('Modal.tsx')).toBeTruthy()
    }
  },
}

export const MultiSelect: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-6 border rounded-lg">
      <TreeView
        nodes={fileTree}
        defaultExpanded={['src', 'components']}
        multiSelect
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Select first item
    const buttonFile = canvas.getByText('Button.tsx')
    await userEvent.click(buttonFile)

    await waitFor(() => {
      const item = buttonFile.closest('[role="treeitem"]')
      expect(item?.getAttribute('aria-selected')).toBe('true')
    })

    // Select second item
    const modalFile = canvas.getByText('Modal.tsx')
    await userEvent.click(modalFile)

    await waitFor(() => {
      const item = modalFile.closest('[role="treeitem"]')
      expect(item?.getAttribute('aria-selected')).toBe('true')
    })
  },
}
