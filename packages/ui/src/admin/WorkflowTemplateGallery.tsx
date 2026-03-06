'use client'

import type { WorkflowTemplate } from './services/workflowTypes'

interface WorkflowTemplateGalleryProps {
  readonly templates: readonly WorkflowTemplate[]
  readonly onSelect: (templateId: string) => void
}

export default function WorkflowTemplateGallery({
  templates,
  onSelect,
}: WorkflowTemplateGalleryProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">워크플로우 템플릿</h2>
        <span className="text-xs text-text-secondary">{templates.length}개 템플릿</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-primary">{template.name}</h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {template.category}
              </span>
              <span className="rounded bg-admin-bg-section px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                노드 {template.nodes.length}개
              </span>
              <span className="rounded bg-admin-bg-section px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                엣지 {template.edges.length}개
              </span>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className="w-full rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              이 템플릿으로 시작
            </button>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-12 text-text-secondary">
            <span className="text-3xl">&#128204;</span>
            <p className="text-sm">사용 가능한 템플릿이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
