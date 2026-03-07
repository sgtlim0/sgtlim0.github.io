/**
 * RBAC Service — Role management, permission checks, delegation
 */

import type {
  Role,
  Permission,
  PermissionGroup,
  RoleAssignment,
  PermissionDelegation,
  PermissionCheckResult,
} from './rbacTypes'

const STORAGE_KEY = 'hchat-rbac-roles'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: '대시보드',
    permissions: [
      { id: 'dashboard.view', label: '대시보드 조회', description: '대시보드 페이지 접근' },
      { id: 'dashboard.edit', label: '대시보드 편집', description: '위젯 추가/제거/레이아웃 변경' },
    ],
  },
  {
    category: '사용자 관리',
    permissions: [
      { id: 'users.view', label: '사용자 조회', description: '사용자 목록 및 상세 정보 조회' },
      { id: 'users.create', label: '사용자 생성', description: '새 사용자 계정 생성' },
      { id: 'users.edit', label: '사용자 수정', description: '사용자 정보 및 역할 변경' },
      { id: 'users.delete', label: '사용자 삭제', description: '사용자 계정 비활성화/삭제' },
    ],
  },
  {
    category: '역할 관리',
    permissions: [
      { id: 'roles.view', label: '역할 조회', description: '역할 및 권한 매트릭스 조회' },
      { id: 'roles.manage', label: '역할 관리', description: '역할 생성/수정/삭제' },
    ],
  },
  {
    category: 'AI 모델',
    permissions: [
      { id: 'models.view', label: '모델 조회', description: '모델 목록 및 상태 조회' },
      { id: 'models.manage', label: '모델 관리', description: '모델 활성화/비활성화' },
      { id: 'models.pricing', label: '가격 관리', description: '모델 가격 정책 변경' },
    ],
  },
  {
    category: '분석',
    permissions: [
      { id: 'analytics.view', label: '분석 조회', description: '분석 대시보드 및 리포트 조회' },
      { id: 'analytics.export', label: '데이터 내보내기', description: 'CSV/PDF 내보내기' },
    ],
  },
  {
    category: '설정',
    permissions: [
      { id: 'settings.view', label: '설정 조회', description: '시스템 설정 조회' },
      { id: 'settings.edit', label: '설정 변경', description: '시스템 설정 수정' },
    ],
  },
]

const MOCK_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: '관리자',
    description: '모든 권한을 가진 시스템 관리자',
    permissions: PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)),
    isSystem: true,
    userCount: 3,
    createdAt: '2025-01-01',
  },
  {
    id: 'role-manager',
    name: '매니저',
    description: '부서 단위 관리 권한',
    permissions: [
      'dashboard.view',
      'dashboard.edit',
      'users.view',
      'users.edit',
      'models.view',
      'analytics.view',
      'analytics.export',
      'prompts.view',
      'prompts.edit',
      'workflows.view',
    ],
    isSystem: true,
    userCount: 12,
    createdAt: '2025-01-01',
  },
  {
    id: 'role-viewer',
    name: '뷰어',
    description: '읽기 전용 접근 권한',
    permissions: [
      'dashboard.view',
      'users.view',
      'models.view',
      'analytics.view',
      'prompts.view',
      'workflows.view',
      'marketplace.view',
    ],
    isSystem: true,
    userCount: 45,
    createdAt: '2025-01-01',
  },
  {
    id: 'role-analyst',
    name: '분석가',
    description: '데이터 분석 및 리포트 전문',
    permissions: ['dashboard.view', 'analytics.view', 'analytics.export', 'models.view'],
    isSystem: false,
    userCount: 8,
    createdAt: '2026-02-10',
  },
]

const MOCK_DELEGATIONS: PermissionDelegation[] = [
  {
    id: 'del-1',
    fromUserId: 'user-admin',
    toUserId: 'user-5',
    toUserName: '박대리',
    permissions: ['users.create', 'users.edit'],
    reason: '관리자 휴가 대리',
    startDate: '2026-03-05',
    endDate: '2026-03-12',
    status: 'active',
  },
]

function getStoredRoles(): Role[] {
  if (typeof window === 'undefined') return MOCK_ROLES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_ROLES
  } catch {
    return MOCK_ROLES
  }
}

function saveRoles(roles: Role[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
}

export async function getRoles(): Promise<Role[]> {
  await delay(200)
  return getStoredRoles()
}

export async function getRoleById(id: string): Promise<Role | null> {
  await delay(100)
  return getStoredRoles().find((r) => r.id === id) ?? null
}

export async function createRole(
  name: string,
  description: string,
  permissions: Permission[],
): Promise<Role> {
  await delay(300)
  const roles = getStoredRoles()
  const newRole: Role = {
    id: `role-${Date.now()}`,
    name,
    description,
    permissions,
    isSystem: false,
    userCount: 0,
    createdAt: new Date().toISOString(),
  }
  saveRoles([...roles, newRole])
  return newRole
}

export async function updateRole(id: string, permissions: Permission[]): Promise<Role | null> {
  await delay(200)
  const roles = getStoredRoles()
  let updated: Role | null = null
  const newRoles = roles.map((r) => {
    if (r.id !== id || r.isSystem) return r
    updated = { ...r, permissions }
    return updated
  })
  if (updated) saveRoles(newRoles)
  return updated
}

export async function deleteRole(id: string): Promise<boolean> {
  await delay(200)
  const roles = getStoredRoles()
  const role = roles.find((r) => r.id === id)
  if (!role || role.isSystem) return false
  saveRoles(roles.filter((r) => r.id !== id))
  return true
}

export function getPermissionGroups(): PermissionGroup[] {
  return PERMISSION_GROUPS
}

export function checkPermission(
  userPermissions: Permission[],
  required: Permission,
): PermissionCheckResult {
  const allowed = userPermissions.includes(required)
  return {
    allowed,
    permission: required,
    source: allowed ? 'role' : 'denied',
  }
}

export async function getDelegations(): Promise<PermissionDelegation[]> {
  await delay(150)
  return MOCK_DELEGATIONS
}

export async function createDelegation(
  toUserId: string,
  toUserName: string,
  permissions: Permission[],
  reason: string,
  endDate: string,
): Promise<PermissionDelegation> {
  await delay(300)
  return {
    id: `del-${Date.now()}`,
    fromUserId: 'current-user',
    toUserId,
    toUserName,
    permissions,
    reason,
    startDate: new Date().toISOString(),
    endDate,
    status: 'active',
  }
}
