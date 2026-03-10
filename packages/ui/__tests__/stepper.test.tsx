import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useStepper } from '../src/hooks/useStepper'
import type { StepConfig } from '../src/hooks/useStepper'
import { Stepper, StepperContent } from '../src/Stepper'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleSteps: StepConfig[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'review', label: 'Review' },
]

const stepsWithOptional: StepConfig[] = [
  { id: 'step1', label: 'Step 1' },
  { id: 'step2', label: 'Step 2', optional: true },
  { id: 'step3', label: 'Step 3' },
]

const stepsWithDescriptions: StepConfig[] = [
  { id: 'step1', label: 'Step 1', description: 'First step details' },
  { id: 'step2', label: 'Step 2', description: 'Second step details' },
]

// ---------------------------------------------------------------------------
// useStepper hook tests
// ---------------------------------------------------------------------------

describe('useStepper', () => {
  it('defaults to step 0', () => {
    const { result } = renderHook(() => useStepper(sampleSteps))
    expect(result.current.currentStep).toBe(0)
    expect(result.current.currentStepConfig).toEqual(sampleSteps[0])
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
  })

  it('respects initialStep option', () => {
    const { result } = renderHook(() =>
      useStepper(sampleSteps, { initialStep: 2 }),
    )
    expect(result.current.currentStep).toBe(2)
    expect(result.current.isLastStep).toBe(true)
  })

  it('clamps initialStep to valid range', () => {
    const { result } = renderHook(() =>
      useStepper(sampleSteps, { initialStep: 99 }),
    )
    expect(result.current.currentStep).toBe(2)

    const { result: result2 } = renderHook(() =>
      useStepper(sampleSteps, { initialStep: -5 }),
    )
    expect(result2.current.currentStep).toBe(0)
  })

  it('moves to next step with nextStep()', async () => {
    const { result } = renderHook(() => useStepper(sampleSteps))

    let success: boolean = false
    await act(async () => {
      success = await result.current.nextStep()
    })

    expect(success).toBe(true)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.completedSteps.has(0)).toBe(true)
  })

  it('does not advance past last step', async () => {
    const { result } = renderHook(() =>
      useStepper(sampleSteps, { initialStep: 2 }),
    )

    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(2)
    // Last step should be marked completed
    expect(result.current.completedSteps.has(2)).toBe(true)
  })

  it('moves to previous step with prevStep()', () => {
    const { result } = renderHook(() =>
      useStepper(sampleSteps, { initialStep: 1 }),
    )

    act(() => {
      result.current.prevStep()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.isFirstStep).toBe(true)
  })

  it('does not go before first step', () => {
    const { result } = renderHook(() => useStepper(sampleSteps))

    act(() => {
      result.current.prevStep()
    })

    expect(result.current.currentStep).toBe(0)
  })

  it('resets to initial state', async () => {
    const { result } = renderHook(() => useStepper(sampleSteps))

    await act(async () => {
      await result.current.nextStep()
      await result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.completedSteps.size).toBe(2)

    act(() => {
      result.current.reset()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.completedSteps.size).toBe(0)
  })

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  describe('validation', () => {
    it('blocks nextStep when validate returns false', async () => {
      const stepsWithValidation: StepConfig[] = [
        { id: 'step1', label: 'Step 1', validate: () => false },
        { id: 'step2', label: 'Step 2' },
      ]

      const { result } = renderHook(() => useStepper(stepsWithValidation))

      let success: boolean = true
      await act(async () => {
        success = await result.current.nextStep()
      })

      expect(success).toBe(false)
      expect(result.current.currentStep).toBe(0)
      expect(result.current.completedSteps.has(0)).toBe(false)
    })

    it('allows nextStep when validate returns true', async () => {
      const stepsWithValidation: StepConfig[] = [
        { id: 'step1', label: 'Step 1', validate: () => true },
        { id: 'step2', label: 'Step 2' },
      ]

      const { result } = renderHook(() => useStepper(stepsWithValidation))

      let success: boolean = false
      await act(async () => {
        success = await result.current.nextStep()
      })

      expect(success).toBe(true)
      expect(result.current.currentStep).toBe(1)
    })

    it('supports async validate function', async () => {
      const asyncValidator = vi.fn(
        () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 10)),
      )

      const stepsWithAsync: StepConfig[] = [
        { id: 'step1', label: 'Step 1', validate: asyncValidator },
        { id: 'step2', label: 'Step 2' },
      ]

      const { result } = renderHook(() => useStepper(stepsWithAsync))

      await act(async () => {
        await result.current.nextStep()
      })

      expect(asyncValidator).toHaveBeenCalledTimes(1)
      expect(result.current.currentStep).toBe(1)
    })

    it('blocks nextStep when async validate rejects', async () => {
      const stepsWithReject: StepConfig[] = [
        {
          id: 'step1',
          label: 'Step 1',
          validate: () => Promise.reject(new Error('Network error')),
        },
        { id: 'step2', label: 'Step 2' },
      ]

      const { result } = renderHook(() => useStepper(stepsWithReject))

      let success: boolean = true
      await act(async () => {
        success = await result.current.nextStep()
      })

      expect(success).toBe(false)
      expect(result.current.currentStep).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // Linear mode
  // -------------------------------------------------------------------------

  describe('linear mode', () => {
    it('blocks jumping forward to uncompleted steps', () => {
      const { result } = renderHook(() =>
        useStepper(sampleSteps, { linear: true }),
      )

      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(0)
    })

    it('allows jumping backward in linear mode', async () => {
      const { result } = renderHook(() =>
        useStepper(sampleSteps, { linear: true }),
      )

      await act(async () => {
        await result.current.nextStep()
        await result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(2)

      act(() => {
        result.current.goToStep(0)
      })

      expect(result.current.currentStep).toBe(0)
    })

    it('allows jumping forward when previous steps are completed', async () => {
      const { result } = renderHook(() =>
        useStepper(sampleSteps, { linear: true }),
      )

      await act(async () => {
        await result.current.nextStep()
        await result.current.nextStep()
      })

      act(() => {
        result.current.goToStep(0)
      })

      // Now jump to step 2 — all previous steps are completed
      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(2)
    })

    it('allows skipping optional steps in linear mode', async () => {
      const { result } = renderHook(() =>
        useStepper(stepsWithOptional, { linear: true }),
      )

      // Complete step 0
      await act(async () => {
        await result.current.nextStep()
      })

      // Jump to step 2 — step 1 is optional
      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(2)
    })
  })

  // -------------------------------------------------------------------------
  // Non-linear mode
  // -------------------------------------------------------------------------

  describe('non-linear mode', () => {
    it('allows free navigation between steps', () => {
      const { result } = renderHook(() =>
        useStepper(sampleSteps, { linear: false }),
      )

      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(2)

      act(() => {
        result.current.goToStep(0)
      })

      expect(result.current.currentStep).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // Progress
  // -------------------------------------------------------------------------

  describe('progress', () => {
    it('starts at 0%', () => {
      const { result } = renderHook(() => useStepper(sampleSteps))
      expect(result.current.progress).toBe(0)
    })

    it('calculates progress based on completed steps', async () => {
      const { result } = renderHook(() => useStepper(sampleSteps))

      await act(async () => {
        await result.current.nextStep()
      })

      // 1 of 3 steps completed = 33%
      expect(result.current.progress).toBe(33)
    })

    it('reaches 100% when all steps completed', async () => {
      const twoSteps: StepConfig[] = [
        { id: 's1', label: 'S1' },
        { id: 's2', label: 'S2' },
      ]

      const { result } = renderHook(() => useStepper(twoSteps))

      await act(async () => {
        await result.current.nextStep()
        await result.current.nextStep()
      })

      expect(result.current.progress).toBe(100)
    })

    it('returns 0 for single step not completed', () => {
      const single: StepConfig[] = [{ id: 's1', label: 'S1' }]
      const { result } = renderHook(() => useStepper(single))
      expect(result.current.progress).toBe(0)
    })

    it('returns 100 for single step completed', async () => {
      const single: StepConfig[] = [{ id: 's1', label: 'S1' }]
      const { result } = renderHook(() => useStepper(single))

      await act(async () => {
        await result.current.nextStep()
      })

      expect(result.current.progress).toBe(100)
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('goToStep ignores out-of-bounds index', () => {
      const { result } = renderHook(() => useStepper(sampleSteps))

      act(() => {
        result.current.goToStep(-1)
      })
      expect(result.current.currentStep).toBe(0)

      act(() => {
        result.current.goToStep(99)
      })
      expect(result.current.currentStep).toBe(0)
    })
  })
})

// ---------------------------------------------------------------------------
// Stepper component tests
// ---------------------------------------------------------------------------

describe('Stepper', () => {
  it('renders all step labels', () => {
    render(
      <Stepper steps={sampleSteps}>
        <StepperContent step={0}>Account content</StepperContent>
        <StepperContent step={1}>Profile content</StepperContent>
        <StepperContent step={2}>Review content</StepperContent>
      </Stepper>,
    )

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders step descriptions', () => {
    render(
      <Stepper steps={stepsWithDescriptions}>
        <StepperContent step={0}>Content 1</StepperContent>
        <StepperContent step={1}>Content 2</StepperContent>
      </Stepper>,
    )

    expect(screen.getByText('First step details')).toBeInTheDocument()
    expect(screen.getByText('Second step details')).toBeInTheDocument()
  })

  it('renders first step content by default', () => {
    render(
      <Stepper steps={sampleSteps}>
        <StepperContent step={0}>Account content</StepperContent>
        <StepperContent step={1}>Profile content</StepperContent>
      </Stepper>,
    )

    expect(screen.getByText('Account content')).toBeInTheDocument()
    expect(screen.queryByText('Profile content')).not.toBeInTheDocument()
  })

  it('sets aria-current="step" on the current step button', () => {
    render(
      <Stepper steps={sampleSteps}>
        <StepperContent step={0}>Content</StepperContent>
      </Stepper>,
    )

    const currentButton = screen.getByRole('button', { name: /account/i })
    expect(currentButton).toHaveAttribute('aria-current', 'step')

    const pendingButton = screen.getByRole('button', { name: /profile/i })
    expect(pendingButton).not.toHaveAttribute('aria-current')
  })

  it('navigates to a step when clicking its button', () => {
    render(
      <Stepper steps={sampleSteps} linear={false}>
        <StepperContent step={0}>Account content</StepperContent>
        <StepperContent step={1}>Profile content</StepperContent>
        <StepperContent step={2}>Review content</StepperContent>
      </Stepper>,
    )

    fireEvent.click(screen.getByRole('button', { name: /review/i }))

    expect(screen.getByText('Review content')).toBeInTheDocument()
    expect(screen.queryByText('Account content')).not.toBeInTheDocument()
  })

  it('renders in vertical orientation', () => {
    render(
      <Stepper steps={sampleSteps} orientation="vertical">
        <StepperContent step={0}>Content</StepperContent>
      </Stepper>,
    )

    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('flex-col')
  })

  it('renders progress bar when showProgress is true', () => {
    render(
      <Stepper steps={sampleSteps} showProgress>
        <StepperContent step={0}>Content</StepperContent>
      </Stepper>,
    )

    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('calls onStepChange when step changes', () => {
    const onChange = vi.fn()

    render(
      <Stepper steps={sampleSteps} linear={false} onStepChange={onChange}>
        <StepperContent step={0}>Content 0</StepperContent>
        <StepperContent step={1}>Content 1</StepperContent>
      </Stepper>,
    )

    fireEvent.click(screen.getByRole('button', { name: /profile/i }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('renders controls via renderControls prop', () => {
    render(
      <Stepper
        steps={sampleSteps}
        renderControls={(stepper) => (
          <button type="button" onClick={() => stepper.nextStep()}>
            Next
          </button>
        )}
      >
        <StepperContent step={0}>Content</StepperContent>
      </Stepper>,
    )

    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('has aria-live region for step content', () => {
    render(
      <Stepper steps={sampleSteps}>
        <StepperContent step={0}>Content</StepperContent>
      </Stepper>,
    )

    const liveRegion = screen.getByRole('region')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('renders step numbers for pending steps and check for completed', async () => {
    const { container } = render(
      <Stepper
        steps={sampleSteps}
        linear={false}
        renderControls={(stepper) => (
          <button type="button" onClick={() => stepper.nextStep()} data-testid="next-btn">
            Next
          </button>
        )}
      >
        <StepperContent step={0}>Content 0</StepperContent>
        <StepperContent step={1}>Content 1</StepperContent>
        <StepperContent step={2}>Content 2</StepperContent>
      </Stepper>,
    )

    // Step 1 should show "1"
    const firstStepButton = screen.getByRole('button', { name: /account/i })
    expect(firstStepButton.textContent).toBe('1')

    // Advance to next step — step 0 should now show check icon (SVG)
    await act(async () => {
      fireEvent.click(screen.getByTestId('next-btn'))
    })

    const svgs = firstStepButton.querySelectorAll('svg')
    expect(svgs.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// StepperContent
// ---------------------------------------------------------------------------

describe('StepperContent', () => {
  it('renders children', () => {
    render(<StepperContent step={0}>Hello World</StepperContent>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(
      <StepperContent step={0} className="custom-class">
        Content
      </StepperContent>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
