'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import type { LLMModel } from './types'
import ProviderBadge from './ProviderBadge'

export interface ModelComparisonProps {
  models: LLMModel[]
}

const PROVIDER_HEADER_COLORS: Record<string, string> = {
  OpenAI: '#10A37F',
  Anthropic: '#D97757',
  'Anthropic (Bedrock)': '#D97757',
  Google: '#4285F4',
  Meta: '#0668E1',
  Mistral: '#FF7000',
  Cohere: '#39594D',
  DeepSeek: '#4D6BFE',
}

function formatPrice(price: number): string {
  return `\u20A9${price.toLocaleString()}`
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`
  return tokens.toLocaleString()
}

function ContextBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full h-2 rounded-full bg-lr-bg mt-1">
      <div
        className="h-2 rounded-full transition-all"
        style={{
          width: `${percentage}%`,
          backgroundColor: 'var(--lr-primary)',
        }}
      />
    </div>
  )
}

function PriceLabel({
  price,
  isCheapest,
  isMostExpensive,
}: {
  price: number
  isCheapest: boolean
  isMostExpensive: boolean
}) {
  const colorClass = isCheapest
    ? 'text-green-600 dark:text-green-400 font-semibold'
    : isMostExpensive
      ? 'text-red-600 dark:text-red-400 font-semibold'
      : 'text-lr-text-primary'
  return <span className={colorClass}>{formatPrice(price)}</span>
}

export default function ModelComparison({ models }: ModelComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<(string | null)[]>([null, null])

  const selectedModels = useMemo(
    () => selectedIds.map((id) => (id ? (models.find((m) => m.id === id) ?? null) : null)),
    [selectedIds, models],
  )

  const activeModels = useMemo(
    () => selectedModels.filter((m): m is LLMModel => m !== null),
    [selectedModels],
  )

  const maxContext = useMemo(
    () => Math.max(...activeModels.map((m) => m.contextWindow), 1),
    [activeModels],
  )

  const priceStats = useMemo(() => {
    if (activeModels.length < 2) return { minInput: 0, maxInput: 0, minOutput: 0, maxOutput: 0 }
    const inputs = activeModels.map((m) => m.inputPrice)
    const outputs = activeModels.map((m) => m.outputPrice)
    return {
      minInput: Math.min(...inputs),
      maxInput: Math.max(...inputs),
      minOutput: Math.min(...outputs),
      maxOutput: Math.max(...outputs),
    }
  }, [activeModels])

  const handleSelect = useCallback((index: number, modelId: string) => {
    setSelectedIds((prev) => prev.map((id, i) => (i === index ? modelId || null : id)))
  }, [])

  const handleAdd = useCallback(() => {
    setSelectedIds((prev) => (prev.length < 3 ? [...prev, null] : prev))
  }, [])

  const handleRemove = useCallback((index: number) => {
    setSelectedIds((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }, [])

  const groupedOptions = useMemo(() => {
    const groups: Record<string, LLMModel[]> = {}
    for (const model of models) {
      const group = groups[model.provider] ?? []
      groups[model.provider] = [...group, model]
    }
    return groups
  }, [models])

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-4 grid-cols-1 ${
          selectedIds.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}
      >
        {selectedIds.map((selectedId, index) => {
          const model = selectedModels[index]
          const headerColor = model
            ? (PROVIDER_HEADER_COLORS[model.provider] ?? '#6B7280')
            : 'var(--lr-border)'

          return (
            <div
              key={index}
              className="rounded-lg border border-lr-border overflow-hidden"
              style={{ backgroundColor: 'var(--lr-bg-section)' }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: `3px solid ${headerColor}` }}
              >
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => handleSelect(index, e.target.value)}
                  className="flex-1 bg-transparent text-lr-text-primary text-sm font-medium focus:outline-none cursor-pointer"
                  aria-label={`모델 ${index + 1} 선택`}
                >
                  <option value="">모델을 선택하세요</option>
                  {Object.entries(groupedOptions).map(([provider, group]) => (
                    <optgroup key={provider} label={provider}>
                      {group.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedIds.length > 1 && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="ml-2 p-1 rounded hover:bg-lr-bg transition-colors text-lr-text-secondary"
                    aria-label="모델 제거"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Body */}
              {model ? (
                <div className="p-4 space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ProviderBadge provider={model.provider} size="sm" />
                    <span className="text-xs text-lr-text-secondary">{model.category}</span>
                  </div>

                  <Row label="입력 가격">
                    <PriceLabel
                      price={model.inputPrice}
                      isCheapest={
                        activeModels.length >= 2 && model.inputPrice === priceStats.minInput
                      }
                      isMostExpensive={
                        activeModels.length >= 2 && model.inputPrice === priceStats.maxInput
                      }
                    />
                    <span className="text-xs text-lr-text-muted ml-1">/ 1M 토큰</span>
                  </Row>

                  <Row label="출력 가격">
                    <PriceLabel
                      price={model.outputPrice}
                      isCheapest={
                        activeModels.length >= 2 && model.outputPrice === priceStats.minOutput
                      }
                      isMostExpensive={
                        activeModels.length >= 2 && model.outputPrice === priceStats.maxOutput
                      }
                    />
                    <span className="text-xs text-lr-text-muted ml-1">/ 1M 토큰</span>
                  </Row>

                  <Row label="컨텍스트 윈도우">
                    <div className="w-full">
                      <span className="text-lr-text-primary font-medium">
                        {formatTokens(model.contextWindow)}
                      </span>
                      <ContextBar value={model.contextWindow} max={maxContext} />
                    </div>
                  </Row>

                  <Row label="최대 출력">
                    <span className="text-lr-text-primary font-medium">
                      {formatTokens(model.maxOutput)}
                    </span>
                  </Row>

                  <Row label="레이턴시">
                    <span className="text-lr-text-primary font-medium">{model.latency}</span>
                  </Row>
                </div>
              ) : (
                <div className="p-8 text-center text-lr-text-muted text-sm">
                  드롭다운에서 비교할 모델을 선택하세요
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedIds.length < 3 && (
        <div className="flex justify-center">
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-lr-border text-lr-text-secondary text-sm hover:border-lr-primary hover:text-lr-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            모델 추가
          </button>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-lr-text-muted">{label}</span>
      <div className="flex items-center flex-wrap">{children}</div>
    </div>
  )
}
