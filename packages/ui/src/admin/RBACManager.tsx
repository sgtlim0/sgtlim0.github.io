'use client'

import { useState, useEffect } from 'react'
import type { Role, PermissionGroup } from './services/rbacTypes'
import { getRoles, getPermissionGroups } from './services/rbacService'

export default function RBACManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRoles().then((r) => {
      setRoles(r)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-text-secondary">권한 로딩 중...</div>

  const groups = getPermissionGroups()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">역할 및 권한 관리 (RBAC)</h2>
        <p className="text-sm text-text-secondary mt-1">
          {roles.length}개 역할 | {groups.flatMap((g) => g.permissions).length}개 권한
        </p>
      </div>

      {/* Roles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
            className={`p-4 rounded-xl border text-left ${selectedRole?.id === role.id ? 'border-admin-teal bg-admin-teal/5' : 'border-border bg-admin-bg-card hover:border-admin-teal/30'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{role.name}</span>
              {role.isSystem && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  시스템
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">{role.description}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-text-tertiary">
              <span>{role.permissions.length}개 권한</span>
              <span>{role.userCount}명</span>
            </div>
          </button>
        ))}
      </div>

      {/* Permission Matrix */}
      {selectedRole && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary">
            {selectedRole.name} — 권한 매트릭스
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-admin-bg-section border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    권한
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary w-20">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) =>
                  group.permissions.map((perm, i) => (
                    <tr key={perm.id} className="border-b border-border-light">
                      {i === 0 && (
                        <td
                          className="px-4 py-2 text-xs font-semibold text-text-primary align-top"
                          rowSpan={group.permissions.length}
                        >
                          {group.category}
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <div className="text-xs text-text-primary">{perm.label}</div>
                        <div className="text-[10px] text-text-tertiary">{perm.description}</div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {selectedRole.permissions.includes(perm.id) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs leading-5">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-xs leading-5">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
