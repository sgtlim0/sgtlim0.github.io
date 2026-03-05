'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useStreamingChat } from './services/streamingHooks'
import { models } from './mockData'
import type { ChatMessage } from './services/streamingTypes'
import type { LLMModel } from './types'

interface ModelGroup {
  provider: string
  models: LLMModel[]
}

function groupModelsByProvider(modelList: LLMModel[]): ModelGroup[] {
  const groups = new Map<string, LLMModel[]>()
  for (const model of modelList) {
    const existing = groups.get(model.provider) ?? []
    groups.set(model.provider, [...existing, model])
  }
  return Array.from(groups.entries()).map(([provider, items]) => ({
    provider,
    models: items,
  }))
}

function formatCost(krw: number): string {
  return krw >= 1000 ? `${(krw / 1000).toFixed(1)}K KRW` : `${krw.toFixed(1)} KRW`
}

function RoleBadge({ role }: { role: ChatMessage['role'] }) {
  const styles: Record<string, string> = {
    user: 'bg-blue-500/20 text-blue-400',
    assistant: 'bg-green-500/20 text-green-400',
    system: 'bg-yellow-500/20 text-yellow-400',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[role]}`}>{role}</span>
}

function FinishBadge({ reason }: { reason: string }) {
  const styles: Record<string, string> = {
    stop: 'bg-green-500/20 text-green-400',
    length: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[reason] ?? ''}`}>
      {reason}
    </span>
  )
}

