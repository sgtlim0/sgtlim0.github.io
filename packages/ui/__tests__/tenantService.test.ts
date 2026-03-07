import { describe, it, expect, beforeEach } from 'vitest'
import {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getActiveTenantId,
  setActiveTenantId,
  applyTenantTheme,
  clearTenantTheme,
} from '../src/admin/services/tenantService'

describe('tenantService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getTenants', () => {
    it('should return mock tenants by default', async () => {
      const tenants = await getTenants()
      expect(tenants.length).toBe(3)
      expect(tenants[0].name).toBe('현대자동차')
      expect(tenants[1].name).toBe('기아')
      expect(tenants[2].name).toBe('제네시스')
    })

    it('should return stored tenants from localStorage', async () => {
      localStorage.setItem('hchat-tenants', JSON.stringify([{ id: 'custom', name: 'Test' }]))
      const tenants = await getTenants()
      expect(tenants.length).toBe(1)
      expect(tenants[0].name).toBe('Test')
    })
  })

  describe('getTenantById', () => {
    it('should find tenant by id', async () => {
      const tenant = await getTenantById('tenant-hyundai')
      expect(tenant).not.toBeNull()
      expect(tenant!.name).toBe('현대자동차')
    })

    it('should return null for non-existent id', async () => {
      const tenant = await getTenantById('nonexistent')
      expect(tenant).toBeNull()
    })
  })

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const tenant = await createTenant({
        name: 'Test Corp',
        domain: 'test.hchat.ai',
        logo: 'T',
        theme: { primaryColor: '#000', accentColor: '#fff', sidebarBg: '#111', headerBg: '#222' },
        plan: 'basic',
        maxUsers: 100,
      })

      expect(tenant.name).toBe('Test Corp')
      expect(tenant.status).toBe('trial')
      expect(tenant.activeUsers).toBe(0)
      expect(tenant.id).toMatch(/^tenant-/)
    })

    it('should persist new tenant', async () => {
      await createTenant({
        name: 'Persisted',
        domain: 'p.hchat.ai',
        logo: 'P',
        theme: { primaryColor: '#000', accentColor: '#fff', sidebarBg: '#111', headerBg: '#222' },
        plan: 'pro',
        maxUsers: 500,
      })

      const tenants = await getTenants()
      expect(tenants.length).toBe(4) // 3 mock + 1 new
    })
  })

  describe('updateTenant', () => {
    it('should update tenant name', async () => {
      const updated = await updateTenant('tenant-hyundai', { name: '현대자동차 (업데이트)' })
      expect(updated).not.toBeNull()
      expect(updated!.name).toBe('현대자동차 (업데이트)')
    })

    it('should merge theme partially', async () => {
      const updated = await updateTenant('tenant-kia', { theme: { primaryColor: '#ff0000' } })
      expect(updated!.theme.primaryColor).toBe('#ff0000')
      expect(updated!.theme.accentColor).toBe('#BB162B') // preserved
    })

    it('should return null for non-existent', async () => {
      const result = await updateTenant('nonexistent', { name: 'x' })
      expect(result).toBeNull()
    })
  })

  describe('deleteTenant', () => {
    it('should delete tenant', async () => {
      const result = await deleteTenant('tenant-genesis')
      expect(result).toBe(true)

      const tenants = await getTenants()
      expect(tenants.length).toBe(2)
    })

    it('should return false for non-existent', async () => {
      const result = await deleteTenant('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('active tenant', () => {
    it('should get/set active tenant id', () => {
      expect(getActiveTenantId()).toBeNull()
      setActiveTenantId('tenant-kia')
      expect(getActiveTenantId()).toBe('tenant-kia')
    })
  })

  describe('applyTenantTheme', () => {
    it('should set CSS variables', () => {
      applyTenantTheme({
        primaryColor: '#002C5F',
        accentColor: '#00AAD2',
        sidebarBg: '#001A3A',
        headerBg: '#002C5F',
      })

      expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('#002C5F')
      expect(document.documentElement.style.getPropertyValue('--tenant-accent')).toBe('#00AAD2')
    })
  })

  describe('clearTenantTheme', () => {
    it('should remove CSS variables', () => {
      applyTenantTheme({
        primaryColor: '#000',
        accentColor: '#fff',
        sidebarBg: '#111',
        headerBg: '#222',
      })
      clearTenantTheme()

      expect(document.documentElement.style.getPropertyValue('--tenant-primary')).toBe('')
    })
  })
})
