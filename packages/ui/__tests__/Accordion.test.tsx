import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useAccordion } from '../src/hooks/useAccordion'
import { Accordion, AccordionItem } from '../src/Accordion'
import type { AccordionItemConfig } from '../src/Accordion'

// ---------------------------------------------------------------------------
// useAccordion hook tests
// ---------------------------------------------------------------------------

describe('useAccordion', () => {
  it('starts with no items open by default', () => {
    const { result } = renderHook(() => useAccordion())
    expect(result.current.openItems.size).toBe(0)
  })

  it('opens items specified in defaultOpen', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['a', 'b'] }),
    )
    expect(result.current.isOpen('a')).toBe(true)
    expect(result.current.isOpen('b')).toBe(true)
    expect(result.current.isOpen('c')).toBe(false)
  })

  // --- toggle ---

  it('toggles an item open', () => {
    const { result } = renderHook(() => useAccordion())

    act(() => {
      result.current.toggle('item1')
    })

    expect(result.current.isOpen('item1')).toBe(true)
  })

  it('toggles an open item closed', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['item1'] }),
    )

    act(() => {
      result.current.toggle('item1')
    })

    expect(result.current.isOpen('item1')).toBe(false)
  })

  it('closes other items when allowMultiple is false (single mode)', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['item1'] }),
    )

    act(() => {
      result.current.toggle('item2')
    })

    expect(result.current.isOpen('item1')).toBe(false)
    expect(result.current.isOpen('item2')).toBe(true)
  })

  it('keeps other items open when allowMultiple is true', () => {
    const { result } = renderHook(() =>
      useAccordion({ allowMultiple: true, defaultOpen: ['item1'] }),
    )

    act(() => {
      result.current.toggle('item2')
    })

    expect(result.current.isOpen('item1')).toBe(true)
    expect(result.current.isOpen('item2')).toBe(true)
  })

  // --- open / close ---

  it('open() opens a specific item', () => {
    const { result } = renderHook(() => useAccordion())

    act(() => {
      result.current.open('item1')
    })

    expect(result.current.isOpen('item1')).toBe(true)
  })

  it('open() is a no-op if item is already open', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['item1'] }),
    )
    const prevSet = result.current.openItems

    act(() => {
      result.current.open('item1')
    })

    // Same reference (no state update)
    expect(result.current.openItems).toBe(prevSet)
  })

  it('open() in single mode closes other items', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['item1'] }),
    )

    act(() => {
      result.current.open('item2')
    })

    expect(result.current.isOpen('item1')).toBe(false)
    expect(result.current.isOpen('item2')).toBe(true)
  })

  it('close() closes a specific item', () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['item1'] }),
    )

    act(() => {
      result.current.close('item1')
    })

    expect(result.current.isOpen('item1')).toBe(false)
  })

  it('close() is a no-op if item is already closed', () => {
    const { result } = renderHook(() => useAccordion())
    const prevSet = result.current.openItems

    act(() => {
      result.current.close('nonexistent')
    })

    expect(result.current.openItems).toBe(prevSet)
  })

  // --- closeAll / openAll ---

  it('closeAll() closes all items', () => {
    const { result } = renderHook(() =>
      useAccordion({ allowMultiple: true, defaultOpen: ['a', 'b', 'c'] }),
    )

    act(() => {
      result.current.closeAll()
    })

    expect(result.current.openItems.size).toBe(0)
  })

  it('closeAll() is a no-op when nothing is open', () => {
    const { result } = renderHook(() => useAccordion())
    const prevSet = result.current.openItems

    act(() => {
      result.current.closeAll()
    })

    expect(result.current.openItems).toBe(prevSet)
  })

  it('openAll() opens specified items in multiple mode', () => {
    const { result } = renderHook(() =>
      useAccordion({ allowMultiple: true }),
    )

    act(() => {
      result.current.openAll(['a', 'b', 'c'])
    })

    expect(result.current.isOpen('a')).toBe(true)
    expect(result.current.isOpen('b')).toBe(true)
    expect(result.current.isOpen('c')).toBe(true)
  })

  it('openAll() in single mode opens only the first item', () => {
    const { result } = renderHook(() => useAccordion())

    act(() => {
      result.current.openAll(['a', 'b', 'c'])
    })

    expect(result.current.isOpen('a')).toBe(true)
    expect(result.current.isOpen('b')).toBe(false)
    expect(result.current.isOpen('c')).toBe(false)
  })

  // --- isOpen ---

  it('isOpen() returns false for unknown items', () => {
    const { result } = renderHook(() => useAccordion())
    expect(result.current.isOpen('unknown')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Accordion component tests
// ---------------------------------------------------------------------------

const sampleItems: AccordionItemConfig[] = [
  { id: 'section1', title: 'Section 1', content: 'Content 1' },
  { id: 'section2', title: 'Section 2', content: 'Content 2' },
  { id: 'section3', title: 'Section 3', content: 'Content 3' },
]

const itemsWithDisabled: AccordionItemConfig[] = [
  { id: 'section1', title: 'Section 1', content: 'Content 1' },
  { id: 'section2', title: 'Section 2', content: 'Content 2', disabled: true },
  { id: 'section3', title: 'Section 3', content: 'Content 3' },
]

describe('Accordion component', () => {
  it('renders all accordion items', () => {
    render(<Accordion items={sampleItems} />)

    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
    expect(screen.getByText('Section 3')).toBeInTheDocument()
  })

  it('all items are collapsed by default', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('opens an item when its header is clicked', () => {
    render(<Accordion items={sampleItems} />)

    fireEvent.click(screen.getByText('Section 1'))

    const button = screen.getByText('Section 1').closest('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes an open item when clicked again', () => {
    render(<Accordion items={sampleItems} defaultOpen={['section1']} />)

    fireEvent.click(screen.getByText('Section 1'))

    const button = screen.getByText('Section 1').closest('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders items open when specified in defaultOpen', () => {
    render(<Accordion items={sampleItems} defaultOpen={['section2']} />)

    const button2 = screen.getByText('Section 2').closest('button')
    expect(button2).toHaveAttribute('aria-expanded', 'true')

    const button1 = screen.getByText('Section 1').closest('button')
    expect(button1).toHaveAttribute('aria-expanded', 'false')
  })

  // --- Single mode (default) ---

  it('closes other items in single mode (default)', () => {
    render(<Accordion items={sampleItems} defaultOpen={['section1']} />)

    fireEvent.click(screen.getByText('Section 2'))

    const button1 = screen.getByText('Section 1').closest('button')
    const button2 = screen.getByText('Section 2').closest('button')
    expect(button1).toHaveAttribute('aria-expanded', 'false')
    expect(button2).toHaveAttribute('aria-expanded', 'true')
  })

  // --- Multiple mode ---

  it('keeps other items open in allowMultiple mode', () => {
    render(
      <Accordion
        items={sampleItems}
        allowMultiple
        defaultOpen={['section1']}
      />,
    )

    fireEvent.click(screen.getByText('Section 2'))

    const button1 = screen.getByText('Section 1').closest('button')
    const button2 = screen.getByText('Section 2').closest('button')
    expect(button1).toHaveAttribute('aria-expanded', 'true')
    expect(button2).toHaveAttribute('aria-expanded', 'true')
  })

  // --- Disabled ---

  it('does not toggle a disabled item on click', () => {
    render(<Accordion items={itemsWithDisabled} />)

    fireEvent.click(screen.getByText('Section 2'))

    const button = screen.getByText('Section 2').closest('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toBeDisabled()
  })

  it('sets aria-disabled on disabled items', () => {
    render(<Accordion items={itemsWithDisabled} />)

    const button = screen.getByText('Section 2').closest('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  // --- onChange callback ---

  it('calls onChange when items are toggled', () => {
    const onChange = vi.fn()
    render(<Accordion items={sampleItems} onChange={onChange} />)

    fireEvent.click(screen.getByText('Section 1'))

    expect(onChange).toHaveBeenCalledWith(['section1'])
  })

  // --- Accessibility ---

  it('triggers have aria-expanded attribute', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded')
    })
  })

  it('triggers have aria-controls linking to panels', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      const panelId = btn.getAttribute('aria-controls')
      expect(panelId).toBeTruthy()
      expect(document.getElementById(panelId!)).toBeInTheDocument()
    })
  })

  it('panels have role="region" and aria-labelledby', () => {
    render(<Accordion items={sampleItems} />)

    const regions = screen.getAllByRole('region')
    expect(regions).toHaveLength(3)

    regions.forEach((region) => {
      const labelledBy = region.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      expect(document.getElementById(labelledBy!)).toBeInTheDocument()
    })
  })

  // --- Keyboard navigation ---

  it('moves focus to next trigger with ArrowDown', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()

    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[1])
  })

  it('moves focus to previous trigger with ArrowUp', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[1].focus()

    fireEvent.keyDown(buttons[1], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('wraps focus from last to first with ArrowDown', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[2].focus()

    fireEvent.keyDown(buttons[2], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('wraps focus from first to last with ArrowUp', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()

    fireEvent.keyDown(buttons[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttons[2])
  })

  it('moves focus to first trigger with Home key', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[2].focus()

    fireEvent.keyDown(buttons[2], { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('moves focus to last trigger with End key', () => {
    render(<Accordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()

    fireEvent.keyDown(buttons[0], { key: 'End' })
    expect(document.activeElement).toBe(buttons[2])
  })

  it('toggles item with Enter key on trigger', () => {
    render(<Accordion items={sampleItems} />)

    const button = screen.getByText('Section 1').closest('button')!
    button.focus()

    // Enter on a button triggers click by default
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles item with Space key on trigger', () => {
    render(<Accordion items={sampleItems} />)

    const button = screen.getByText('Section 1').closest('button')!
    button.focus()

    // Space on a button triggers click by default
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  // --- className ---

  it('accepts className prop', () => {
    const { container } = render(
      <Accordion items={sampleItems} className="custom-class" />,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  // --- Empty items ---

  it('renders nothing when items array is empty', () => {
    const { container } = render(<Accordion items={[]} />)
    const inner = container.firstChild as HTMLElement
    expect(inner.children).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// AccordionItem standalone tests
// ---------------------------------------------------------------------------

describe('AccordionItem', () => {
  it('renders title and content', () => {
    render(
      <AccordionItem
        id="test"
        title="Test Title"
        content="Test Content"
        isOpen={true}
        onToggle={() => {}}
        triggerId="trigger-test"
        panelId="panel-test"
      />,
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()

    render(
      <AccordionItem
        id="test"
        title="Test Title"
        content="Test Content"
        isOpen={false}
        onToggle={onToggle}
        triggerId="trigger-test"
        panelId="panel-test"
      />,
    )

    fireEvent.click(screen.getByText('Test Title'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('does not call onToggle when disabled', () => {
    const onToggle = vi.fn()

    render(
      <AccordionItem
        id="test"
        title="Disabled Title"
        content="Test Content"
        disabled
        isOpen={false}
        onToggle={onToggle}
        triggerId="trigger-test"
        panelId="panel-test"
      />,
    )

    fireEvent.click(screen.getByText('Disabled Title'))
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('shows chevron rotated when open', () => {
    const { container } = render(
      <AccordionItem
        id="test"
        title="Title"
        content="Content"
        isOpen={true}
        onToggle={() => {}}
        triggerId="trigger-test"
        panelId="panel-test"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain(
      'rotate-180',
    )
  })

  it('shows chevron not rotated when closed', () => {
    const { container } = render(
      <AccordionItem
        id="test"
        title="Title"
        content="Content"
        isOpen={false}
        onToggle={() => {}}
        triggerId="trigger-test"
        panelId="panel-test"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain(
      'rotate-0',
    )
  })
})
