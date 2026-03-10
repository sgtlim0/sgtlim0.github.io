import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { usePlayground } from '../src/hooks/usePlayground'
import type { PropDef } from '../src/hooks/usePlayground'
import PropEditor from '../src/PropEditor'
import Playground from '../src/Playground'

// ===========================================================================
// 1. usePlayground hook
// ===========================================================================

const SAMPLE_DEFS: PropDef[] = [
  { name: 'label', type: 'string', defaultValue: 'Hello' },
  { name: 'count', type: 'number', defaultValue: 5 },
  { name: 'visible', type: 'boolean', defaultValue: true },
  { name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
  { name: 'color', type: 'color', defaultValue: '#ff0000' },
  { name: 'opacity', type: 'range', defaultValue: 50, min: 0, max: 100, step: 10 },
]

describe('usePlayground', () => {
  it('initialises values from defaults', () => {
    const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))
    expect(result.current.values).toEqual({
      label: 'Hello',
      count: 5,
      visible: true,
      size: 'md',
      color: '#ff0000',
      opacity: 50,
    })
  })

  it('setValue updates a single prop immutably', () => {
    const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))
    const prevValues = result.current.values

    act(() => {
      result.current.setValue('label', 'World')
    })

    expect(result.current.values.label).toBe('World')
    expect(result.current.values.count).toBe(5) // unchanged
    expect(result.current.values).not.toBe(prevValues) // new reference
  })

  it('reset restores default values', () => {
    const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))

    act(() => {
      result.current.setValue('label', 'Changed')
      result.current.setValue('count', 99)
    })

    expect(result.current.values.label).toBe('Changed')

    act(() => {
      result.current.reset()
    })

    expect(result.current.values).toEqual({
      label: 'Hello',
      count: 5,
      visible: true,
      size: 'md',
      color: '#ff0000',
      opacity: 50,
    })
  })

  // -------------------------------------------------------------------------
  // getCode — JSX generation
  // -------------------------------------------------------------------------

  describe('getCode', () => {
    it('generates self-closing tag when no props differ from defaults', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))
      expect(result.current.getCode('Badge')).toBe('<Badge />')
    })

    it('uses default component name "Component"', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))
      expect(result.current.getCode()).toBe('<Component />')
    })

    it('generates inline props when 1-2 differ', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))

      act(() => {
        result.current.setValue('label', 'Changed')
      })

      expect(result.current.getCode('Tag')).toBe('<Tag label="Changed" />')
    })

    it('generates multiline props when >2 differ', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))

      act(() => {
        result.current.setValue('label', 'New')
        result.current.setValue('count', 10)
        result.current.setValue('visible', false)
      })

      const code = result.current.getCode('Card')
      expect(code).toContain('<Card')
      expect(code).toContain('label="New"')
      expect(code).toContain('count={10}')
      expect(code).toContain('visible={false}')
      expect(code).toContain('/>')
    })

    it('formats boolean true as bare prop name', () => {
      const defs: PropDef[] = [{ name: 'active', type: 'boolean', defaultValue: false }]
      const { result } = renderHook(() => usePlayground(defs))

      act(() => {
        result.current.setValue('active', true)
      })

      expect(result.current.getCode('X')).toBe('<X active />')
    })

    it('formats boolean false as explicit prop', () => {
      const defs: PropDef[] = [{ name: 'active', type: 'boolean', defaultValue: true }]
      const { result } = renderHook(() => usePlayground(defs))

      act(() => {
        result.current.setValue('active', false)
      })

      expect(result.current.getCode('X')).toBe('<X active={false} />')
    })

    it('formats string/color/select props with quotes', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))

      act(() => {
        result.current.setValue('size', 'lg')
        result.current.setValue('color', '#00ff00')
      })

      const code = result.current.getCode('Btn')
      expect(code).toContain('size="lg"')
      expect(code).toContain('color="#00ff00"')
    })

    it('formats number/range props with curly braces', () => {
      const { result } = renderHook(() => usePlayground(SAMPLE_DEFS))

      act(() => {
        result.current.setValue('count', 42)
      })

      expect(result.current.getCode('X')).toBe('<X count={42} />')
    })
  })
})

// ===========================================================================
// 2. PropEditor component
// ===========================================================================

