import React, { useCallback, useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExtensionContext {
  text: string
  url: string
  title: string
  mode: 'summarize' | 'explain' | 'research' | 'translate'
}

export interface AnalyzeRequest {
  text: string
  mode: ExtensionContext['mode']
  url?: string
  title?: string
}

export interface AnalyzeResponse {
  result: string
  mode: ExtensionContext['mode']
}

type AnalysisMode = ExtensionContext['mode']

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const API_BASE = 'http://localhost:3003'

interface ModeOption {
  mode: AnalysisMode
  icon: string
  label: string
}

const MODE_OPTIONS: readonly ModeOption[] = [
  { mode: 'summarize', icon: '\uD83D\uDCC4', label: '\uC694\uC57D' },
  { mode: 'explain', icon: '\u2753', label: '\uC124\uBA85' },
  { mode: 'research', icon: '\uD83D\uDD0D', label: '\uB9AC\uC11C\uCE58' },
  { mode: 'translate', icon: '\uD83C\uDF10', label: '\uBC88\uC5ED' },
] as const

const MOCK_CONTEXT: Omit<ExtensionContext, 'mode'> = {
  text: 'H Chat\uC740 \uD604\uB300\uCC28\uADF8\uB8F9 \uC784\uC9C1\uC6D0\uC744 \uC704\uD55C \uC0DD\uC131\uD615 AI \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4. \uB2E4\uC591\uD55C LLM \uBAA8\uB378\uC744 \uD65C\uC6A9\uD558\uC5EC \uC5C5\uBB34 \uD6A8\uC728\uC744 \uADF9\uB300\uD654\uD569\uB2C8\uB2E4.',
  url: 'https://hchat.hmg.com/docs/overview',
  title: 'H Chat \uC11C\uBE44\uC2A4 \uAC1C\uC694',
}

const MOCK_RESPONSES: Record<AnalysisMode, string> = {
  summarize:
    'H Chat\uC740 \uD604\uB300\uCC28\uADF8\uB8F9 \uC784\uC9C1\uC6D0\uC6A9 \uC0DD\uC131\uD615 AI \uC11C\uBE44\uC2A4\uB85C, \uB2E4\uC218\uC758 LLM \uBAA8\uB378\uC744 \uD1B5\uD569\uD558\uC5EC \uC5C5\uBB34 \uD6A8\uC728\uC131\uC744 \uD5A5\uC0C1\uC2DC\uD0A4\uB294 \uAE30\uC5C5\uC6A9 AI \uD50C\uB7AB\uD3FC\uC785\uB2C8\uB2E4.',
  explain:
    'H Chat\uC740 \uAE30\uC5C5 \uB0B4\uBD80\uC5D0\uC11C \uC548\uC804\uD558\uAC8C \uC0AC\uC6A9\uD560 \uC218 \uC788\uB294 AI \uCC57\uBD07 \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4. OpenAI, Anthropic \uB4F1 \uB2E4\uC591\uD55C \uC81C\uACF5\uC790\uC758 \uBAA8\uB378\uC744 LLM \uB77C\uC6B0\uD130\uB97C \uD1B5\uD574 \uC801\uC808\uD788 \uBD84\uBC30\uD558\uBA70, \uBB38\uC11C \uC694\uC57D, \uCF54\uB4DC \uC0DD\uC131, \uBC88\uC5ED \uB4F1 \uB2E4\uC591\uD55C \uC5C5\uBB34\uC5D0 \uD65C\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
  research:
    '\uAD00\uB828 \uBD84\uC11D: H Chat\uC740 2024\uB144 \uCD9C\uC2DC\uB41C \uAE30\uC5C5\uC6A9 AI \uC11C\uBE44\uC2A4\uB85C, \uAE00\uB85C\uBC8C \uC790\uB3D9\uCC28 \uADF8\uB8F9 \uC911 \uCD5C\uCD08\uB85C \uBA40\uD2F0 LLM \uB77C\uC6B0\uD305 \uAE30\uC220\uC744 \uB3C4\uC785\uD588\uC2B5\uB2C8\uB2E4. \uC8FC\uC694 \uACBD\uC7C1 \uC11C\uBE44\uC2A4\uB85C\uB294 Samsung Gauss, LG Exaone \uB4F1\uC774 \uC788\uC2B5\uB2C8\uB2E4.',
  translate:
    'H Chat is a generative AI service for Hyundai Motor Group employees. It maximizes work efficiency by utilizing various LLM models.',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url
  return `${url.slice(0, maxLen)}\u2026`
}

function truncateText(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen)}\u2026`
}

function isChromeExtension(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.storage !== 'undefined' &&
    typeof chrome.storage.local !== 'undefined'
  )
}

function getModeBadgeLabel(mode: AnalysisMode): string {
  const map: Record<AnalysisMode, string> = {
    summarize: '\uC694\uC57D',
    explain: '\uC124\uBA85',
    research: '\uB9AC\uC11C\uCE58',
    translate: '\uBC88\uC5ED',
  }
  return map[mode]
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

async function analyzeText(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: request.text,
      mode: request.mode,
      url: request.url,
      title: request.title,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(
      errorBody || `\uBD84\uC11D \uC694\uCCAD \uC2E4\uD328 (${response.status})`
    )
  }

  const data: AnalyzeResponse = await response.json()
  return data
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Popup(): React.JSX.Element {
  const [context, setContext] = useState<Omit<
    ExtensionContext,
    'mode'
  > | null>(null)
  const [activeMode, setActiveMode] = useState<AnalysisMode | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Load extracted context on mount */
  useEffect(() => {
    if (isChromeExtension()) {
      chrome.storage.local.get('extractedContext', (data) => {
        if (data.extractedContext) {
          setContext(data.extractedContext as Omit<ExtensionContext, 'mode'>)
        }
      })
    } else {
      /* Development fallback: use mock data */
      setContext(MOCK_CONTEXT)
    }
  }, [])

  /* Handle mode button click */
  const handleModeClick = useCallback(
    async (mode: AnalysisMode) => {
      if (!context) return

      setActiveMode(mode)
      setResult(null)
      setError(null)
      setLoading(true)

      try {
        const response = await analyzeText({
          text: context.text,
          mode,
          url: context.url,
          title: context.title,
        })
        setResult(response.result)
      } catch (err) {
        if (!isChromeExtension()) {
          /* Fallback to mock response in dev mode */
          await new Promise((resolve) => setTimeout(resolve, 800))
          setResult(MOCK_RESPONSES[mode])
        } else {
          const message =
            err instanceof Error ? err.message : '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.'
          setError(message)
        }
      } finally {
        setLoading(false)
      }
    },
    [context]
  )

  return (
    <div>
      {/* Header */}
      <header className="popup-header">
        <div className="popup-header-icon">H</div>
        <h1 className="popup-header-title">H Chat</h1>
      </header>

      {/* Context or Empty State */}
      {context ? (
        <section className="popup-context">
          <div className="popup-context-title">{context.title}</div>
          <div className="popup-context-url">
            {truncateUrl(context.url)}
          </div>
          <div className="popup-context-preview">
            {truncateText(context.text)}
          </div>
        </section>
      ) : (
        <section className="popup-no-context">
          <div className="popup-no-context-icon">{'\uD83D\uDCC3'}</div>
          <p className="popup-no-context-text">
            {'\uD14D\uC2A4\uD2B8\uB97C \uC120\uD0DD\uD55C \uD6C4 \uC6B0\uD074\uB9AD\uD558\uC138\uC694'}
          </p>
        </section>
      )}

      {/* Mode Selection */}
      <section className="popup-modes">
        <div className="popup-modes-label">{'\uBD84\uC11D \uBAA8\uB4DC'}</div>
        <div className="popup-mode-grid">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              className={`popup-mode-btn${activeMode === option.mode ? ' active' : ''}`}
              disabled={!context || loading}
              onClick={() => handleModeClick(option.mode)}
            >
              <span className="popup-mode-icon">{option.icon}</span>
              <span className="popup-mode-label">{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Error Banner */}
      {error && <div className="popup-error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="popup-loading">
          <div className="popup-spinner" />
          <span className="popup-loading-text">{'\uBD84\uC11D \uC911...'}</span>
        </div>
      )}

      {/* Result Area */}
      {result && !loading && activeMode && (
        <section className="popup-result">
          <div className="popup-result-header">
            <span className="popup-result-badge">
              {getModeBadgeLabel(activeMode)}
            </span>
          </div>
          <div className="popup-result-content">{result}</div>
        </section>
      )}
    </div>
  )
}
