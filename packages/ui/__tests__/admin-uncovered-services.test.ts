/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for previously uncovered admin services:
 * - tenantHooks (useTenants, useActiveTenant)
 * - workflowHooks (useWorkflowEditor, useWorkflowExecution)
 * - enterpriseApi (enterpriseApi functions)
 * - enterpriseMockData (data exports)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ============ Enterprise Mock Data ============
import { mockDepartments, mockEnterpriseUsers, mockAuditLogs, mockSSOConfig } from '../src/admin/services/enterpriseMockData'

describe('enterpriseMockData', () => {
  it('should export mockDepartments as array', () => {
    expect(Array.isArray(mockDepartments)).toBe(true)
    expect(mockDepartments.length).toBeGreaterThan(0)
  })

  it('should have valid department structure', () => {
    const dept = mockDepartments[0]
    expect(dept).toHaveProperty('id')
    expect(dept).toHaveProperty('name')
    expect(dept).toHaveProperty('code')
    expect(dept).toHaveProperty('parentCode')
  })

  it('should export mockEnterpriseUsers as array', () => {
    expect(Array.isArray(mockEnterpriseUsers)).toBe(true)
    expect(mockEnterpriseUsers.length).toBeGreaterThan(0)
  })

  it('should have valid user structure', () => {
    const user = mockEnterpriseUsers[0]
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('userName')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('role')
  })

  it('should export mockAuditLogs as array', () => {
    expect(Array.isArray(mockAuditLogs)).toBe(true)
    expect(mockAuditLogs.length).toBeGreaterThan(0)
  })

  it('should have valid audit log structure', () => {
    const log = mockAuditLogs[0]
    expect(log).toHaveProperty('id')
    expect(log).toHaveProperty('createdAt')
    expect(log).toHaveProperty('userName')
    expect(log).toHaveProperty('event')
  })

  it('should export mockSSOConfig', () => {
    expect(mockSSOConfig).toBeDefined()
    expect(mockSSOConfig).toHaveProperty('companyCode')
    expect(mockSSOConfig).toHaveProperty('enabled')
    expect(mockSSOConfig.enabled).toBe(true)
  })
})

// ============ Enterprise API ============
import { enterpriseApi } from '../src/admin/services/enterpriseApi'

