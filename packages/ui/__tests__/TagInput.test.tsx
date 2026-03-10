import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTagInput } from '../src/hooks/useTagInput'
import TagInput from '../src/TagInput'
import Tag from '../src/Tag'

// ---------------------------------------------------------------------------
// useTagInput hook tests
// ---------------------------------------------------------------------------

describe('useTagInput', () => {
  it('starts with empty tags by default', () => {
    const { result } = renderHook(() => useTagInput())
    expect(result.current.tags).toEqual([])
    expect(result.current.inputValue).toBe('')
    expect(result.current.isMaxReached).toBe(false)
  })

  it('starts with initialTags when provided', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['react', 'vue'] }),
    )
    expect(result.current.tags).toEqual(['react', 'vue'])
  })

  // --- addTag ---

  it('adds a tag successfully', () => {
    const { result } = renderHook(() => useTagInput())

    let success: boolean
    act(() => {
      success = result.current.addTag('react')
    })

    expect(success!).toBe(true)
    expect(result.current.tags).toEqual(['react'])
  })

  it('trims whitespace when adding a tag', () => {
    const { result } = renderHook(() => useTagInput())

    act(() => {
      result.current.addTag('  react  ')
    })

    expect(result.current.tags).toEqual(['react'])
  })

  it('rejects empty string tags', () => {
    const { result } = renderHook(() => useTagInput())

    let success: boolean
    act(() => {
      success = result.current.addTag('')
    })

    expect(success!).toBe(false)
    expect(result.current.tags).toEqual([])
  })

  it('rejects whitespace-only tags', () => {
    const { result } = renderHook(() => useTagInput())

    let success: boolean
    act(() => {
      success = result.current.addTag('   ')
    })

    expect(success!).toBe(false)
    expect(result.current.tags).toEqual([])
  })

  it('prevents duplicate tags by default', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['react'] }),
    )

    let success: boolean
    act(() => {
      success = result.current.addTag('react')
    })

    expect(success!).toBe(false)
    expect(result.current.tags).toEqual(['react'])
  })

  it('allows duplicate tags when allowDuplicates is true', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['react'], allowDuplicates: true }),
    )

    let success: boolean
    act(() => {
      success = result.current.addTag('react')
    })

    expect(success!).toBe(true)
    expect(result.current.tags).toEqual(['react', 'react'])
  })

  it('enforces maxTags limit', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a', 'b'], maxTags: 2 }),
    )

    expect(result.current.isMaxReached).toBe(true)

    let success: boolean
    act(() => {
      success = result.current.addTag('c')
    })

    expect(success!).toBe(false)
    expect(result.current.tags).toEqual(['a', 'b'])
  })

  it('rejects tags that fail validation', () => {
    const validate = (tag: string) => tag.length >= 2
    const { result } = renderHook(() => useTagInput({ validate }))

    let success: boolean
    act(() => {
      success = result.current.addTag('a')
    })

    expect(success!).toBe(false)
    expect(result.current.tags).toEqual([])
  })

  it('accepts tags that pass validation', () => {
    const validate = (tag: string) => tag.length >= 2
    const { result } = renderHook(() => useTagInput({ validate }))

    let success: boolean
    act(() => {
      success = result.current.addTag('ab')
    })

    expect(success!).toBe(true)
    expect(result.current.tags).toEqual(['ab'])
  })

  // --- removeTag ---

  it('removes a tag by index', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a', 'b', 'c'] }),
    )

    act(() => {
      result.current.removeTag(1)
    })

    expect(result.current.tags).toEqual(['a', 'c'])
  })

  it('handles out-of-bounds index gracefully', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a'] }),
    )

    act(() => {
      result.current.removeTag(5)
    })

    expect(result.current.tags).toEqual(['a'])
  })

  it('handles negative index gracefully', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a'] }),
    )

    act(() => {
      result.current.removeTag(-1)
    })

    expect(result.current.tags).toEqual(['a'])
  })

  // --- removeLastTag ---

  it('removes the last tag', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a', 'b', 'c'] }),
    )

    act(() => {
      result.current.removeLastTag()
    })

    expect(result.current.tags).toEqual(['a', 'b'])
  })

  it('does nothing when removing last tag from empty array', () => {
    const { result } = renderHook(() => useTagInput())

    act(() => {
      result.current.removeLastTag()
    })

    expect(result.current.tags).toEqual([])
  })

  // --- clearAll ---

  it('clears all tags', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a', 'b', 'c'] }),
    )

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.tags).toEqual([])
  })

  // --- inputValue ---

  it('updates inputValue via setInputValue', () => {
    const { result } = renderHook(() => useTagInput())

    act(() => {
      result.current.setInputValue('hello')
    })

    expect(result.current.inputValue).toBe('hello')
  })

  // --- isMaxReached ---

  it('isMaxReached is false when under the limit', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a'], maxTags: 3 }),
    )
    expect(result.current.isMaxReached).toBe(false)
  })

  it('isMaxReached is true when at the limit', () => {
    const { result } = renderHook(() =>
      useTagInput({ initialTags: ['a', 'b', 'c'], maxTags: 3 }),
    )
    expect(result.current.isMaxReached).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Tag component tests
// ---------------------------------------------------------------------------

describe('Tag', () => {
  it('renders label text', () => {
    render(<Tag label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders with role="listitem"', () => {
    render(<Tag label="React" />)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('shows remove button when onRemove is provided', () => {
    render(<Tag label="React" onRemove={() => {}} />)
    expect(screen.getByRole('button', { name: /remove react/i })).toBeInTheDocument()
  })

  it('does not show remove button when onRemove is not provided', () => {
    render(<Tag label="React" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<Tag label="React" onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /remove react/i }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    const { container } = render(<Tag label="Primary" variant="primary" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-blue-100')
  })

  it('applies size styles', () => {
    const { container } = render(<Tag label="Small" size="sm" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('text-xs')
  })

  it('applies custom className', () => {
    const { container } = render(<Tag label="Custom" className="my-class" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('my-class')
  })
})

// ---------------------------------------------------------------------------
// TagInput component tests
// ---------------------------------------------------------------------------

describe('TagInput', () => {
  it('renders with placeholder when no tags', () => {
    render(<TagInput placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('renders initial tags', () => {
    render(<TagInput initialTags={['react', 'vue']} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('vue')).toBeInTheDocument()
  })

  it('has role="list" on the container', () => {
    render(<TagInput aria-label="Tags" />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('has aria-label on the input', () => {
    render(<TagInput aria-label="My tags" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'My tags')
  })

  // --- Adding tags ---

  it('adds a tag on Enter key', () => {
    const onChange = vi.fn()
    render(<TagInput onChange={onChange} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('adds a tag on separator (comma) input', () => {
    const onChange = vi.fn()
    render(<TagInput onChange={onChange} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'react,' } })

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('clears input after adding a tag via Enter', () => {
    render(<TagInput />)

    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(input.value).toBe('')
  })

  it('does not add empty tags on Enter', () => {
    const onChange = vi.fn()
    render(<TagInput onChange={onChange} />)

    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('prevents duplicate tags by default', () => {
    render(<TagInput initialTags={['react']} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const tags = screen.getAllByText('react')
    expect(tags).toHaveLength(1)
  })

  // --- Removing tags ---

  it('removes a tag via X button', () => {
    const onChange = vi.fn()
    render(<TagInput initialTags={['react', 'vue']} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /remove react/i }))

    expect(screen.queryByText('react')).not.toBeInTheDocument()
    expect(screen.getByText('vue')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(['vue'])
  })

  it('removes last tag on Backspace when input is empty', () => {
    const onChange = vi.fn()
    render(<TagInput initialTags={['react', 'vue']} onChange={onChange} />)

    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(screen.queryByText('vue')).not.toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('does not remove tag on Backspace when input has value', () => {
    render(<TagInput initialTags={['react']} />)

    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'v' } })
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(screen.getByText('react')).toBeInTheDocument()
  })

  // --- Max tags ---

  it('hides input when max tags reached', () => {
    render(<TagInput initialTags={['a', 'b']} maxTags={2} />)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  // --- Validation ---

  it('rejects tags failing validation', () => {
    const validate = (tag: string) => tag.length >= 3
    render(<TagInput validate={validate} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.queryByText('ab')).not.toBeInTheDocument()
  })

  // --- Suggestions ---

  it('shows suggestions when typing', () => {
    render(<TagInput suggestions={['react', 'redux', 'vue']} />)

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 're' } })

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('redux')).toBeInTheDocument()
    expect(screen.queryByText('vue')).not.toBeInTheDocument()
  })

  it('adds a suggestion on click', () => {
    const onChange = vi.fn()
    render(
      <TagInput
        suggestions={['react', 'redux']}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 're' } })
    fireEvent.click(screen.getByText('react'))

    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('navigates suggestions with ArrowDown/ArrowUp', () => {
    render(<TagInput suggestions={['react', 'redux']} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 're' } })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('selects highlighted suggestion on Enter', () => {
    const onChange = vi.fn()
    render(
      <TagInput
        suggestions={['react', 'redux']}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 're' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('closes suggestions on Escape', () => {
    render(<TagInput suggestions={['react', 'redux']} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 're' } })

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  // --- Disabled ---

  it('disables input when disabled prop is true', () => {
    render(<TagInput disabled />)

    const input = screen.getByRole('combobox')
    expect(input).toBeDisabled()
  })

  it('does not show remove buttons when disabled', () => {
    render(<TagInput initialTags={['react']} disabled />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // --- Custom separator ---

  it('supports custom separator', () => {
    render(<TagInput separator=";" />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'react;' } })

    expect(screen.getByText('react')).toBeInTheDocument()
  })

  // --- className ---

  it('applies custom className', () => {
    const { container } = render(<TagInput className="custom-input" />)
    expect(container.firstChild).toHaveClass('custom-input')
  })
})
