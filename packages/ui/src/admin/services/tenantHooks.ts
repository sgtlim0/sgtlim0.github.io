'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Tenant, TenantCreateInput, TenantUpdateInput } from './tenantTypes'
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
} from './tenantService'

interface TenantsState {
  tenants: Tenant[]
  loading: boolean
  error: Error | null
}

export function useTenants() {
  const [state, setState] = useState<TenantsState>({
    tenants: [],
    loading: true,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const tenants = await getTenants()
      setState({ tenants, loading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: TenantCreateInput) => {
      const tenant = await createTenant(input)
      await refresh()
      return tenant
    },
    [refresh],
  )

  const update = useCallback(
    async (id: string, input: TenantUpdateInput) => {
      const result = await updateTenant(id, input)
      await refresh()
      return result
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteTenant(id)
      await refresh()
      return result
    },
    [refresh],
  )

  return { ...state, refresh, create, update, remove }
}

export function useActiveTenant() {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActive = async () => {
      const id = getActiveTenantId()
      if (id) {
        const tenant = await getTenantById(id)
        if (tenant) {
          setActiveTenant(tenant)
          applyTenantTheme(tenant.theme)
        }
      }
      setLoading(false)
    }
    loadActive()
  }, [])

  const switchTenant = useCallback(async (id: string) => {
    setLoading(true)
    const tenant = await getTenantById(id)
    if (tenant) {
      setActiveTenantId(id)
      setActiveTenant(tenant)
      applyTenantTheme(tenant.theme)
    }
    setLoading(false)
  }, [])

  const clearTenant = useCallback(() => {
    setActiveTenant(null)
    clearTenantTheme()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hchat-active-tenant')
    }
  }, [])

  const tenantStats = useMemo(() => {
    if (!activeTenant) return null
    return {
      usagePercent: Math.round((activeTenant.activeUsers / activeTenant.maxUsers) * 100),
      remainingSeats: activeTenant.maxUsers - activeTenant.activeUsers,
    }
  }, [activeTenant])

  return { activeTenant, loading, switchTenant, clearTenant, tenantStats }
}
