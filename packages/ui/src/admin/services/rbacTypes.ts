/**
 * RBAC (Role-Based Access Control) types
 */

export type Permission =
  | 'dashboard.view'
  | 'dashboard.edit'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'roles.view'
  | 'roles.manage'
  | 'models.view'
  | 'models.manage'
  | 'models.pricing'
  | 'analytics.view'
  | 'analytics.export'
  | 'settings.view'
  | 'settings.edit'
  | 'audit.view'
  | 'sso.manage'
  | 'tenant.manage'
  | 'marketplace.view'
  | 'marketplace.install'
  | 'prompts.view'
  | 'prompts.edit'
  | 'prompts.publish'
  | 'workflows.view'
  | 'workflows.edit'
  | 'workflows.execute'

export interface Role {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly permissions: Permission[]
  readonly isSystem: boolean
  readonly userCount: number
  readonly createdAt: string
}

export interface PermissionGroup {
  readonly category: string
  readonly permissions: { id: Permission; label: string; description: string }[]
}

export interface RoleAssignment {
  readonly userId: string
  readonly userName: string
  readonly roleId: string
  readonly roleName: string
  readonly assignedAt: string
  readonly assignedBy: string
  readonly expiresAt?: string
}

export interface PermissionDelegation {
  readonly id: string
  readonly fromUserId: string
  readonly toUserId: string
  readonly toUserName: string
  readonly permissions: Permission[]
  readonly reason: string
  readonly startDate: string
  readonly endDate: string
  readonly status: 'active' | 'expired' | 'revoked'
}

export interface PermissionCheckResult {
  readonly allowed: boolean
  readonly permission: Permission
  readonly source: 'role' | 'delegation' | 'denied'
  readonly role?: string
}
