'use client'

import { useState, useCallback, useMemo, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StepConfig {
  id: string
  label: string
  description?: string
  optional?: boolean
  validate?: () => boolean | Promise<boolean>
}

export interface UseStepperOptions {
  initialStep?: number
  linear?: boolean
}

export interface UseStepperReturn {
  currentStep: number
  currentStepConfig: StepConfig
  isFirstStep: boolean
  isLastStep: boolean
  completedSteps: Set<number>
  goToStep: (index: number) => void
  nextStep: () => Promise<boolean>
  prevStep: () => void
  reset: () => void
  progress: number
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStepper(
  steps: StepConfig[],
  options: UseStepperOptions = {},
): UseStepperReturn {
  const { initialStep = 0, linear = true } = options

  const clampedInitial = Math.max(0, Math.min(initialStep, steps.length - 1))

  const [currentStep, setCurrentStep] = useState(clampedInitial)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set(),
  )

  // Refs to avoid stale closures in async callbacks
  const currentStepRef = useRef(currentStep)
  currentStepRef.current = currentStep
  const completedStepsRef = useRef(completedSteps)
  completedStepsRef.current = completedSteps

  const currentStepConfig = useMemo(
    () => steps[currentStep] ?? steps[0],
    [steps, currentStep],
  )

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const progress = useMemo(() => {
    if (steps.length <= 1) return completedSteps.has(0) ? 100 : 0
    return Math.round((completedSteps.size / steps.length) * 100)
  }, [completedSteps, steps.length])

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) return

      const current = currentStepRef.current
      const completed = completedStepsRef.current

      if (linear && index > current) {
        // In linear mode, must have all previous steps completed (or optional)
        for (let i = 0; i < index; i++) {
          if (!completed.has(i) && !steps[i].optional) return
        }
      }

      setCurrentStep(index)
    },
    [steps, linear],
  )

  const nextStep = useCallback(async (): Promise<boolean> => {
    const step = currentStepRef.current
    const stepConfig = steps[step]

    // Run validation if present
    if (stepConfig?.validate) {
      try {
        const isValid = await stepConfig.validate()
        if (!isValid) return false
      } catch {
        return false
      }
    }

    // Mark current step as completed
    const updatedCompleted = new Set(completedStepsRef.current)
    updatedCompleted.add(step)
    completedStepsRef.current = updatedCompleted
    setCompletedSteps(updatedCompleted)

    // Move to next step if not last
    if (step < steps.length - 1) {
      const nextIndex = step + 1
      currentStepRef.current = nextIndex
      setCurrentStep(nextIndex)
    }

    return true
  }, [steps])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const reset = useCallback(() => {
    setCurrentStep(clampedInitial)
    setCompletedSteps(new Set())
  }, [clampedInitial])

  return {
    currentStep,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    reset,
    progress,
  }
}
