'use client'

import React, { cloneElement, isValidElement, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTooltip } from './hooks/useTooltip'
import type { TooltipPlacement } from './hooks/useTooltip'

export interface TooltipProps {
  /** Tooltip content text */
  content: string
  /** Placement relative to trigger element */
  placement?: TooltipPlacement
  /** Show delay in ms (default 200) */
  delay?: number
  /** Offset from trigger in px (default 8) */
  offset?: number
  /** Trigger element — must accept ref forwarding */
  children: React.ReactElement<Record<string, unknown>>
}

const arrowSize = 6

function getArrowStyle(placement: TooltipPlacement): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  }

  switch (placement) {
    case 'top':
      return {
        ...base,
        bottom: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: 'var(--text-primary, #111827) transparent transparent transparent',
      }
    case 'bottom':
      return {
        ...base,
        top: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: 'transparent transparent var(--text-primary, #111827) transparent',
      }
    case 'left':
      return {
        ...base,
        right: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: 'transparent transparent transparent var(--text-primary, #111827)',
      }
    case 'right':
      return {
        ...base,
        left: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: 'transparent var(--text-primary, #111827) transparent transparent',
      }
  }
}

/**
 * Tooltip component — renders via Portal, supports hover + focus trigger,
 * 4-direction placement with auto-flip, CSS triangle arrow, and Escape to close.
 *
 * @example
 * <Tooltip content="Delete this item" placement="top">
 *   <button>Delete</button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  placement = 'top',
  delay = 200,
  offset = 8,
  children,
}: TooltipProps) {
  const { isVisible, triggerProps, tooltipProps } = useTooltip({
    placement,
    delay,
    offset,
  })

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // SSR-safe portal mount
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  // Merge trigger props into child element
  const child = isValidElement(children)
    ? cloneElement(children, {
        ...triggerProps,
        ref: triggerProps.ref,
      } as Record<string, unknown>)
    : children

  const tooltipElement = isVisible ? (
    <div
      {...tooltipProps}
      data-testid="tooltip"
      data-placement={placement}
      style={{
        ...tooltipProps.style,
        maxWidth: 300,
        padding: '6px 10px',
        borderRadius: 4,
        fontSize: 13,
        lineHeight: 1.4,
        backgroundColor: 'var(--text-primary, #111827)',
        color: 'var(--bg-page, #FFFFFF)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {content}
      <span style={getArrowStyle(placement)} data-testid="tooltip-arrow" />
    </div>
  ) : null

  return (
    <>
      {child}
      {portalContainer && tooltipElement ? createPortal(tooltipElement, portalContainer) : null}
    </>
  )
}

export default Tooltip
