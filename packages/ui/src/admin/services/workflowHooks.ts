'use client'

/**
 * AI Workflow Builder Hooks
 *
 * React hooks for managing workflow editor state and execution.
 * All state updates are immutable; changes are persisted to localStorage via workflowService.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import type {
  NodeType,
  Workflow,
  WorkflowExecution,
  NodeStatus,
  NodeCatalogItem,
  WorkflowTemplate,
} from './workflowTypes'
import {
  getNodeCatalog,
  getWorkflowTemplates,
  getWorkflows as serviceGetWorkflows,
  getWorkflow as serviceGetWorkflow,
  createWorkflow as serviceCreateWorkflow,
  createFromTemplate as serviceCreateFromTemplate,
  saveWorkflow as serviceSaveWorkflow,
  deleteWorkflow as serviceDeleteWorkflow,
  addNode as serviceAddNode,
  removeNode as serviceRemoveNode,
  updateNodePosition as serviceUpdatePosition,
  updateNodeConfig as serviceUpdateConfig,
  addEdge as serviceAddEdge,
  removeEdge as serviceRemoveEdge,
  executeWorkflow as serviceExecuteWorkflow,
} from './workflowService'

/**
 * Hook for managing workflow editor state and all CRUD operations.
 *
 * Provides the active workflow, node/edge lists, catalog, templates,
 * and all mutation operations with localStorage persistence.
 */
export function useWorkflowEditor(workflowId?: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(() =>
    workflowId ? serviceGetWorkflow(workflowId) : null,
  )
  const [workflows, setWorkflows] = useState<Workflow[]>(() => serviceGetWorkflows())
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const catalog = useMemo<readonly NodeCatalogItem[]>(() => getNodeCatalog(), [])
  const templates = useMemo<readonly WorkflowTemplate[]>(() => getWorkflowTemplates(), [])

  const refreshWorkflow = useCallback((id: string) => {
    setWorkflow(serviceGetWorkflow(id))
  }, [])

  const refreshWorkflows = useCallback(() => {
    setWorkflows(serviceGetWorkflows())
  }, [])

  const loadWorkflow = useCallback(
    (id: string) => {
      refreshWorkflow(id)
      refreshWorkflows()
    },
    [refreshWorkflow, refreshWorkflows],
  )

  const createNew = useCallback(
    (name: string, description: string): Workflow => {
      const created = serviceCreateWorkflow(name, description)
      setWorkflow(created)
      refreshWorkflows()
      return created
    },
    [refreshWorkflows],
  )

  const createFromTemplate = useCallback(
    (templateId: string): Workflow => {
      const created = serviceCreateFromTemplate(templateId)
      setWorkflow(created)
      refreshWorkflows()
      return created
    },
    [refreshWorkflows],
  )

  const save = useCallback(() => {
    if (!workflow) return
    serviceSaveWorkflow(workflow)
    refreshWorkflows()
  }, [workflow, refreshWorkflows])

  const deleteWorkflow = useCallback(
    (id: string) => {
      serviceDeleteWorkflow(id)
      if (workflow?.id === id) {
        setWorkflow(null)
      }
      refreshWorkflows()
    },
    [workflow, refreshWorkflows],
  )

  const addNode = useCallback(
    (nodeType: NodeType, position: { x: number; y: number }) => {
      if (!workflow) return
      serviceAddNode(workflow.id, nodeType, position)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      if (!workflow) return
      serviceRemoveNode(workflow.id, nodeId)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const moveNode = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      if (!workflow) return
      serviceUpdatePosition(workflow.id, nodeId, position)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const updateConfig = useCallback(
    (nodeId: string, config: Record<string, string | number | boolean>) => {
      if (!workflow) return
      serviceUpdateConfig(workflow.id, nodeId, config)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const addEdge = useCallback(
    (sourceId: string, targetId: string) => {
      if (!workflow) return
      serviceAddEdge(workflow.id, sourceId, targetId)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const removeEdge = useCallback(
    (edgeId: string) => {
      if (!workflow) return
      serviceRemoveEdge(workflow.id, edgeId)
      refreshWorkflow(workflow.id)
    },
    [workflow, refreshWorkflow],
  )

  const execute = useCallback(() => {
    if (!workflow) return
    const exec = serviceExecuteWorkflow(workflow.id)
    setExecution(exec)
  }, [workflow])

  const nodes = workflow?.nodes ?? []
  const edges = workflow?.edges ?? []

  return {
    workflow,
    nodes,
    edges,
    catalog,
    templates,
    addNode,
    removeNode,
    moveNode,
    updateConfig,
    addEdge,
    removeEdge,
    save,
    execute,
    execution,
    createNew,
    createFromTemplate,
    workflows,
    deleteWorkflow,
    loadWorkflow,
  }
}

/**
 * Hook for managing workflow execution simulation.
 *
 * Simulates sequential node execution with setInterval.
 * Each node transitions: idle -> running -> success/error with 200-500ms delay.
 */
export function useWorkflowExecution(workflowId: string) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const nodeStatuses = useMemo<Record<string, NodeStatus>>(() => {
    if (!execution) return {}
    const statuses: Record<string, NodeStatus> = {}
    for (const [nodeId, result] of Object.entries(execution.nodeResults)) {
      statuses[nodeId] = result.status
    }
    return statuses
  }, [execution])

  const execute = useCallback(() => {
    const workflow = serviceGetWorkflow(workflowId)
    if (!workflow || workflow.nodes.length === 0) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const exec = serviceExecuteWorkflow(workflowId)
    const runningExec: WorkflowExecution = { ...exec, status: 'running' }
    setExecution(runningExec)
    setIsRunning(true)

    const nodeIds = workflow.nodes.map((n) => n.id)
    let currentIndex = 0

    intervalRef.current = setInterval(() => {
      if (currentIndex >= nodeIds.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setExecution((prev) => {
          if (!prev) return prev
          return { ...prev, status: 'completed' as const, completedAt: Date.now() }
        })
        setIsRunning(false)
        return
      }

      const nodeId = nodeIds[currentIndex]
      const durationMs = 200 + Math.floor(Math.random() * 300)
      const isError = Math.random() < 0.05

      setExecution((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          nodeResults: {
            ...prev.nodeResults,
            [nodeId]: {
              status: isError ? ('error' as const) : ('success' as const),
              output: isError ? 'Mock error occurred' : `Node ${nodeId} completed`,
              durationMs,
            },
          },
          ...(isError ? { status: 'failed' as const, completedAt: Date.now() } : {}),
        }
      })

      if (isError) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsRunning(false)
        return
      }

      currentIndex += 1
    }, 300)
  }, [workflowId])

  return { execution, isRunning, execute, nodeStatuses }
}
