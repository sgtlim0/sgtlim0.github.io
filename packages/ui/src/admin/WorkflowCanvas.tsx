'use client'

import type { WorkflowNode, WorkflowEdge, NodeStatus } from './services/workflowTypes'
import { NODE_WIDTH, NODE_HEIGHT } from './services/workflowTypes'
import WorkflowNodeCard from './WorkflowNodeCard'

export interface WorkflowCanvasProps {
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
  readonly selectedNodeId?: string | null
  readonly nodeStatuses?: Readonly<Record<string, NodeStatus>>
  readonly onSelectNode?: (id: string | null) => void
  readonly onDeleteNode?: (id: string) => void
}

/** Bezier curve path between source (bottom) and target (top) */
function getEdgePath(source: WorkflowNode, target: WorkflowNode): string {
  const sx = source.position.x + NODE_WIDTH / 2
  const sy = source.position.y + NODE_HEIGHT
  const tx = target.position.x + NODE_WIDTH / 2
  const ty = target.position.y
  const midY = (sy + ty) / 2
  return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
}

/** Edge stroke color based on source node status */
function getEdgeStroke(status: NodeStatus): string {
  switch (status) {
    case 'running':
      return '#3b82f6'
    case 'success':
      return '#22c55e'
    case 'error':
      return '#ef4444'
    default:
      return '#9ca3af'
  }
}

/** Arrow marker ID suffix by status */
function getMarkerSuffix(status: NodeStatus): string {
  switch (status) {
    case 'running':
      return '-blue'
    case 'success':
      return '-green'
    case 'error':
      return '-red'
    default:
      return ''
  }
}

export default function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  nodeStatuses = {},
  onSelectNode,
  onDeleteNode,
}: WorkflowCanvasProps) {
  const canvasWidth = Math.max(800, ...nodes.map((n) => n.position.x + NODE_WIDTH + 80))
  const canvasHeight = Math.max(600, ...nodes.map((n) => n.position.y + NODE_HEIGHT + 80))

  const handleCanvasClick = () => {
    onSelectNode?.(null)
  }

  return (
    <div
      className="relative flex-1 overflow-auto rounded-xl border border-admin-border bg-admin-bg-section"
      style={{ minHeight: 400 }}
    >
      <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
        {/* SVG Layer: grid + edges */}
        <svg
          className="absolute inset-0 w-full h-full"
          onClick={handleCanvasClick}
          role="presentation"
        >
          {/* Definitions */}
          <defs>
            {/* Dot grid pattern */}
            <pattern id="wf-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle
                cx="10"
                cy="10"
                r="0.8"
                fill="currentColor"
                className="text-gray-300 dark:text-gray-600"
              />
            </pattern>

            {/* Arrow markers per status */}
            <marker id="wf-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
            </marker>
            <marker
              id="wf-arrow-blue"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker
              id="wf-arrow-green"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
            </marker>
            <marker
              id="wf-arrow-red"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#wf-dot-grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.sourceId)
            const target = nodes.find((n) => n.id === edge.targetId)
            if (!source || !target) return null

            const sourceStatus = nodeStatuses[edge.sourceId] ?? source.status
            const stroke = getEdgeStroke(sourceStatus)
            const markerSuffix = getMarkerSuffix(sourceStatus)

            return (
              <g key={edge.id}>
                <path
                  d={getEdgePath(source, target)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={2}
                  markerEnd={`url(#wf-arrow${markerSuffix})`}
                  className="transition-colors duration-300"
                />
                {edge.label && (
                  <text
                    x={(source.position.x + target.position.x + NODE_WIDTH) / 2}
                    y={(source.position.y + NODE_HEIGHT + target.position.y) / 2}
                    textAnchor="middle"
                    dy={-4}
                    className="fill-text-secondary text-[10px]"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* HTML Layer: node cards */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{ left: node.position.x, top: node.position.y }}
          >
            <WorkflowNodeCard
              node={node}
              selected={node.id === selectedNodeId}
              status={nodeStatuses[node.id]}
              onSelect={(id) => onSelectNode?.(id)}
              onDelete={onDeleteNode}
            />
          </div>
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <span className="text-4xl">&#9881;</span>
            <p className="text-sm">노드를 추가하여 워크플로우를 구성하세요.</p>
            <p className="text-xs">좌측 카탈로그에서 노드를 선택하거나 템플릿을 사용하세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
