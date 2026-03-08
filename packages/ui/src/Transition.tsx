'use client'

import React, { type CSSProperties, type ReactNode } from 'react'
import { useTransition, type UseTransitionOptions } from './hooks/useTransition'

export type TransitionPresetType = 'fade' | 'slideUp' | 'slideDown' | 'scale'

/**
 * Returns entering/entered and exiting/exited style pairs for a given preset.
 */
export function getTransitionPreset(
  type: TransitionPresetType,
  duration: number = 300,
): { readonly visible: CSSProperties; readonly hidden: CSSProperties; readonly transition: string } {
  const transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

  switch (type) {
    case 'fade':
      return {
        visible: { opacity: 1, transform: 'none', transition },
        hidden: { opacity: 0, transform: 'none', transition },
        transition,
      }
    case 'slideUp':
      return {
        visible: { opacity: 1, transform: 'translateY(0)', transition },
        hidden: { opacity: 0, transform: 'translateY(16px)', transition },
        transition,
      }
    case 'slideDown':
      return {
        visible: { opacity: 1, transform: 'translateY(0)', transition },
        hidden: { opacity: 0, transform: 'translateY(-16px)', transition },
        transition,
      }
    case 'scale':
      return {
        visible: { opacity: 1, transform: 'scale(1)', transition },
        hidden: { opacity: 0, transform: 'scale(0.9)', transition },
        transition,
      }
  }
}

export interface TransitionProps extends UseTransitionOptions {
  /** Whether the content is visible */
  readonly show: boolean
  /** Transition preset (default: 'fade') */
  readonly preset?: TransitionPresetType
  /** Content to animate */
  readonly children: ReactNode
  /** Optional className for the wrapper div */
  readonly className?: string
}

/**
 * Declarative wrapper around useTransition that applies a preset animation.
 *
 * Unmounts children from the DOM when the exit animation completes.
 *
 * @example
 * ```tsx
 * <Transition show={isOpen} preset="slideUp" duration={200}>
 *   <div className="modal">Hello</div>
 * </Transition>
 * ```
 */
export default function Transition({
  show,
  preset = 'fade',
  duration = 300,
  onEnter,
  onExit,
  children,
  className,
}: TransitionProps) {
  const { state, isMounted } = useTransition(show, { duration, onEnter, onExit })

  if (!isMounted) return null

  const presetStyles = getTransitionPreset(preset, duration)
  const isVisible = state === 'entering' || state === 'entered'
  const style = isVisible ? presetStyles.visible : presetStyles.hidden

  return (
    <div className={className} style={style} data-transition-state={state}>
      {children}
    </div>
  )
}
