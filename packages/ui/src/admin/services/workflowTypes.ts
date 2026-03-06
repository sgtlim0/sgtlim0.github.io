/**
 * AI Workflow Builder Type Definitions
 *
 * Types for the visual node-based workflow pipeline editor.
 * Supports 8 node types across 3 categories with configurable parameters.
 * All interfaces use readonly properties for immutability.
 */

export type NodeType =
  | 'input'
  | 'llm'
  | 'transform'
  | 'condition'
  | 'output'
  | 'api'
  | 'template'
  | 'merge'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export interface WorkflowNode {
  readonly id: string
  readonly type: NodeType
  readonly label: string
  readonly description: string
  readonly position: { readonly x: number; readonly y: number }
  readonly config: Record<string, string | number | boolean>
  readonly status: NodeStatus
}

export interface WorkflowEdge {
  readonly id: string
  readonly sourceId: string
  readonly targetId: string
  readonly label?: string
}

export interface Workflow {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
  readonly createdAt: number
  readonly updatedAt: number
  readonly isActive: boolean
}

export interface WorkflowTemplate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: 'rag' | 'agent' | 'pipeline' | 'automation'
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
  readonly icon: string
}

export interface WorkflowExecution {
  readonly id: string
  readonly workflowId: string
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly startedAt: number
  readonly completedAt?: number
  readonly nodeResults: Record<string, { status: NodeStatus; output?: string; durationMs: number }>
}

export interface NodeCatalogItem {
  readonly type: NodeType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly category: 'input-output' | 'processing' | 'control'
  readonly configSchema: readonly {
    key: string
    label: string
    type: 'text' | 'number' | 'select'
    options?: readonly string[]
  }[]
}

export interface NodeConfigField {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'number' | 'select'
  readonly options?: readonly string[]
}

export interface WorkflowExecutionResult {
  readonly nodeId: string
  readonly status: NodeStatus
  readonly durationMs: number
  readonly output?: string
}

/** Node type color mapping for border accents */
export const NODE_TYPE_COLORS: Readonly<Record<NodeType, string>> = {
  input: 'border-green-500',
  llm: 'border-blue-500',
  transform: 'border-purple-500',
  condition: 'border-amber-500',
  output: 'border-red-500',
  api: 'border-cyan-500',
  template: 'border-pink-500',
  merge: 'border-gray-500',
}

/** Node type background color mapping for catalog items */
export const NODE_TYPE_BG_COLORS: Readonly<Record<NodeType, string>> = {
  input: 'bg-green-500/10 text-green-600',
  llm: 'bg-blue-500/10 text-blue-600',
  transform: 'bg-purple-500/10 text-purple-600',
  condition: 'bg-amber-500/10 text-amber-600',
  output: 'bg-red-500/10 text-red-600',
  api: 'bg-cyan-500/10 text-cyan-600',
  template: 'bg-pink-500/10 text-pink-600',
  merge: 'bg-gray-500/10 text-gray-600',
}

/** Status color mapping */
export const NODE_STATUS_COLORS: Readonly<Record<NodeStatus, string>> = {
  idle: 'bg-gray-400',
  running: 'bg-yellow-400',
  success: 'bg-green-500',
  error: 'bg-red-500',
}

/** Node dimensions for edge path calculation */
export const NODE_WIDTH = 220
export const NODE_HEIGHT = 100
