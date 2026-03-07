'use client'

import { useState } from 'react'
import type { Tenant } from './services/tenantTypes'

export interface TenantManagementProps {
  tenants: Tenant[]
  activeTenantId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, status: Tenant['status']) => void
}

const STATUS_CONFIG: Record<Tenant['status'], { label: string; className: string }> = {
  active: {
    label: '활성',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  suspended: {
    label: '정지',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  trial: {
    label: '체험',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
}

const PLAN_CONFIG: Record<Tenant['plan'], string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default function TenantManagement({
  tenants,
  activeTenantId,
  onSelect,
  onDelete,
  onUpdate,
}: TenantManagementProps) {
  const [search, setSearch] = useState('')

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">테넌트 관리</h2>
          <p className="text-sm text-text-secondary mt-1">
            {tenants.length}개 조직 | 활성 {tenants.filter((t) => t.status === 'active').length}개
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="조직 검색..."
          aria-label="테넌트 검색"
          className="px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-bg-section border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                조직
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                도메인
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                플랜
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tenant) => {
              const status = STATUS_CONFIG[tenant.status]
              const isActive = tenant.id === activeTenantId
              const usage = Math.round((tenant.activeUsers / tenant.maxUsers) * 100)
              return (
                <tr
                  key={tenant.id}
                  className={[
                    'border-b border-border-light transition-colors',
                    isActive ? 'bg-admin-teal/5' : 'hover:bg-admin-table-hover',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: tenant.theme.primaryColor }}
                      >
                        {tenant.logo}
                      </div>
                      <span className="font-medium text-text-primary">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{tenant.domain}</td>
                  <td className="px-4 py-3 text-text-primary">{PLAN_CONFIG[tenant.plan]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full bg-admin-teal rounded-full"
                          style={{ width: `${usage}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary tabular-nums">
                        {tenant.activeUsers.toLocaleString()}/{tenant.maxUsers.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelect(tenant.id)}
                        className="text-xs text-admin-teal hover:underline"
                      >
                        {isActive ? '선택됨' : '전환'}
                      </button>
                      {tenant.status === 'active' ? (
                        <button
                          onClick={() => onUpdate(tenant.id, 'suspended')}
                          className="text-xs text-yellow-600 hover:underline"
                        >
                          정지
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdate(tenant.id, 'active')}
                          className="text-xs text-green-600 hover:underline"
                        >
                          활성화
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(tenant.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-text-secondary text-sm">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  )
}