describe('enterpriseApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have getDepartments method', () => {
    expect(typeof enterpriseApi.getDepartments).toBe('function')
  })

  it('should have bulkUpdateDepartments method', () => {
    expect(typeof enterpriseApi.bulkUpdateDepartments).toBe('function')
  })

  it('should have getUsers method', () => {
    expect(typeof enterpriseApi.getUsers).toBe('function')
  })

  it('should have bulkUpdateUsers method', () => {
    expect(typeof enterpriseApi.bulkUpdateUsers).toBe('function')
  })

  it('should have getAuditLogs method', () => {
    expect(typeof enterpriseApi.getAuditLogs).toBe('function')
  })

  it('should have downloadAuditLogsExcel method', () => {
    expect(typeof enterpriseApi.downloadAuditLogsExcel).toBe('function')
  })

  it('should call fetch for getDepartments', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'ok', data: { departments: [] } }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    const result = await enterpriseApi.getDepartments()
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/enterprise/admin/departments'),
    )
    expect(result).toEqual({ departments: [] })
  })

  it('should call fetch for getUsers with params', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'ok', data: { users: [], totalUserCount: 0 } }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await enterpriseApi.getUsers({ name: 'test' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('name=test'),
    )
  })

  it('should throw on non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server Error' }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await expect(enterpriseApi.getDepartments()).rejects.toThrow('Server Error')
  })

  it('should throw on API error result', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'error' }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await expect(enterpriseApi.getDepartments()).rejects.toThrow('API returned error')
  })

  it('should call fetch for bulkUpdateDepartments with POST', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'ok', data: { created: 0, updated: 0, deleted: 0 } }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await enterpriseApi.bulkUpdateDepartments([])
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/departments/bulk'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('should call fetch for getAuditLogs', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'ok', data: { userActionLogs: [] } }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    const result = await enterpriseApi.getAuditLogs()
    expect(result).toEqual({ userActionLogs: [] })
  })

  it('should download audit logs as blob', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/xlsx' })
    const mockResponse = {
      ok: true,
      blob: async () => mockBlob,
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    const result = await enterpriseApi.downloadAuditLogsExcel({})
    expect(result).toBeInstanceOf(Blob)
  })

  it('should throw on download error', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await expect(enterpriseApi.downloadAuditLogsExcel({})).rejects.toThrow('HTTP 404')
  })

  it('should handle network error in json parse', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => { throw new Error('parse failed') },
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await expect(enterpriseApi.getDepartments()).rejects.toThrow('Network error')
  })

  it('should call bulkUpdateUsers with correct params', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ result: 'ok', data: { created: 0, updated: 0, deleted: 0 } }),
    }
    ;(globalThis.fetch as any).mockResolvedValue(mockResponse)

    await enterpriseApi.bulkUpdateUsers([], 'email', true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('idType=email'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

// ============ Tenant Hooks ============
// We need to mock the tenantService module
vi.mock('../src/admin/services/tenantService', () => {
  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Corp',
    domain: 'test.com',
    logo: 'T',
    theme: { primaryColor: '#000', accentColor: '#fff', sidebarBg: '#eee', headerBg: '#ddd' },
    plan: 'enterprise' as const,
    maxUsers: 1000,
    activeUsers: 500,
    createdAt: '2025-01-01',
    status: 'active' as const,
  }

  return {
    getTenants: vi.fn().mockResolvedValue([mockTenant]),
    getTenantById: vi.fn().mockResolvedValue(mockTenant),
    createTenant: vi.fn().mockResolvedValue(mockTenant),
    updateTenant: vi.fn().mockResolvedValue(mockTenant),
    deleteTenant: vi.fn().mockResolvedValue(true),
    getActiveTenantId: vi.fn().mockReturnValue(null),
    setActiveTenantId: vi.fn(),
    applyTenantTheme: vi.fn(),
    clearTenantTheme: vi.fn(),
  }
})

import { useTenants, useActiveTenant } from '../src/admin/services/tenantHooks'
import * as tenantService from '../src/admin/services/tenantService'

describe('useTenants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load tenants on mount', async () => {
    const { result } = renderHook(() => useTenants())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenants).toHaveLength(1)
    expect(result.current.tenants[0].name).toBe('Test Corp')
  })

  it('should handle error on load', async () => {
    ;(tenantService.getTenants as any).mockRejectedValueOnce(new Error('fetch failed'))

    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('fetch failed')
  })

  it('should provide create function', async () => {
    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.create({
        name: 'New',
        domain: 'new.com',
        logo: 'N',
        theme: { primaryColor: '#000', accentColor: '#fff', sidebarBg: '#eee', headerBg: '#ddd' },
        plan: 'basic',
        maxUsers: 100,
      })
    })

    expect(tenantService.createTenant).toHaveBeenCalled()
  })

  it('should provide update function', async () => {
    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.update('tenant-1', { name: 'Updated' })
    })

    expect(tenantService.updateTenant).toHaveBeenCalledWith('tenant-1', { name: 'Updated' })
  })

  it('should provide remove function', async () => {
    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.remove('tenant-1')
    })

    expect(tenantService.deleteTenant).toHaveBeenCalledWith('tenant-1')
  })

  it('should provide refresh function', async () => {
    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.refresh()
    })

    // getTenants called: once on mount, once on refresh
    expect(tenantService.getTenants).toHaveBeenCalledTimes(2)
  })

  it('should handle non-Error objects in catch', async () => {
    ;(tenantService.getTenants as any).mockRejectedValueOnce('string error')

    const { result } = renderHook(() => useTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Unknown error')
  })
})

