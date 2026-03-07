'use client'

import { useState, useEffect } from 'react'
import type { PromptWithVersions } from './services/promptVersionTypes'
import { getPromptVersions, diffVersions } from './services/promptVersionService'

export default function PromptVersionManager() {
  const [prompts, setPrompts] = useState<PromptWithVersions[]>([])
  const [selected, setSelected] = useState<PromptWithVersions | null>(null)
  const [compareA, setCompareA] = useState<number | null>(null)
  const [compareB, setCompareB] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPromptVersions().then((p) => {
      setPrompts(p)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-text-secondary">프롬프트 로딩 중...</div>

  const diffs =
    selected && compareA !== null && compareB !== null
      ? diffVersions(
          selected.versions.find((v) => v.version === compareA)?.content ?? '',
          selected.versions.find((v) => v.version === compareB)?.content ?? '',
        )
      : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">프롬프트 버전 관리</h2>
        <p className="text-sm text-text-secondary mt-1">{prompts.length}개 프롬프트</p>
      </div>

      {/* Prompt List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelected(p)
              setCompareA(null)
              setCompareB(null)
            }}
            className={`p-4 rounded-xl border text-left transition-all ${selected?.id === p.id ? 'border-admin-teal bg-admin-teal/5' : 'border-border bg-admin-bg-card hover:border-admin-teal/30'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{p.name}</span>
              <span className="text-xs text-text-tertiary">v{p.currentVersion}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">{p.description}</p>
            <div className="flex gap-1 mt-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-admin-bg-section text-text-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary mt-2">
              활성: v{p.activeVersion} | 공유: {p.sharedWith.join(', ')}
            </p>
          </button>
        ))}
      </div>

      {/* Version History */}
      {selected && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary">{selected.name} — 버전 히스토리</h3>
          <div className="space-y-2">
            {selected.versions.map((v) => (
              <div
                key={v.id}
                className={`p-3 rounded-lg border ${v.version === selected.activeVersion ? 'border-admin-teal bg-admin-teal/5' : 'border-border bg-admin-bg-card'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">v{v.version}</span>
                    {v.version === selected.activeVersion && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-admin-teal text-white">
                        활성
                      </span>
                    )}
                    <span className="text-xs text-text-tertiary">{v.model}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCompareA(v.version)}
                      className={`text-[10px] px-2 py-0.5 rounded ${compareA === v.version ? 'bg-blue-100 text-blue-700' : 'bg-admin-bg-section text-text-secondary'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setCompareB(v.version)}
                      className={`text-[10px] px-2 py-0.5 rounded ${compareB === v.version ? 'bg-green-100 text-green-700' : 'bg-admin-bg-section text-text-secondary'}`}
                    >
                      B
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-1">{v.content}</p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  {v.createdBy} | {v.changeNote} | {v.createdAt}
                </p>
              </div>
            ))}
          </div>

          {/* Diff View */}
          {diffs.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text-primary">
                v{compareA} → v{compareB} Diff
              </h4>
              <div className="rounded-lg border border-border bg-admin-bg-section p-3 font-mono text-xs">
                {diffs.map((d, i) => (
                  <div
                    key={i}
                    className={
                      d.type === 'added'
                        ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                        : d.type === 'removed'
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'text-text-secondary'
                    }
                  >
                    {d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}
                    {d.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
