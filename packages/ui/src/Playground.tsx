'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { usePlayground } from './hooks/usePlayground'
import type { PropDef } from './hooks/usePlayground'
import PropEditor from './PropEditor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaygroundProps {
  /** Prop definitions that drive the editor panel */
  readonly propDefs: readonly PropDef[]
  /** Component name used in generated JSX code */
  readonly componentName?: string
  /** Render prop — receives current values and renders the live preview */
  readonly children: (values: Record<string, unknown>) => ReactNode
  /** Additional CSS class for the root container */
  readonly className?: string
}

// ---------------------------------------------------------------------------
// CodePanel (internal)
// ---------------------------------------------------------------------------

function CodePanel({ code }: { readonly code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API may be unavailable in some environments
    }
  }, [code])

  return (
    <div className="relative">
      <pre className="p-3 text-xs font-mono rounded-md bg-[var(--bg-tertiary,#f3f4f6)] text-[var(--text-primary,#111)] overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-[var(--border-primary,#d1d5db)] bg-[var(--bg-primary,#fff)] text-[var(--text-secondary,#6b7280)] hover:bg-[var(--bg-hover,#e5e7eb)] transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

/**
 * Interactive component playground with a prop editor panel, live preview,
 * and generated JSX code output.
 *
 * Layout:
 * - Desktop: left = prop editor, right = live preview
 * - Mobile: vertical stack (editor, then preview)
 * - Bottom: generated JSX code with copy button
 *
 * @example
 * ```tsx
 * <Playground
 *   componentName="Badge"
 *   propDefs={[
 *     { name: 'label', type: 'string', defaultValue: 'Hello' },
 *     { name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
 *     { name: 'rounded', type: 'boolean', defaultValue: false },
 *   ]}
 * >
 *   {(values) => <Badge {...values} />}
 * </Playground>
 * ```
 */
export default function Playground({
  propDefs,
  componentName = 'Component',
  children,
  className,
}: PlaygroundProps) {
  const { values, setValue, reset, getCode } = usePlayground(propDefs)

  return (
    <div
      className={[
        'border rounded-lg overflow-hidden border-[var(--border-primary,#d1d5db)] bg-[var(--bg-primary,#fff)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Editor + Preview row */}
      <div className="flex flex-col md:flex-row">
        {/* Prop editor panel */}
        <div className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-primary,#d1d5db)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary,#111)]">Props</h3>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset props"
              className="px-2 py-0.5 text-xs rounded border border-[var(--border-primary,#d1d5db)] text-[var(--text-secondary,#6b7280)] hover:bg-[var(--bg-hover,#e5e7eb)] transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {propDefs.map((def) => (
              <PropEditor
                key={def.name}
                propDef={def}
                value={values[def.name]}
                onChange={setValue}
              />
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="flex-1 p-6 flex items-center justify-center min-h-[160px] bg-[var(--bg-secondary,#fafafa)]">
          {children(values)}
        </div>
      </div>

      {/* Code output */}
      <div className="border-t border-[var(--border-primary,#d1d5db)] p-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary,#6b7280)] mb-2">
          Generated Code
        </h3>
        <CodePanel code={getCode(componentName)} />
      </div>
    </div>
  )
}