describe('useActiveTenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with null tenant when no active id', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue(null)

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.activeTenant).toBeNull()
  })

  it('should load active tenant when id exists', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue('tenant-1')

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.activeTenant).toBeDefined()
    expect(result.current.activeTenant?.name).toBe('Test Corp')
    expect(tenantService.applyTenantTheme).toHaveBeenCalled()
  })

  it('should switch tenant', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue(null)

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.switchTenant('tenant-1')
    })

    expect(tenantService.setActiveTenantId).toHaveBeenCalledWith('tenant-1')
    expect(tenantService.applyTenantTheme).toHaveBeenCalled()
  })

  it('should clear tenant', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue('tenant-1')

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.clearTenant()
    })

    expect(result.current.activeTenant).toBeNull()
    expect(tenantService.clearTenantTheme).toHaveBeenCalled()
  })

  it('should compute tenantStats when tenant exists', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue('tenant-1')

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenantStats).toBeDefined()
    expect(result.current.tenantStats?.usagePercent).toBe(50)
    expect(result.current.tenantStats?.remainingSeats).toBe(500)
  })

  it('should return null tenantStats when no tenant', async () => {
    ;(tenantService.getActiveTenantId as any).mockReturnValue(null)

    const { result } = renderHook(() => useActiveTenant())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenantStats).toBeNull()
  })
})

// ============ Workflow Hooks ============
// Mock the workflowService
vi.mock('../src/admin/services/workflowService', () => {
  const mockWorkflow = {
    id: 'wf-1',
    name: 'Test Workflow',
    description: 'Test',
    nodes: [
      { id: 'n1', type: 'input', label: 'Input', description: '', position: { x: 0, y: 0 }, config: {}, status: 'idle' },
    ],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  }

  return {
    getNodeCatalog: vi.fn().mockReturnValue([
      { type: 'llm', name: 'LLM', description: '', icon: '', category: 'processing', configSchema: [] },
    ]),
    getWorkflowTemplates: vi.fn().mockReturnValue([
      { id: 'tpl-1', name: 'RAG', description: '', category: 'rag', nodes: [], edges: [], icon: '' },
    ]),
    getWorkflows: vi.fn().mockReturnValue([mockWorkflow]),
    getWorkflow: vi.fn().mockReturnValue(mockWorkflow),
    createWorkflow: vi.fn().mockReturnValue(mockWorkflow),
    createFromTemplate: vi.fn().mockReturnValue(mockWorkflow),
    saveWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    addNode: vi.fn(),
    removeNode: vi.fn(),
    updateNodePosition: vi.fn(),
    updateNodeConfig: vi.fn(),
    addEdge: vi.fn(),
    removeEdge: vi.fn(),
    executeWorkflow: vi.fn().mockReturnValue({
      id: 'exec-1',
      workflowId: 'wf-1',
      status: 'pending',
      startedAt: Date.now(),
      nodeResults: {},
    }),
  }
})

import { useWorkflowEditor, useWorkflowExecution } from '../src/admin/services/workflowHooks'
import * as workflowService from '../src/admin/services/workflowService'

