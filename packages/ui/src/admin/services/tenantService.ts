/**
 * Tenant Service — Multi-tenant management
 *
 * Mock implementation with localStorage persistence.
 * Provides CRUD operations for tenants and CSS variable overrides.
 */

import type { Tenant, TenantCreateInput, TenantUpdateInput, TenantTheme } from './tenantTypes'

const STORAGE_KEY = 'hchat-tenants'
const ACTIVE_TENANT_KEY = 'hchat-active-tenant'

const MOCK_TENANTS: Tenant[] = [
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
    createdAt: '2025-01-15T00:00:00Z',
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
    createdAt: '2025-02-01T00:00:00Z',
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
    createdAt: '2025-03-10T00:00:00Z',
    status: 'active',
  },
]

function getStoredTenants(): Tenant[] {
  if (typeof window === 'undefined') return MOCK_TENANTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_TENANTS
  } catch {
    return MOCK_TENANTS
  }
}

function saveTenants(tenants: Tenant[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants))
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getTenants(): Promise<Tenant[]> {
  await delay(200)
  return getStoredTenants()
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  await delay(100)
  return getStoredTenants().find((t) => t.id === id) ?? null
}

export async function createTenant(input: TenantCreateInput): Promise<Tenant> {
  await delay(300)
  const tenants = getStoredTenants()
  const newTenant: Tenant = {
    ...input,
    id: `tenant-${Date.now()}`,
    activeUsers: 0,
    createdAt: new Date().toISOString(),
    status: 'trial',
  }
  saveTenants([...tenants, newTenant])
  return newTenant
}

export async function updateTenant(id: string, input: TenantUpdateInput): Promise<Tenant | null> {
  await delay(200)
  const tenants = getStoredTenants()
  let updated: Tenant | null = null

  const newTenants = tenants.map((t) => {
    if (t.id !== id) return t
    updated = {
      ...t,
      ...input,
      theme: input.theme ? { ...t.theme, ...input.theme } : t.theme,
    }
    return updated
  })

  if (updated) saveTenants(newTenants)
  return updated
}

export async function deleteTenant(id: string): Promise<boolean> {
  await delay(200)
  const tenants = getStoredTenants()
  const filtered = tenants.filter((t) => t.id !== id)
  if (filtered.length === tenants.length) return false
  saveTenants(filtered)
  return true
}

export function getActiveTenantId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_TENANT_KEY)
}

export function setActiveTenantId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_TENANT_KEY, id)
}

export function applyTenantTheme(theme: TenantTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--tenant-primary', theme.primaryColor)
  root.style.setProperty('--tenant-accent', theme.accentColor)
  root.style.setProperty('--tenant-sidebar-bg', theme.sidebarBg)
  root.style.setProperty('--tenant-header-bg', theme.headerBg)
}

export function clearTenantTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.removeProperty('--tenant-primary')
  root.style.removeProperty('--tenant-accent')
  root.style.removeProperty('--tenant-sidebar-bg')
  root.style.removeProperty('--tenant-header-bg')
}
