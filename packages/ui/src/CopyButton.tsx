'use client'

import { useClipboard } from './hooks/useClipboard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CopyButtonProps {
  /** The text to copy when the button is clicked */
  text: string
  /** How long (ms) the success state persists (default 2000) */
  timeout?: number
  /** Additional CSS class names */
  className?: string
}

// ---------------------------------------------------------------------------
// Icons (inline SVG to avoid external dependencies)
// ---------------------------------------------------------------------------

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CopyButton({
  text,
  timeout = 2000,
  className = '',
}: CopyButtonProps) {
  const { copy, copied } = useClipboard({ timeout })

  const handleClick = () => {
    void copy(text)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? '복사됨' : '복사'}
      className={`inline-flex items-center justify-center rounded p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
        copied ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
      } ${className}`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}
