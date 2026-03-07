import type { Meta, StoryObj } from '@storybook/react'
import { TenantSelector } from '@hchat/ui/admin'
import type { Tenant } from '@hchat/ui/admin'

const mockTenants: Tenant[] = [
  {
    id: 'tenant-hyundai',
    name: '현대자동차',
    domain: 'hyundai.hchat.ai',
    logo: 'H',
    theme: {
      primaryColor: '#002C5F',
      accentColor: '#00AAD2',
      sidebarBg: '#001A3A',
      headerBg: '#002C5F',
    },
    plan: 'enterprise',
    maxUsers: 10000,
    activeUsers: 4520,
    createdAt: '2025-01-15',
    status: 'active',
  },
  {
    id: 'tenant-kia',
    name: '기아',
    domain: 'kia.hchat.ai',
    logo: 'K',
    theme: {
      primaryColor: '#05141F',
      accentColor: '#BB162B',
      sidebarBg: '#0A1F2E',
      headerBg: '#05141F',
    },
    plan: 'enterprise',
    maxUsers: 8000,
    activeUsers: 3180,
    createdAt: '2025-02-01',
    status: 'active',
  },
  {
    id: 'tenant-genesis',
    name: '제네시스',
    domain: 'genesis.hchat.ai',
    logo: 'G',
    theme: {
      primaryColor: '#1A1A2E',
      accentColor: '#C9A96E',
      sidebarBg: '#12121F',
      headerBg: '#1A1A2E',
    },
    plan: 'pro',
    maxUsers: 3000,
    activeUsers: 1240,
    createdAt: '2025-03-10',
    status: 'active',
  },
]

const meta: Meta<typeof TenantSelector> = {
  title: 'Admin/Tenant/TenantSelector',
  component: TenantSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tenants: mockTenants,
    activeTenantId: null,
    onSelect: (id) => {},
  },
}

export const WithActiveTenant: Story = {
  args: {
    tenants: mockTenants,
    activeTenantId: 'tenant-hyundai',
    onSelect: (id) => {},
  },
}