export default function StreamingPlayground() {
  const chatModels = useMemo(
    () => models.filter((m) => m.category === 'chat' || m.category === 'completion'),
    [],
  )
  const groupedModels = useMemo(() => groupModelsByProvider(chatModels), [chatModels])

  const [selectedModelId, setSelectedModelId] = useState(chatModels[0]?.id ?? '')
  const [configOpen, setConfigOpen] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [topP, setTopP] = useState(1.0)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userInput, setUserInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const chatAreaRef = useRef<HTMLDivElement>(null)
  const handleStreamComplete = useCallback((streamResult: { content: string }) => {
    setMessages((prev) => [...prev, { role: 'assistant', content: streamResult.content }])
  }, [])

  const { isStreaming, streamingContent, result, error, startStream, stopStream, reset } =
    useStreamingChat({ onComplete: handleStreamComplete })

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  const handleSend = useCallback(() => {
    const trimmed = userInput.trim()
    if (!trimmed || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setUserInput('')

    const apiMessages: ChatMessage[] = systemPrompt.trim()
      ? [{ role: 'system', content: systemPrompt.trim() }, ...nextMessages]
      : nextMessages

    startStream({
      model: selectedModelId,
      messages: apiMessages,
      temperature,
      maxTokens,
      topP,
    })
  }, [
    userInput,
    isStreaming,
    messages,
    systemPrompt,
    selectedModelId,
    temperature,
    maxTokens,
    topP,
    startStream,
  ])

  const handleClear = useCallback(() => {
    setMessages([])
    reset()
  }, [reset])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const selectedModel = chatModels.find((m) => m.id === selectedModelId)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--lr-text-primary)' }}>
          Playground
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--lr-bg-section)',
              color: 'var(--lr-text-primary)',
              borderColor: 'var(--lr-border)',
            }}
          >
            {groupedModels.map((group) => (
              <optgroup key={group.provider} label={group.provider}>
                {group.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.provider} / {m.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--lr-border)',
              color: 'var(--lr-text-secondary)',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Config Panel */}
      <div
        className="rounded-lg border"
        style={{ backgroundColor: 'var(--lr-bg-section)', borderColor: 'var(--lr-border)' }}
      >
        <button
          onClick={() => setConfigOpen(!configOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
          style={{ color: 'var(--lr-text-primary)' }}
        >
          <span>Parameters</span>
          <span className="text-xs" style={{ color: 'var(--lr-text-secondary)' }}>
            {configOpen ? '[-]' : '[+]'}
          </span>
        </button>
        {configOpen && (
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-xs" style={{ color: 'var(--lr-text-secondary)' }}>
                Temperature: {temperature.toFixed(2)}
              </span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[var(--lr-primary)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs" style={{ color: 'var(--lr-text-secondary)' }}>
                Max Tokens: {maxTokens}
              </span>
              <input
                type="range"
                min="1"
                max={selectedModel?.maxOutput ?? 4096}
                step="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--lr-primary)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs" style={{ color: 'var(--lr-text-secondary)' }}>
                Top P: {topP.toFixed(2)}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-[var(--lr-primary)]"
              />
            </label>
          </div>
        )}
      </div>

      {/* System Prompt */}
      <div
        className="rounded-lg border"
        style={{ backgroundColor: 'var(--lr-bg-section)', borderColor: 'var(--lr-border)' }}
      >
        <textarea
          placeholder="System prompt (optional)"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none"
          style={{ color: 'var(--lr-text-primary)' }}
        />
      </div>

      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className="rounded-lg border overflow-y-auto space-y-3 p-4"
        style={{
          backgroundColor: 'var(--lr-bg)',
          borderColor: 'var(--lr-border)',
          minHeight: '300px',
          maxHeight: '480px',
        }}
      >
        {messages.length === 0 && !isStreaming && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--lr-text-secondary)' }}>
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
          >
            <RoleBadge role={msg.role} />
            <div
              className="rounded-lg px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap"
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--lr-bg-section)' : 'var(--lr-bg-code)',
                color: 'var(--lr-text-primary)',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && streamingContent && (
          <div className="flex flex-col gap-1 items-end">
            <RoleBadge role="assistant" />
            <div
              className="rounded-lg px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap"
              style={{ backgroundColor: 'var(--lr-bg-code)', color: 'var(--lr-text-primary)' }}
            >
              {streamingContent}
              <span className="streaming-cursor" />
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-400 px-4 py-2 rounded-lg bg-red-500/10">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className="rounded-lg border flex items-end gap-2 p-3"
        style={{ backgroundColor: 'var(--lr-bg-section)', borderColor: 'var(--lr-border)' }}
      >
        <textarea
          placeholder="Type a message... (Shift+Enter for new line)"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isStreaming}
          className="flex-1 text-sm bg-transparent resize-none focus:outline-none disabled:opacity-50"
          style={{ color: 'var(--lr-text-primary)' }}
        />
        {isStreaming ? (
          <button
            onClick={stopStream}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!userInput.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors shrink-0 disabled:opacity-40"
            style={{ backgroundColor: 'var(--lr-primary)' }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.backgroundColor = 'var(--lr-primary-hover)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.backgroundColor = 'var(--lr-primary)'
            }}
          >
            Send
          </button>
        )}
      </div>

      {/* Result Stats */}
      {result && !isStreaming && (
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: 'var(--lr-bg-section)', borderColor: 'var(--lr-border)' }}
        >
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--lr-text-primary)' }}>
            Response Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <StatItem label="Model" value={result.model} />
            <StatItem label="Input" value={`${result.inputTokens.toLocaleString()} tok`} />
            <StatItem label="Output" value={`${result.outputTokens.toLocaleString()} tok`} />
            <StatItem label="Total" value={`${result.totalTokens.toLocaleString()} tok`} />
            <StatItem label="Latency" value={`${result.responseTimeMs.toLocaleString()} ms`} />
            <StatItem label="Cost" value={formatCost(result.estimatedCostKRW)} />
          </div>
          <div className="mt-3 flex justify-end">
            <FinishBadge reason={result.finishReason} />
          </div>
        </div>
      )}

      {/* Blinking cursor CSS */}
      <style>{`
        .streaming-cursor::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1em;
          background: var(--lr-primary);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: 'var(--lr-text-secondary)' }}>
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: 'var(--lr-text-primary)' }}>
        {value}
      </div>
    </div>
  )
}
