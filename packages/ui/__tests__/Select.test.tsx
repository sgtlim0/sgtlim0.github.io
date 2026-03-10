import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { Select } from '../src/Select'
import { useSelect } from '../src/hooks/useSelect'
import type { SelectOption } from '../src/hooks/useSelect'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const options: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'disabled-item', label: 'Disabled Item', disabled: true },
]

// ---------------------------------------------------------------------------
// useSelect hook
// ---------------------------------------------------------------------------

describe('useSelect', () => {
  it('should initialize with closed state and empty selection', () => {
    const { result } = renderHook(() => useSelect(options))
    expect(result.current.isOpen).toBe(false)
    expect(result.current.selectedValue).toBe('')
    expect(result.current.searchQuery).toBe('')
    expect(result.current.highlightedIndex).toBe(-1)
  })

  it('should initialize with all options as filteredOptions', () => {
    const { result } = renderHook(() => useSelect(options))
    expect(result.current.filteredOptions).toEqual(options)
  })

  it('should open and close the dropdown', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should select a value (single mode)', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSelect(options, { onChange }),
    )

    act(() => {
      result.current.open()
    })

    act(() => {
      result.current.select('banana')
    })

    expect(result.current.selectedValue).toBe('banana')
    expect(onChange).toHaveBeenCalledWith('banana')
    expect(result.current.isOpen).toBe(false)
  })

  it('should not select a disabled option', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
      result.current.select('disabled-item')
    })

    expect(result.current.selectedValue).toBe('')
  })

  it('should filter options by search query', () => {
    const { result } = renderHook(() =>
      useSelect(options, { searchable: true }),
    )

    act(() => {
      result.current.setSearchQuery('ban')
    })

    expect(result.current.filteredOptions).toEqual([
      { value: 'banana', label: 'Banana' },
    ])
  })

  it('should filter case-insensitively', () => {
    const { result } = renderHook(() =>
      useSelect(options, { searchable: true }),
    )

    act(() => {
      result.current.setSearchQuery('APPLE')
    })

    expect(result.current.filteredOptions).toHaveLength(1)
    expect(result.current.filteredOptions[0].value).toBe('apple')
  })

  it('should reset search query on close', () => {
    const { result } = renderHook(() =>
      useSelect(options, { searchable: true }),
    )

    act(() => {
      result.current.open()
      result.current.setSearchQuery('ban')
    })
    expect(result.current.searchQuery).toBe('ban')

    act(() => {
      result.current.close()
    })
    expect(result.current.searchQuery).toBe('')
  })

  it('should support multiple selection', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSelect(options, { multiple: true, onChange }),
    )

    act(() => {
      result.current.open()
      result.current.select('apple')
    })

    // Should stay open in multiple mode
    expect(result.current.isOpen).toBe(true)
    expect(result.current.selectedValue).toEqual(['apple'])

    act(() => {
      result.current.select('cherry')
    })

    expect(result.current.selectedValue).toEqual(['apple', 'cherry'])
    expect(onChange).toHaveBeenCalledWith(['apple', 'cherry'])
  })

  it('should toggle selection in multiple mode', () => {
    const { result } = renderHook(() =>
      useSelect(options, { multiple: true }),
    )

    act(() => {
      result.current.open()
      result.current.select('apple')
    })
    expect(result.current.selectedValue).toEqual(['apple'])

    act(() => {
      result.current.select('apple')
    })
    expect(result.current.selectedValue).toEqual([])
  })

  // --- inputProps ---

  it('should return inputProps with combobox role', () => {
    const { result } = renderHook(() => useSelect(options))
    expect(result.current.inputProps.role).toBe('combobox')
    expect(result.current.inputProps['aria-expanded']).toBe(false)
    expect(result.current.inputProps['aria-haspopup']).toBe('listbox')
  })

  it('should update aria-expanded when open', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })

    expect(result.current.inputProps['aria-expanded']).toBe(true)
  })

  // --- listProps ---

  it('should return listProps with listbox role', () => {
    const { result } = renderHook(() => useSelect(options))
    expect(result.current.listProps.role).toBe('listbox')
  })

  // --- getOptionProps ---

  it('should return option props with correct role and aria', () => {
    const { result } = renderHook(() => useSelect(options))
    const props = result.current.getOptionProps(0)
    expect(props.role).toBe('option')
    expect(props['aria-selected']).toBe(false)
    expect(props['aria-disabled']).toBeUndefined()
  })

  it('should mark disabled options', () => {
    const { result } = renderHook(() => useSelect(options))
    const props = result.current.getOptionProps(3) // disabled-item
    expect(props['aria-disabled']).toBe(true)
  })

  it('should mark selected option', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
      result.current.select('apple')
    })

    // Need to re-open to check since single select closes
    act(() => {
      result.current.open()
    })

    const props = result.current.getOptionProps(0)
    expect(props['aria-selected']).toBe(true)
  })

  // --- Keyboard: highlightedIndex ---

  it('should set aria-activedescendant when highlighted', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })

    // Simulate ArrowDown via inputProps.onKeyDown
    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    act(() => {
      onKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      })
    })

    expect(result.current.highlightedIndex).toBe(0)
    expect(result.current.inputProps['aria-activedescendant']).toBe(
      'select-option-0',
    )
  })

  it('should navigate with ArrowUp/ArrowDown', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    // ArrowDown x2
    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(0)

    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(1)

    // ArrowUp
    act(() => {
      onKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(0)
  })

  it('should skip disabled options on keyboard navigation', () => {
    // options[3] is disabled
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    // Navigate to index 2 (cherry)
    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(2)

    // Next should wrap to 0, skipping disabled index 3
    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(0)
  })

  it('should select highlighted option on Enter', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSelect(options, { onChange }),
    )

    act(() => {
      result.current.open()
    })

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })

    act(() => {
      onKeyDown({ key: 'Enter', preventDefault: vi.fn() })
    })

    expect(result.current.selectedValue).toBe('apple')
    expect(onChange).toHaveBeenCalledWith('apple')
    expect(result.current.isOpen).toBe(false)
  })

  it('should close on Escape', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    act(() => {
      onKeyDown({ key: 'Escape', preventDefault: vi.fn() })
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should open on ArrowDown when closed', () => {
    const { result } = renderHook(() => useSelect(options))
    expect(result.current.isOpen).toBe(false)

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should reset highlightedIndex on close', () => {
    const { result } = renderHook(() => useSelect(options))

    act(() => {
      result.current.open()
    })

    const onKeyDown = result.current.inputProps.onKeyDown as (
      e: Partial<KeyboardEvent>,
    ) => void

    act(() => {
      onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() })
    })
    expect(result.current.highlightedIndex).toBe(0)

    act(() => {
      result.current.close()
    })
    expect(result.current.highlightedIndex).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// Select component
// ---------------------------------------------------------------------------

describe('Select', () => {
  beforeEach(() => {
    // Reset any document click listeners
    vi.restoreAllMocks()
  })

  it('should render with placeholder', () => {
    render(<Select options={options} placeholder="Choose a fruit" />)
    expect(screen.getByText('Choose a fruit')).toBeInTheDocument()
  })

  it('should open dropdown on trigger click', () => {
    render(<Select options={options} placeholder="Choose" />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('should select an option', () => {
    const onChange = vi.fn()
    render(
      <Select options={options} placeholder="Choose" onChange={onChange} />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Banana'))

    expect(onChange).toHaveBeenCalledWith('banana')
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('should render search input in searchable mode', () => {
    render(<Select options={options} searchable placeholder="Search..." />)

    fireEvent.click(screen.getByRole('combobox'))
    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
  })

  it('should filter options by search query', () => {
    render(<Select options={options} searchable placeholder="Search..." />)

    fireEvent.click(screen.getByRole('combobox'))
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'ch' } })

    expect(screen.getByText('Cherry')).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
  })

  it('should close dropdown on Escape key', () => {
    render(<Select options={options} placeholder="Choose" />)

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should navigate and select with keyboard', () => {
    const onChange = vi.fn()
    render(
      <Select options={options} placeholder="Choose" onChange={onChange} />,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    // ArrowDown to first option
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    // Enter to select
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('apple')
  })

  it('should not select disabled options', () => {
    const onChange = vi.fn()
    render(
      <Select options={options} placeholder="Choose" onChange={onChange} />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Disabled Item'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should support multiple selection with checkboxes', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={options}
        multiple
        placeholder="Choose"
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Apple'))
    fireEvent.click(screen.getByText('Cherry'))

    expect(onChange).toHaveBeenLastCalledWith(['apple', 'cherry'])
  })

  it('should show clear button when value is selected', () => {
    render(<Select options={options} placeholder="Choose" />)

    // No clear button initially
    expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Apple'))

    expect(screen.getByLabelText('Clear selection')).toBeInTheDocument()
  })

  it('should clear selection on clear button click', () => {
    const onChange = vi.fn()
    render(
      <Select options={options} placeholder="Choose" onChange={onChange} />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Apple'))

    const clearBtn = screen.getByLabelText('Clear selection')
    fireEvent.click(clearBtn)

    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByText('Choose')).toBeInTheDocument()
  })

  it('should close dropdown when clicking outside', () => {
    render(
      <div>
        <Select options={options} placeholder="Choose" />
        <button type="button">Outside</button>
      </div>,
    )

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByText('Outside'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Select options={options} placeholder="Choose" />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const optionElements = screen.getAllByRole('option')
    expect(optionElements.length).toBe(4)
  })

  it('should mark disabled options with aria-disabled', () => {
    render(<Select options={options} placeholder="Choose" />)

    fireEvent.click(screen.getByRole('combobox'))

    const disabledOption = screen.getByText('Disabled Item').closest('[role="option"]')
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
  })

  it('should toggle option in multiple mode on checkbox click', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={options}
        multiple
        placeholder="Choose"
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Apple'))
    expect(onChange).toHaveBeenLastCalledWith(['apple'])

    // Deselect
    fireEvent.click(screen.getByText('Apple'))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('should display selected label in single mode', () => {
    render(<Select options={options} placeholder="Choose" />)

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Cherry'))

    // The trigger should show the selected label
    expect(screen.getByRole('combobox')).toHaveTextContent('Cherry')
  })

  it('should display count in multiple mode', () => {
    render(<Select options={options} multiple placeholder="Choose" />)

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Apple'))
    fireEvent.click(screen.getByText('Cherry'))

    expect(screen.getByRole('combobox')).toHaveTextContent('2 selected')
  })

  it('should render with className', () => {
    const { container } = render(
      <Select options={options} placeholder="Choose" className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