describe('PropEditor', () => {
  it('renders string editor with text input', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'title', type: 'string', defaultValue: '' }}
        value="Hello"
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText(/title/i)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('Hello')

    fireEvent.change(input, { target: { value: 'World' } })
    expect(onChange).toHaveBeenCalledWith('title', 'World')
  })

  it('renders number editor', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'count', type: 'number', defaultValue: 0, min: 0, max: 10, step: 2 }}
        value={5}
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText(/count/i)
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '10')
    expect(input).toHaveAttribute('step', '2')

    fireEvent.change(input, { target: { value: '8' } })
    expect(onChange).toHaveBeenCalledWith('count', 8)
  })

  it('renders boolean editor with checkbox', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'active', type: 'boolean', defaultValue: false }}
        value={false}
        onChange={onChange}
      />,
    )

    const checkbox = screen.getByLabelText(/active/i)
    expect(checkbox).toHaveAttribute('type', 'checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledWith('active', true)
  })

  it('renders select editor with options', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] }}
        value="md"
        onChange={onChange}
      />,
    )

    const select = screen.getByLabelText(/size/i)
    expect(select.tagName).toBe('SELECT')

    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('sm')
    expect(options[1]).toHaveTextContent('md')
    expect(options[2]).toHaveTextContent('lg')

    fireEvent.change(select, { target: { value: 'lg' } })
    expect(onChange).toHaveBeenCalledWith('size', 'lg')
  })

  it('renders color editor', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'bg', type: 'color', defaultValue: '#000000' }}
        value="#ff0000"
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText(/bg/i)
    expect(input).toHaveAttribute('type', 'color')
    expect(input).toHaveValue('#ff0000')

    fireEvent.change(input, { target: { value: '#00ff00' } })
    expect(onChange).toHaveBeenCalledWith('bg', '#00ff00')
  })

  it('renders range editor with slider', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'opacity', type: 'range', defaultValue: 50, min: 0, max: 100, step: 10 }}
        value={50}
        onChange={onChange}
      />,
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
    expect(slider).toHaveAttribute('step', '10')

    fireEvent.change(slider, { target: { value: '70' } })
    expect(onChange).toHaveBeenCalledWith('opacity', 70)
  })

  it('displays description when provided', () => {
    render(
      <PropEditor
        propDef={{ name: 'x', type: 'string', defaultValue: '', description: 'A helpful tip' }}
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('A helpful tip')).toBeInTheDocument()
  })

  it('displays type badge in label', () => {
    render(
      <PropEditor
        propDef={{ name: 'x', type: 'number', defaultValue: 0 }}
        value={0}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('number')).toBeInTheDocument()
  })

  it('falls back to string editor for unknown type', () => {
    const onChange = vi.fn()
    render(
      <PropEditor
        propDef={{ name: 'x', type: 'unknown' as never, defaultValue: 'val' }}
        value="val"
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText(/x/i)
    expect(input).toHaveAttribute('type', 'text')
  })
})

// ===========================================================================
// 3. Playground component
// ===========================================================================

describe('Playground', () => {
  const defs: PropDef[] = [
    { name: 'label', type: 'string', defaultValue: 'Hello' },
    { name: 'bold', type: 'boolean', defaultValue: false },
  ]

  it('renders prop editors for each definition', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {(values) => <span>{String(values.label)}</span>}
      </Playground>,
    )

    expect(screen.getByLabelText(/label/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bold/i)).toBeInTheDocument()
  })

  it('renders live preview with current values', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {(values) => <span data-testid="preview">{String(values.label)}</span>}
      </Playground>,
    )

    expect(screen.getByTestId('preview')).toHaveTextContent('Hello')
  })

  it('updates preview when prop changes', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {(values) => <span data-testid="preview">{String(values.label)}</span>}
      </Playground>,
    )

    const input = screen.getByLabelText(/label/i)
    fireEvent.change(input, { target: { value: 'World' } })

    expect(screen.getByTestId('preview')).toHaveTextContent('World')
  })

  it('shows generated code section', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {() => <span />}
      </Playground>,
    )

    expect(screen.getByText('Generated Code')).toBeInTheDocument()
    expect(screen.getByText('<Tag />')).toBeInTheDocument()
  })

  it('updates generated code when props change', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {() => <span />}
      </Playground>,
    )

    const input = screen.getByLabelText(/label/i)
    fireEvent.change(input, { target: { value: 'New' } })

    expect(screen.getByText(/label="New"/)).toBeInTheDocument()
  })

  it('resets all props when reset button is clicked', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {(values) => <span data-testid="preview">{String(values.label)}</span>}
      </Playground>,
    )

    const input = screen.getByLabelText(/label/i)
    fireEvent.change(input, { target: { value: 'Changed' } })
    expect(screen.getByTestId('preview')).toHaveTextContent('Changed')

    const resetButton = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetButton)

    expect(screen.getByTestId('preview')).toHaveTextContent('Hello')
  })

  it('has a copy code button', () => {
    render(
      <Playground propDefs={defs} componentName="Tag">
        {() => <span />}
      </Playground>,
    )

    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument()
  })

  it('copies code to clipboard on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(
      <Playground propDefs={defs} componentName="Tag">
        {() => <span />}
      </Playground>,
    )

    const copyBtn = screen.getByRole('button', { name: /copy code/i })
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeText).toHaveBeenCalledWith('<Tag />')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Playground propDefs={defs} className="custom-class">
        {() => <span />}
      </Playground>,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('uses default component name when not provided', () => {
    render(
      <Playground propDefs={defs}>
        {() => <span />}
      </Playground>,
    )

    expect(screen.getByText('<Component />')).toBeInTheDocument()
  })
})
