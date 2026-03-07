import { describe, it, expect, beforeEach } from 'vitest'
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissionGroups,
  checkPermission,
  getDelegations,
  createDelegation,
} from '../src/admin/services/rbacService'

describe('rbacService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getRoles', () => {
    it('should return default roles', async () => {
      const roles = await getRoles()
      expect(roles.length).toBe(4)
    })

    it('should include admin role with all permissions', async () => {
      const roles = await getRoles()
      const admin = roles.find((r) => r.name === '관리자')
      expect(admin).toBeDefined()
      expect(admin!.permissions.length).toBeGreaterThan(10)
      expect(admin!.isSystem).toBe(true)
    })

    it('should include viewer role with limited permissions', async () => {
      const roles = await getRoles()
      const viewer = roles.find((r) => r.name === '뷰어')
      expect(viewer).toBeDefined()
      expect(
        viewer!.permissions.every((p) => p.endsWith('.view') || p.includes('marketplace')),
      ).toBe(true)
    })
  })

  describe('getRoleById', () => {
    it('should return role for valid id', async () => {
      const role = await getRoleById('role-admin')
      expect(role).not.toBeNull()
      expect(role!.name).toBe('관리자')
    })

    it('should return null for invalid id', async () => {
      const role = await getRoleById('nonexistent')
      expect(role).toBeNull()
    })
  })

  describe('createRole', () => {
    it('should create custom role', async () => {
      const role = await createRole('편집자', '콘텐츠 편집 권한', [
        'prompts.view',
        'prompts.edit',
        'prompts.publish',
      ])
      expect(role.name).toBe('편집자')
      expect(role.permissions.length).toBe(3)
      expect(role.isSystem).toBe(false)
      expect(role.userCount).toBe(0)
    })

    it('should persist new role', async () => {
      await createRole('Test', 'test', ['dashboard.view'])
      const roles = await getRoles()
      expect(roles.length).toBe(5)
    })
  })

  describe('updateRole', () => {
    it('should update custom role permissions', async () => {
      const created = await createRole('Custom', 'test', ['dashboard.view'])
      const updated = await updateRole(created.id, ['dashboard.view', 'dashboard.edit'])
      expect(updated).not.toBeNull()
      expect(updated!.permissions.length).toBe(2)
    })

    it('should not update system roles', async () => {
      const updated = await updateRole('role-admin', ['dashboard.view'])
      expect(updated).toBeNull()
    })

    it('should return null for non-existent role', async () => {
      const result = await updateRole('nonexistent', [])
      expect(result).toBeNull()
    })
  })

  describe('deleteRole', () => {
    it('should delete custom role', async () => {
      const created = await createRole('ToDelete', 'test', [])
      const result = await deleteRole(created.id)
      expect(result).toBe(true)
    })

    it('should not delete system roles', async () => {
      const result = await deleteRole('role-admin')
      expect(result).toBe(false)
    })

    it('should return false for non-existent', async () => {
      const result = await deleteRole('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getPermissionGroups', () => {
    it('should return grouped permissions', () => {
      const groups = getPermissionGroups()
      expect(groups.length).toBeGreaterThan(0)
      groups.forEach((g) => {
        expect(g.category).toBeDefined()
        expect(g.permissions.length).toBeGreaterThan(0)
        g.permissions.forEach((p) => {
          expect(p.id).toBeDefined()
          expect(p.label).toBeDefined()
        })
      })
    })
  })

  describe('checkPermission', () => {
    it('should allow valid permission', () => {
      const result = checkPermission(['dashboard.view', 'users.view'], 'dashboard.view')
      expect(result.allowed).toBe(true)
      expect(result.source).toBe('role')
    })

    it('should deny missing permission', () => {
      const result = checkPermission(['dashboard.view'], 'users.delete')
      expect(result.allowed).toBe(false)
      expect(result.source).toBe('denied')
    })
  })

  describe('getDelegations', () => {
    it('should return delegation list', async () => {
      const delegations = await getDelegations()
      expect(delegations.length).toBeGreaterThan(0)
      expect(delegations[0].status).toBe('active')
    })
  })

  describe('createDelegation', () => {
    it('should create a new delegation', async () => {
      const delegation = await createDelegation(
        'user-10',
        '김대리',
        ['users.view', 'users.edit'],
        '업무 대리',
        '2026-03-15',
      )
      expect(delegation.toUserName).toBe('김대리')
      expect(delegation.permissions.length).toBe(2)
      expect(delegation.status).toBe('active')
    })
  })
})
