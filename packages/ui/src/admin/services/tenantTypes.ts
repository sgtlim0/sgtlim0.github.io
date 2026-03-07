/**
 * Tenant types for multi-tenant system
 */

export interface TenantTheme {
  primaryColor: string
  accentColor: string
  sidebarBg: string
  headerBg: string
  logoUrl?: string
}

export interface Tenant {
  readonly id: string
  readonly name: string
  readonly domain: string
  readonly logo: string
  readonly theme: TenantTheme
  readonly plan: 'basic' | 'pro' | 'enterprise'
  readonly maxUsers: number
  readonly activeUsers: number
  readonly createdAt: string
  readonly status: 'active' | 'suspended' | 'trial'
}

export interface TenantCreateInput {
  name: string
  domain: string
  logo: string
  theme: TenantTheme
  plan: Tenant['plan']
  maxUsers: number
}

export interface TenantUpdateInput {
  name?: string
  domain?: string
  logo?: string
  theme?: Partial<TenantTheme>
  plan?: Tenant['plan']
  maxUsers?: number
  status?: Tenant['status']
}
