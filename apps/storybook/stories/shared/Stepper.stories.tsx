import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Stepper, StepperContent } from '@hchat/ui'
import type { StepConfig, UseStepperReturn } from '@hchat/ui'

const wizardSteps: StepConfig[] = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up profile info' },
  { id: 'confirm', label: 'Confirm', description: 'Review and submit' },
]

function StepperWithControls() {
  return (
    <Stepper
      steps={wizardSteps}
      showProgress
      className="max-w-xl mx-auto p-6"
      renderControls={(stepper: UseStepperReturn) => (
        <div className="flex gap-3 mt-6">
          <button
            onClick={stepper.prevStep}
            disabled={!stepper.canGoBack}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
          >
            Back
          </button>
          {stepper.isLastStep ? (
            <button
              onClick={() => stepper.completeStep(stepper.currentStep)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() => {
                stepper.completeStep(stepper.currentStep)
                stepper.nextStep()
              }}
              disabled={!stepper.canGoForward}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40"
            >
              Next
            </button>
          )}
        </div>
      )}
    >
      <StepperContent step={0}>
        <div className="p-4 border rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Step 1: Account</h3>
          <p>Enter your email and password to create an account.</p>
        </div>
      </StepperContent>
      <StepperContent step={1}>
        <div className="p-4 border rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Step 2: Profile</h3>
          <p>Add your name, department, and profile photo.</p>
        </div>
      </StepperContent>
      <StepperContent step={2}>
        <div className="p-4 border rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Step 3: Confirm</h3>
          <p>Review your information and submit.</p>
        </div>
      </StepperContent>
    </Stepper>
  )
}

const meta: Meta = {
  title: 'Shared/Stepper',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const ThreeStepWizard: Story = {
  render: () => <StepperWithControls />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Step 1 should be visible
    expect(canvas.getByText('Step 1: Account')).toBeTruthy()

    // Click Next
    const nextBtn = canvas.getByText('Next')
    await userEvent.click(nextBtn)

    // Step 2 should be visible
    await waitFor(() => {
      expect(canvas.getByText('Step 2: Profile')).toBeTruthy()
    })

    // Click Next again
    await userEvent.click(canvas.getByText('Next'))

    // Step 3 with Submit button
    await waitFor(() => {
      expect(canvas.getByText('Step 3: Confirm')).toBeTruthy()
      expect(canvas.getByText('Submit')).toBeTruthy()
    })
  },
}

export const VerticalStepper: Story = {
  render: () => (
    <Stepper
      steps={wizardSteps}
      orientation="vertical"
      showProgress
      className="max-w-md mx-auto p-6"
    >
      <StepperContent step={0}>
        <div className="p-4 border rounded-lg text-sm">Account setup content</div>
      </StepperContent>
      <StepperContent step={1}>
        <div className="p-4 border rounded-lg text-sm">Profile setup content</div>
      </StepperContent>
      <StepperContent step={2}>
        <div className="p-4 border rounded-lg text-sm">Confirmation content</div>
      </StepperContent>
    </Stepper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify step indicators
    const stepNav = canvas.getByRole('navigation', { name: 'Progress steps' })
    expect(stepNav).toBeTruthy()

    // First step should be current
    const currentStep = canvasElement.querySelector('[aria-current="step"]')
    expect(currentStep).toBeTruthy()
  },
}
