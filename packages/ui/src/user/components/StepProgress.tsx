import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  label: string
}

export interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep

          return (
            <React.Fragment key={index}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0',
                    isCompleted
                      ? 'bg-user-accent text-white'
                      : isActive
                        ? 'bg-user-primary text-white'
                        : 'bg-user-bg-section text-user-text-muted',
                  ].join(' ')}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={[
                    'text-xs text-center whitespace-nowrap',
                    isActive
                      ? 'text-user-primary font-medium'
                      : isCompleted
                        ? 'text-user-accent font-medium'
                        : 'text-user-text-muted',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    'flex-1 h-0.5 mx-2 -mt-6 transition-colors',
                    stepNumber < currentStep ? 'bg-user-accent' : 'bg-user-bg-section',
                  ].join(' ')}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
