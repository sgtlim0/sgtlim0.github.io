'use client'

import type { WorkflowNode, NodeStatus } from './services/workflowTypes'
import { NODE_TYPE_COLORS, NODE_TYPE_BG_COLORS, NODE_STATUS_COLORS } from './services/workflowTypes'
import { NODE_CATALOG } from './services/workflowService'

export interface WorkflowNodeCardProps {
  readonly node: WorkflowNode
  readonly selected?: boolean
  readonly status?: NodeStatus
  readonly onSelect?: (id: string) => void
  readonly onDelete?: (id: string) => void
}

const STATUS_LABELS: Record<NodeStatus, string> = {
  idle: '대기',
  running: '실행 중',
  success: '완료',
  error: '오류',
}

export default function WorkflowNodeCard({
  node,
  selected = false,
  status,
  onSelect,
  onDelete,
}: WorkflowNodeCardProps) {
  const nodeStatus = status ?? node.status
  const catalogItem = NODE_CATALOG.find((c) => c.type === node.type)
  const icon = catalogItem?.icon ?? node.type.slice(0, 2).toUpperCase()
  const borderColor = NODE_TYPE_COLORS[node.type]
  const bgColor = NODE_TYPE_BG_COLORS[node.type]
  const statusColor = NODE_STATUS_COLORS[nodeStatus]
  const isRunning = nodeStatus === 'running'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(node.id)
        }
      }}
      className={[
        'relative w-[220px] rounded-xl border-2 bg-admin-bg-card shadow-sm transition-all cursor-pointer select-none',
        borderColor,
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:shadow-md',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Input connection point (top) */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-800 z-10" />

      {/* Output connection point (bottom) */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-800 z-10" />

      {/* Card content */}
      <div className="flex flex-col p-3" style={{ minHeight: 80 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${bgColor}`}>
              {icon}
            </span>
            <span className="text-sm font-bold text-text-primary truncate">{node.label}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status indicator */}
            <span
              className={['w-2.5 h-2.5 rounded-full', statusColor, isRunning ? 'animate-pulse' : '']
                .filter(Boolean)
                .join(' ')}
              title={STATUS_LABELS[nodeStatus]}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 flex-1">{node.description}</p>

        {/* Status text for running/error */}
        {(nodeStatus === 'running' || nodeStatus === 'error') && (
          <span
            className={`text-[10px] font-medium mt-1 ${
              nodeStatus === 'running' ? 'text-yellow-600' : 'text-red-500'
            }`}
          >
            {STATUS_LABELS[nodeStatus]}
          </span>
        )}
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(node.id)
          }}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:opacity-80 transition-opacity z-10"
          title="삭제"
        >
          x
        </button>
      )}
    </div>
  )
}
