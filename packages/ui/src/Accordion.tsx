'use client'

import React, { useRef, useCallback, useId, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAccordion } from './hooks/useAccordion'
import type { UseAccordionOptions } from './hooks/useAccordion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionItemConfig {
  id: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps {
  items: AccordionItemConfig[]
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
  onChange?: (openIds: string[]) => void
}

export interface AccordionItemProps {
  id: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
  isOpen: boolean
  onToggle: () => void
  triggerId: string
  panelId: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const itemStyles = 'border-b border-gray-200 dark:border-gray-700'

const triggerStyles = [
  'flex w-full items-center justify-between',
  'px-4 py-3 text-left text-sm font-medium',
  'transition-colors',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  'hover:bg-gray-50 dark:hover:bg-gray-800',
].join(' ')

const disabledTriggerStyles = 'opacity-40 cursor-not-allowed'

const arrowStyles = [
  'ml-2 h-4 w-4 shrink-0 transition-transform duration-200',
].join(' ')

const panelStyles = [
  'overflow-hidden transition-[max-height] duration-200 ease-in-out',
].join(' ')

const panelContentStyles = 'px-4 pb-3 text-sm text-gray-600 dark:text-gray-300'

// ---------------------------------------------------------------------------
// Arrow Icon (inline SVG, no external deps)
// ---------------------------------------------------------------------------

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      className={`${arrowStyles} ${rotated ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// AccordionItem
// ---------------------------------------------------------------------------

export function AccordionItem({
  title,
  content,
  disabled = false,
  isOpen,
  onToggle,
  triggerId,
  panelId,
}: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<string>(isOpen ? 'none' : '0px')

  useEffect(() => {
    if (isOpen) {
      const el = contentRef.current
      if (el) {
        setMaxHeight(`${el.scrollHeight}px`)
        // After transition, set to 'none' for dynamic content
        const timer = setTimeout(() => setMaxHeight('none'), 200)
        return () => clearTimeout(timer)
      }
    } else {
      // First set the current height explicitly, then collapse
      const el = contentRef.current
      if (el) {
        setMaxHeight(`${el.scrollHeight}px`)
        // Force reflow then collapse
        requestAnimationFrame(() => {
          setMaxHeight('0px')
        })
      } else {
        setMaxHeight('0px')
      }
    }
  }, [isOpen])

  const handleClick = useCallback(() => {
    if (!disabled) {
      onToggle()
    }
  }, [disabled, onToggle])

  return (
    <div className={itemStyles}>
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          className={`${triggerStyles} ${disabled ? disabledTriggerStyles : ''}`}
          onClick={handleClick}
        >
          <span>{title}</span>
          <ChevronIcon rotated={isOpen} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={panelStyles}
        style={{ maxHeight }}
        ref={contentRef}
      >
        <div className={panelContentStyles}>{content}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------------

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen,
  className = '',
  onChange,
}: AccordionProps) {
  const baseId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const options: UseAccordionOptions = { allowMultiple, defaultOpen }
  const { isOpen, toggle, openItems } = useAccordion(options)

  // Notify parent when open items change
  const prevOpenRef = useRef<string>(JSON.stringify(Array.from(openItems)))
  const serialized = JSON.stringify(Array.from(openItems))
  if (serialized !== prevOpenRef.current) {
    prevOpenRef.current = serialized
    onChange?.(Array.from(openItems))
  }

  // Keyboard navigation: Arrow Up/Down between triggers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const triggers = containerRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded]',
      )
      if (!triggers || triggers.length === 0) return

      const currentIndex = Array.from(triggers).findIndex(
        (btn) => btn === document.activeElement,
      )
      if (currentIndex === -1) return

      let nextIndex: number | undefined

      switch (e.key) {
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % triggers.length
          break
        case 'ArrowUp':
          nextIndex =
            (currentIndex - 1 + triggers.length) % triggers.length
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = triggers.length - 1
          break
        default:
          return
      }

      if (nextIndex !== undefined) {
        e.preventDefault()
        triggers[nextIndex].focus()
      }
    },
    [],
  )

  return (
    <div
      ref={containerRef}
      className={`rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const triggerId = `${baseId}-trigger-${item.id}`
        const panelId = `${baseId}-panel-${item.id}`

        return (
          <AccordionItem
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content}
            disabled={item.disabled}
            isOpen={isOpen(item.id)}
            onToggle={() => toggle(item.id)}
            triggerId={triggerId}
            panelId={panelId}
          />
        )
      })}
    </div>
  )
}