describe('useWorkflowEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null workflow when no id', () => {
    const { result } = renderHook(() => useWorkflowEditor())
    expect(result.current.workflow).toBeNull()
  })

  it('should initialize with workflow when id provided', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))
    expect(result.current.workflow).toBeDefined()
    expect(result.current.workflow?.name).toBe('Test Workflow')
  })

  it('should provide catalog', () => {
    const { result } = renderHook(() => useWorkflowEditor())
    expect(result.current.catalog).toHaveLength(1)
    expect(result.current.catalog[0].type).toBe('llm')
  })

  it('should provide templates', () => {
    const { result } = renderHook(() => useWorkflowEditor())
    expect(result.current.templates).toHaveLength(1)
    expect(result.current.templates[0].name).toBe('RAG')
  })

  it('should create new workflow', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.createNew('New WF', 'description')
    })

    expect(workflowService.createWorkflow).toHaveBeenCalledWith('New WF', 'description')
  })

  it('should create from template', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.createFromTemplate('tpl-1')
    })

    expect(workflowService.createFromTemplate).toHaveBeenCalledWith('tpl-1')
  })

  it('should add node', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.addNode('llm', { x: 100, y: 200 })
    })

    expect(workflowService.addNode).toHaveBeenCalledWith('wf-1', 'llm', { x: 100, y: 200 })
  })

  it('should remove node', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.removeNode('n1')
    })

    expect(workflowService.removeNode).toHaveBeenCalledWith('wf-1', 'n1')
  })

  it('should select and deselect node', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.selectNode('n1')
    })

    expect(result.current.selectedNodeId).toBe('n1')
    expect(result.current.selectedNode?.id).toBe('n1')

    act(() => {
      result.current.selectNode(null)
    })

    expect(result.current.selectedNodeId).toBeNull()
    expect(result.current.selectedNode).toBeNull()
  })

  it('should update node config', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.updateNodeConfig('n1', { model: 'gpt-4' })
    })

    expect(workflowService.updateNodeConfig).toHaveBeenCalledWith('wf-1', 'n1', { model: 'gpt-4' })
  })

  it('should move node', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.moveNode('n1', { x: 200, y: 300 })
    })

    expect(workflowService.updateNodePosition).toHaveBeenCalledWith('wf-1', 'n1', { x: 200, y: 300 })
  })

  it('should add and remove edge', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.addEdge('n1', 'n2')
    })

    expect(workflowService.addEdge).toHaveBeenCalledWith('wf-1', 'n1', 'n2')

    act(() => {
      result.current.removeEdge('edge-1')
    })

    expect(workflowService.removeEdge).toHaveBeenCalledWith('wf-1', 'edge-1')
  })

  it('should save workflow', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.save()
    })

    expect(workflowService.saveWorkflow).toHaveBeenCalled()
  })

  it('should delete workflow', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.deleteWorkflow('wf-1')
    })

    expect(workflowService.deleteWorkflow).toHaveBeenCalledWith('wf-1')
    expect(result.current.workflow).toBeNull()
  })

  it('should execute workflow', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.execute()
    })

    expect(workflowService.executeWorkflow).toHaveBeenCalledWith('wf-1')
  })

  it('should load template via loadTemplate', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.loadTemplate('tpl-1')
    })

    expect(workflowService.createFromTemplate).toHaveBeenCalledWith('tpl-1')
  })

  it('should create new workflow via newWorkflow', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.newWorkflow()
    })

    expect(workflowService.createWorkflow).toHaveBeenCalledWith('새 워크플로우', '')
  })

  it('should reset statuses', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))

    act(() => {
      result.current.execute()
    })

    expect(result.current.execution).toBeDefined()

    act(() => {
      result.current.resetStatuses()
    })

    expect(result.current.execution).toBeNull()
  })

  it('should not add node when no workflow', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.addNode('llm', { x: 0, y: 0 })
    })

    expect(workflowService.addNode).not.toHaveBeenCalled()
  })

  it('should provide nodes and edges', () => {
    const { result } = renderHook(() => useWorkflowEditor('wf-1'))
    expect(result.current.nodes).toHaveLength(1)
    expect(result.current.edges).toHaveLength(0)
  })

  it('should load workflow by id', () => {
    const { result } = renderHook(() => useWorkflowEditor())

    act(() => {
      result.current.loadWorkflow('wf-1')
    })

    expect(workflowService.getWorkflow).toHaveBeenCalledWith('wf-1')
  })
})

describe('useWorkflowExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start with no execution', () => {
    const { result } = renderHook(() => useWorkflowExecution())
    expect(result.current.execution).toBeNull()
    expect(result.current.isRunning).toBe(false)
  })

  it('should not execute without workflowId', () => {
    const { result } = renderHook(() => useWorkflowExecution())

    act(() => {
      result.current.execute()
    })

    expect(result.current.isRunning).toBe(false)
  })

  it('should provide clearResults', () => {
    const { result } = renderHook(() => useWorkflowExecution())

    act(() => {
      result.current.clearResults()
    })

    expect(result.current.execution).toBeNull()
  })

  it('should provide nodeStatuses as empty record initially', () => {
    const { result } = renderHook(() => useWorkflowExecution())
    expect(result.current.nodeStatuses).toEqual({})
  })

  it('should expose executing alias for isRunning', () => {
    const { result } = renderHook(() => useWorkflowExecution())
    expect(result.current.executing).toBe(result.current.isRunning)
  })

  it('should expose results alias for nodeStatuses', () => {
    const { result } = renderHook(() => useWorkflowExecution())
    expect(result.current.results).toEqual(result.current.nodeStatuses)
  })
})
