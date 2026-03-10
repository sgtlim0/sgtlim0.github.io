import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { z } from 'zod'
import { ToastQueueProvider, useToastQueue2 } from '../src/ToastQueueProvider'
import { ModalProvider, useModalContext } from '../src/hooks/ModalProvider'
import DynamicForm from '../src/DynamicForm'
import type { FieldConfig } from '../src/hooks/useFormBuilder'

// ---------------------------------------------------------------------------
// Wrapper with Toast + Modal providers
// ---------------------------------------------------------------------------

function FormFlowProviders({ children }: { children: ReactNode }) {
  return (
    <ToastQueueProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ToastQueueProvider>
  )
}

// ---------------------------------------------------------------------------
// Test fields
// ---------------------------------------------------------------------------

const testFields: FieldConfig[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    required: true,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validation: z.string().email('Invalid email format'),
  },
  {
    name: 'role',
    type: 'select',
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
]

// ---------------------------------------------------------------------------
// App component: Modal containing DynamicForm + toast on submit
// ---------------------------------------------------------------------------

function FormInModalApp() {
  const { addToast } = useToastQueue2()
  const { stack, openModal, closeModal } = useModalContext()
  const [lastSubmitted, setLastSubmitted] = useState<Record<string, unknown> | null>(null)

  const isModalOpen = stack.includes('form-modal')

  const handleSubmit = (values: Record<string, unknown>) => {
    setLastSubmitted(values)
    addToast({ type: 'success', title: 'Form submitted successfully', duration: 0 })
    closeModal('form-modal')
  }

  const handleOpenModal = () => {
    openModal('form-modal')
  }

  return (
    <div>
      <button data-testid="open-form-modal" onClick={handleOpenModal}>Open Form</button>
      {lastSubmitted && (
        <span data-testid="last-submitted">{JSON.stringify(lastSubmitted)}</span>
      )}

      {isModalOpen && (
        <div data-testid="modal-overlay" role="dialog" aria-modal="true">
          <div data-testid="modal-content">
            <h2>Create User</h2>
            <DynamicForm
              fields={testFields}
              onSubmit={handleSubmit}
              submitLabel="Create User"
            />
            <button
              data-testid="close-modal-btn"
              onClick={() => closeModal('form-modal')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// App with validation error toast
// ---------------------------------------------------------------------------

function FormWithErrorToast() {
  const { addToast } = useToastQueue2()
  const { stack, openModal, closeModal } = useModalContext()
  const isModalOpen = stack.includes('error-modal')

  const errorFields: FieldConfig[] = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: z.string().email('Please enter a valid email'),
    },
  ]

  const handleSubmit = (values: Record<string, unknown>) => {
    addToast({ type: 'success', title: 'Success!', duration: 0 })
    closeModal('error-modal')
  }

  return (
    <div>
      <button data-testid="open-error-modal" onClick={() => openModal('error-modal')}>Open</button>
      {isModalOpen && (
        <div data-testid="error-modal" role="dialog">
          <DynamicForm
            fields={errorFields}
            onSubmit={handleSubmit}
            submitLabel="Submit"
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()
})

describe('Integration: Form + Modal + Toast', () => {
  describe('modal contains DynamicForm', () => {
    it('should open modal with form fields', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      // Form not visible initially
      expect(screen.queryByText('Create User')).toBeNull()

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      // Modal and form are now visible
      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText('Name')).toBeDefined()
      expect(screen.getByText('Email')).toBeDefined()
      expect(screen.getByText('Role')).toBeDefined()
    })

    it('should render form inputs inside the modal', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      expect(screen.getByLabelText(/Name/)).toBeDefined()
      expect(screen.getByLabelText(/Email/)).toBeDefined()
      expect(screen.getByLabelText(/Role/)).toBeDefined()
    })
  })

  describe('form submit triggers toast', () => {
    it('should show success toast on valid form submission', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      // Fill valid data
      const nameInput = screen.getByLabelText(/Name/)
      const emailInput = screen.getByLabelText(/Email/)

      act(() => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      })

      // Submit via button
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Create User' }))
      })

      // Toast should appear
      expect(screen.getByText('Form submitted successfully')).toBeDefined()
      // Modal should close
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should store submitted values', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      act(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Jane' } })
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@test.com' } })
        fireEvent.change(screen.getByLabelText(/Role/), { target: { value: 'admin' } })
      })

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Create User' }))
      })

      const submitted = screen.getByTestId('last-submitted').textContent
      expect(submitted).toContain('Jane')
      expect(submitted).toContain('jane@test.com')
      expect(submitted).toContain('admin')
    })
  })

  describe('validation errors prevent submission', () => {
    it('should not submit when required field is empty', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      // Only fill email, leave name empty
      act(() => {
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'john@example.com' } })
      })

      // Submit with empty required name
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Create User' }))
      })

      // Modal should remain open (form not submitted)
      expect(screen.getByRole('dialog')).toBeDefined()
      // No success toast
      expect(screen.queryByText('Form submitted successfully')).toBeNull()
    })

    it('should show validation error for invalid email', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      const emailInput = screen.getByLabelText(/Email/)

      act(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'John' } })
        fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
      })

      // Blur to trigger touched state and display the error
      act(() => {
        fireEvent.blur(emailInput)
      })

      // Should show validation error after blur
      expect(screen.getByText('Invalid email format')).toBeDefined()
      // Submit button should be disabled (form invalid)
      const submitBtn = screen.getByRole('button', { name: 'Create User' })
      expect(submitBtn).toBeDisabled()
      // Modal remains open
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('should show inline error on blur for invalid email', () => {
      render(
        <FormFlowProviders>
          <FormWithErrorToast />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-error-modal'))
      })

      const emailInput = screen.getByLabelText(/Email/)

      act(() => {
        fireEvent.change(emailInput, { target: { value: 'bad' } })
        fireEvent.blur(emailInput)
      })

      expect(screen.getByText('Please enter a valid email')).toBeDefined()
    })
  })

  describe('modal close resets form context', () => {
    it('should close modal when cancel is clicked', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })
      expect(screen.getByRole('dialog')).toBeDefined()

      act(() => {
        fireEvent.click(screen.getByTestId('close-modal-btn'))
      })
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should close modal via Escape key', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })
      expect(screen.getByRole('dialog')).toBeDefined()

      // ModalProvider listens for Escape on window
      act(() => {
        fireEvent.keyDown(window, { key: 'Escape' })
      })
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should show fresh form when modal is reopened', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      // Open and fill
      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })
      act(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Temp' } })
      })

      // Close
      act(() => {
        fireEvent.click(screen.getByTestId('close-modal-btn'))
      })

      // Reopen — form remounts so values should be reset
      act(() => {
        fireEvent.click(screen.getByTestId('open-form-modal'))
      })

      const nameInput = screen.getByLabelText(/Name/) as HTMLInputElement
      expect(nameInput.value).toBe('')
    })
  })

  describe('multiple form submissions', () => {
    it('should accumulate toasts from multiple submissions', () => {
      render(
        <FormFlowProviders>
          <FormInModalApp />
        </FormFlowProviders>,
      )

      // First submission
      act(() => { fireEvent.click(screen.getByTestId('open-form-modal')) })
      act(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'User1' } })
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'u1@test.com' } })
      })
      act(() => { fireEvent.click(screen.getByRole('button', { name: 'Create User' })) })

      // Second submission
      act(() => { fireEvent.click(screen.getByTestId('open-form-modal')) })
      act(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'User2' } })
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'u2@test.com' } })
      })
      act(() => { fireEvent.click(screen.getByRole('button', { name: 'Create User' })) })

      // Two toast notifications should be present
      const toasts = screen.getAllByText('Form submitted successfully')
      expect(toasts.length).toBe(2)
    })
  })
})
