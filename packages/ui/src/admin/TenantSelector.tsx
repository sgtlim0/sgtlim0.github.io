'use client'

import type { Tenant } from './services/tenantTypes'

export interface TenantSelectorProps {
  tenants: Tenant[]
  activeTenantId: string | null
  onSelect: (tenantId: string) => void
}

const PLAN_BADGES: Record<Tenant['plan'], { label: string; className: string }> = {
  basic: {
    label: 'Basic',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  pro: { label: 'Pro', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  enterprise: {
    label: 'Enterprise',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
}

export default function TenantSelector({ tenants, activeTenantId, onSelect }: TenantSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {tenants.map((tenant) => {
        const isActive = tenant.id === activeTenantId
        const badge = PLAN_BADGES[tenant.plan]
        return (
          <button
            key={tenant.id}
            onClick={() => onSelect(tenant.id)}
            className={[
              'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
              isActive
                ? 'border-admin-teal bg-admin-teal/5 ring-1 ring-admin-teal'
                : 'border-border hover:border-admin-teal/40 hover:bg-admin-bg-section',
            ].join(' ')}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: tenant.theme.primaryColor }}
            >
              {tenant.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {tenant.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <span className="text-xs text-text-secondary">{tenant.domain}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-text-secondary">
                {tenant.activeUsers.toLocaleString()}/{tenant.maxUsers.toLocaleString()}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
