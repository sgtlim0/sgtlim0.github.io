import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../src/Toast'

function ToastTrigger() {
  const { toast } = useToast()
  return (
    <div>
      <button onClick={() => toast('Success!', 'success')}>Show Success</button>
      <button onClick={() => toast('Error!', 'error')}>Show Error</button>
      <button onClick={() => toast('Warning!', 'warning')}>Show Warning</button>
      <button onClick={() => toast('Info!')}>Show Info</button>
    </div>
  )
}

describe('Toast', () => {
  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <span>Child</span>
        </ToastProvider>,
      )
      expect(screen.getByText('Child')).toBeDefined()
    })

    it('should show success toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success!')).toBeDefined()
    })

    it('should show error toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Error'))
      expect(screen.getByText('Error!')).toBeDefined()
    })

    it('should show warning toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Warning'))
      expect(screen.getByText('Warning!')).toBeDefined()
    })

    it('should show info toast by default', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Info'))
      expect(screen.getByText('Info!')).toBeDefined()
    })

    it('should auto-remove toast after duration', () => {
      vi.useFakeTimers()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success!')).toBeDefined()

      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(screen.queryByText('Success!')).toBeNull()

      vi.useRealTimers()
    })

    it('should show multiple toasts', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))

      expect(screen.getByText('Success!')).toBeDefined()
      expect(screen.getByText('Error!')).toBeDefined()
    })
  })

  describe('useToast', () => {
    it('should throw error when used outside provider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        function BadComponent() {
          useToast()
          return null
        }
        render(<BadComponent />)
      }).toThrow('useToast must be used within ToastProvider')

      spy.mockRestore()
    })
  })
})
