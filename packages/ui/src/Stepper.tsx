'use client'

import React, { Children, isValidElement, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useStepper } from './hooks/useStepper'
import type { StepConfig, UseStepperOptions, UseStepperReturn } from './hooks/useStepper'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepperOrientation = 'horizontal' | 'vertical'

export interface StepperProps {
  steps: StepConfig[]
  initialStep?: number
  linear?: boolean
  orientation?: StepperOrientation
  showProgress?: boolean
  children: ReactNode
  className?: string
  onStepChange?: (step: number) => void
  /** Render prop for external control — provides stepper return value */
  renderControls?: (stepper: UseStepperReturn) => ReactNode
}

export interface StepperContentProps {
  step: number
  children: ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const stepCircleBase =
  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 transition-colors shrink-0'

const stepCircleStyles = {
  completed:
    'bg-primary border-primary text-white',
  current:
    'border-primary text-primary bg-white dark:bg-gray-900',
  pending:
    'border-gray-300 text-gray-400 bg-white dark:border-gray-600 dark:text-gray-500 dark:bg-gray-900',
}

const connectorBase = 'transition-colors'

const connectorStyles = {
  horizontal: {
    completed: 'flex-1 h-0.5 bg-primary',
    pending: 'flex-1 h-0.5 bg-gray-300 dark:bg-gray-600',
  },
  vertical: {
    completed: 'w-0.5 min-h-[2rem] bg-primary ml-[15px]',
    pending: 'w-0.5 min-h-[2rem] bg-gray-300 dark:bg-gray-600 ml-[15px]',
  },
}

const labelStyles = {
  completed: 'text-sm font-medium text-gray-900 dark:text-white',
  current: 'text-sm font-medium text-primary',
  pending: 'text-sm font-medium text-gray-400 dark:text-gray-500',
}

const descStyles = 'text-xs text-gray-500 dark:text-gray-400'

// ---------------------------------------------------------------------------
// CheckIcon
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="2 7 5.5 10.5 12 4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// StepperContent
// ---------------------------------------------------------------------------

export function StepperContent({ children, className = '' }: StepperContentProps) {
  return <div className={className}>{children}</div>
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

export function Stepper({
  steps,
  initialStep,
  linear,
  orientation = 'horizontal',
  showProgress = false,
  children,
  className = '',
  onStepChange,
  renderControls,
}: StepperProps) {
  const stepper = useStepper(steps, { initialStep, linear })

  const {
    currentStep,
    completedSteps,
    goToStep,
    progress,
  } = stepper

  // Notify parent on step change
  const prevStepRef = React.useRef(currentStep)
  React.useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep
      onStepChange?.(currentStep)
    }
  }, [currentStep, onStepChange])

  // Map children by step index
  const contentMap = useMemo(() => {
    const map = new Map<number, ReactNode>()
    Children.forEach(children, (child) => {
      if (
        isValidElement(child) &&
        typeof child.props === 'object' &&
        child.props !== null &&
        'step' in child.props
      ) {
        const props = child.props as { step: number }
        map.set(props.step, child)
      }
    })
    return map
  }, [children])

  const isHorizontal = orientation === 'horizontal'

  const getStepState = (index: number): 'completed' | 'current' | 'pending' => {
    if (completedSteps.has(index)) return 'completed'
    if (index === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className={className}>
      {/* Progress bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Step indicators */}
      <nav
        aria-label="Progress steps"
        className={
          isHorizontal
            ? 'flex items-center mb-6'
            : 'flex flex-col mb-6'
        }
      >
        {steps.map((step, index) => {
          const state = getStepState(index)
          const isLast = index === steps.length - 1

          return isHorizontal ? (
            <React.Fragment key={step.id}>
              {/* Step circle + label (horizontal) */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`${stepCircleBase} ${stepCircleStyles[state]}`}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={`${step.label}${step.optional ? ' (optional)' : ''}`}
                >
                  {state === 'completed' ? <CheckIcon /> : index + 1}
                </button>
                <span className={labelStyles[state]}>{step.label}</span>
                {step.description && (
                  <span className={descStyles}>{step.description}</span>
                )}
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`${connectorBase} ${
                    connectorStyles.horizontal[
                      completedSteps.has(index) ? 'completed' : 'pending'
                    ]
                  } mx-2 mt-[-1.5rem]`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ) : (
            <React.Fragment key={step.id}>
              {/* Step circle + label (vertical) */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`${stepCircleBase} ${stepCircleStyles[state]}`}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={`${step.label}${step.optional ? ' (optional)' : ''}`}
                >
                  {state === 'completed' ? <CheckIcon /> : index + 1}
                </button>
                <div className="pt-1">
                  <span className={labelStyles[state]}>{step.label}</span>
                  {step.description && (
                    <p className={descStyles}>{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`${connectorBase} ${
                    connectorStyles.vertical[
                      completedSteps.has(index) ? 'completed' : 'pending'
                    ]
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* Active step content */}
      <div role="region" aria-live="polite" aria-atomic="true">
        {contentMap.get(currentStep) ?? null}
      </div>

      {/* External controls */}
      {renderControls?.(stepper)}
    </div>
  )
}
