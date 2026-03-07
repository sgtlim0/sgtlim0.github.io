'use client'

import { useState } from 'react'
import { useWorkflowEditor, useWorkflowExecution } from './services/workflowHooks'
import WorkflowCanvas from './WorkflowCanvas'
import WorkflowNodeCatalog from './WorkflowNodeCatalog'
import WorkflowTemplateGallery from './WorkflowTemplateGallery'

type ViewMode = 'editor' | 'templates'

export default function WorkflowBuilder() {
  const {
    workflowName,
    setWorkflowName,
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    selectedNodeSchema,
    catalog,
    templates,
    addNode,
    deleteNode,
    updateNodeConfig,
    updateNodeStatus,
    selectNode,
    loadTemplate,
    newWorkflow,
    resetStatuses,
  } = useWorkflowEditor()

  const { executing, results, execute, clearResults } = useWorkflowExecution()

  const [showCatalog, setShowCatalog] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('editor')

  const handleExecute = async () => {
    resetStatuses()
    clearResults()
    await execute()
  }

  const handleNewWorkflow = () => {
    newWorkflow()
    clearResults()
    setViewMode('editor')
  }

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId)
    clearResults()
    setViewMode('editor')
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-xl font-bold text-text-primary bg-transparent border-b border-transparent hover:border-admin-border focus:border-primary outline-none transition-colors px-1 py-0.5"
          />
          <span className="text-xs text-text-secondary">노드 {nodes.length}개</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleNewWorkflow}
            className="rounded-lg border border-admin-border px-3 py-2 text-sm text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            새로 만들기
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'templates' ? 'editor' : 'templates')}
            className="rounded-lg border border-admin-border px-3 py-2 text-sm text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            {viewMode === 'templates' ? '에디터로' : '템플릿에서'}
          </button>
          <button
            type="button"
            onClick={() => setShowCatalog((prev) => !prev)}
            className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {showCatalog ? '카탈로그 닫기' : '노드 추가'}
          </button>
          <button
            type="button"
            disabled={nodes.length === 0 || executing}
            onClick={handleExecute}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executing ? '실행 중...' : '실행'}
          </button>
          <button
            type="button"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            저장
          </button>
        </div>
      </div>

      {/* Template Gallery View */}
      {viewMode === 'templates' && (
        <WorkflowTemplateGallery templates={[...templates]} onSelect={handleLoadTemplate} />
      )}

      {/* Editor View */}
      {viewMode === 'editor' && (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Catalog sidebar */}
          {showCatalog && (
            <WorkflowNodeCatalog
              catalog={[...catalog]}
              onAddNode={(type) => addNode(type, { x: 200, y: 200 })}
            />
          )}

          {/* Center: Canvas */}
          <WorkflowCanvas
            nodes={[...nodes]}
            edges={[...edges]}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            onDeleteNode={deleteNode}
          />

          {/* Right: Config panel */}
          {selectedNode && (
            <aside className="w-72 shrink-0 flex flex-col gap-4 rounded-xl bg-admin-bg-card border border-admin-border p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">노드 설정</h2>
                <button
                  type="button"
                  onClick={() => selectNode(null)}
                  className="rounded p-1 text-xs text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary">노드</span>
                <span className="text-sm font-medium text-text-primary">{selectedNode.label}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary">타입</span>
                <span className="text-sm text-text-primary">{selectedNode.type}</span>
              </div>

              {/* Dynamic config fields */}
              {selectedNodeSchema && selectedNodeSchema.configSchema.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-admin-border pt-3">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    설정 값
                  </h3>
                  {selectedNodeSchema.configSchema.map((field) => {
                    const currentValue = selectedNode.config[field.key] ?? ''
                    return (
                      <div key={field.key} className="flex flex-col gap-1">
                        <label
                          htmlFor={`cfg-${field.key}`}
                          className="text-xs font-medium text-text-secondary"
                        >
                          {field.label}
                        </label>
                        {field.type === 'select' && field.options ? (
                          <select
                            id={`cfg-${field.key}`}
                            value={String(currentValue)}
                            onChange={(e) =>
                              updateNodeConfig(selectedNode.id, { [field.key]: e.target.value })
                            }
                            className="rounded-lg border border-admin-border bg-admin-bg-section px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                          >
                            {field.options.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`cfg-${field.key}`}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={String(currentValue)}
                            onChange={(e) =>
                              updateNodeConfig(selectedNode.id, {
                                [field.key]:
                                  field.type === 'number' ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className="rounded-lg border border-admin-border bg-admin-bg-section px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </aside>
          )}
        </div>
      )}

      {/* Execution Results Panel */}
      {Object.keys(results).length > 0 && (
        <div className="rounded-xl border border-admin-border bg-admin-bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-primary">실행 결과</h2>
            <button
              type="button"
              onClick={clearResults}
              className="text-xs text-text-secondary hover:text-primary transition-colors"
            >
              닫기
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(results).map(([nodeId, status]) => {
              const node = nodes.find((n) => n.id === nodeId)
              return (
                <div
                  key={nodeId}
                  className="flex items-center gap-3 rounded-lg border border-admin-border p-2.5 text-sm"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="font-medium text-text-primary min-w-[100px]">
                    {node?.label ?? nodeId}
                  </span>
                  <span className="text-text-secondary text-xs">{status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
