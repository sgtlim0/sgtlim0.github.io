import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSettings } from '../src/hooks/useSettings'
import { SettingsPanel } from '../src/SettingsPanel'
import type { SettingField, UseSettingsReturn } from '../src/hooks/useSettings'

// ---------------------------------------------------------------------------
// useSettings hook tests
// ---------------------------------------------------------------------------

const sampleFields: readonly SettingField[] = [
  { key: 'siteName', label: 'Site Name', type: 'text', value: 'My Site', category: 'General' },
  { key: 'maxItems', label: 'Max Items', type: 'number', value: 10, min: 1, max: 100, category: 'General' },
  { key: 'darkMode', label: 'Dark Mode', type: 'boolean', value: false, category: 'Appearance' },
  {
    key: 'lang',
    label: 'Language',
    type: 'select',
    value: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'ko', label: 'Korean' },
    ],
    category: 'General',
  },
  { key: 'primary', label: 'Primary Color', type: 'color', value: '#3b82f6', category: 'Appearance' },
  {
    key: 'volume',
    label: 'Volume',
    type: 'range',
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: 'Audio volume level',
    category: 'Appearance',
  },
] as const

describe('useSettings', () => {
  it('initializes values from fields', () => {
    const { result } = renderHook(() => useSettings(sampleFields))
    expect(result.current.values).toEqual({
      siteName: 'My Site',
      maxItems: 10,
      darkMode: false,
      lang: 'en',
      primary: '#3b82f6',
      volume: 50,
    })
  })

  it('starts clean (isDirty = false, dirtyKeys empty)', () => {
    const { result } = renderHook(() => useSettings(sampleFields))
    expect(result.current.isDirty).toBe(false)
    expect(result.current.dirtyKeys).toEqual([])
  })

  it('sets a single value immutably', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('siteName', 'New Site')
    })

    expect(result.current.values.siteName).toBe('New Site')
    expect(result.current.isDirty).toBe(true)
    expect(result.current.dirtyKeys).toEqual(['siteName'])
  })

  it('tracks multiple dirty keys', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('siteName', 'Changed')
      result.current.setValue('maxItems', 20)
    })

    expect(result.current.dirtyKeys).toContain('siteName')
    expect(result.current.dirtyKeys).toContain('maxItems')
    expect(result.current.dirtyKeys).toHaveLength(2)
  })

  it('removes key from dirtyKeys when value reverts to original', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('siteName', 'Changed')
    })
    expect(result.current.dirtyKeys).toContain('siteName')

    act(() => {
      result.current.setValue('siteName', 'My Site')
    })
    expect(result.current.dirtyKeys).not.toContain('siteName')
    expect(result.current.isDirty).toBe(false)
  })

  it('resets all values to initial', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('siteName', 'Changed')
      result.current.setValue('maxItems', 99)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.values.siteName).toBe('My Site')
    expect(result.current.values.maxItems).toBe(10)
    expect(result.current.isDirty).toBe(false)
    expect(result.current.dirtyKeys).toEqual([])
  })

  it('getField returns the field definition', () => {
    const { result } = renderHook(() => useSettings(sampleFields))
    const field = result.current.getField('lang')
    expect(field).toBeDefined()
    expect(field?.type).toBe('select')
    expect(field?.options).toHaveLength(2)
  })

  it('getField returns undefined for unknown key', () => {
    const { result } = renderHook(() => useSettings(sampleFields))
    expect(result.current.getField('unknown')).toBeUndefined()
  })

  it('save returns current values snapshot', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('siteName', 'Saved Site')
    })

    let saved: Record<string, unknown> = {}
    act(() => {
      saved = result.current.save()
    })

    expect(saved.siteName).toBe('Saved Site')
    expect(saved.maxItems).toBe(10)
    // After save, isDirty resets
    expect(result.current.isDirty).toBe(false)
    expect(result.current.dirtyKeys).toEqual([])
  })

  it('ignores setValue for unknown key', () => {
    const { result } = renderHook(() => useSettings(sampleFields))

    act(() => {
      result.current.setValue('nonExistent', 'value')
    })

    expect(result.current.values).not.toHaveProperty('nonExistent')
    expect(result.current.isDirty).toBe(false)
  })

  it('works with empty fields array', () => {
    const { result } = renderHook(() => useSettings([]))
    expect(result.current.values).toEqual({})
    expect(result.current.isDirty).toBe(false)

    let saved: Record<string, unknown> = {}
    act(() => {
      saved = result.current.save()
    })
    expect(saved).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// SettingsPanel component tests
// ---------------------------------------------------------------------------

describe('SettingsPanel', () => {
  it('renders all field labels', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)

    expect(screen.getByText('Site Name')).toBeInTheDocument()
    expect(screen.getByText('Max Items')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Primary Color')).toBeInTheDocument()
    expect(screen.getByText('Volume')).toBeInTheDocument()
  })

  it('groups fields by category', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    expect(screen.getByText('Audio volume level')).toBeInTheDocument()
  })

  it('renders text input with correct initial value', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Site Name') as HTMLInputElement
    expect(input.value).toBe('My Site')
  })

  it('renders number input with correct initial value', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Max Items') as HTMLInputElement
    expect(input.type).toBe('number')
    expect(input.value).toBe('10')
  })

  it('renders checkbox for boolean type', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const checkbox = screen.getByLabelText('Dark Mode') as HTMLInputElement
    expect(checkbox.type).toBe('checkbox')
    expect(checkbox.checked).toBe(false)
  })

  it('renders select with options', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const select = screen.getByLabelText('Language') as HTMLSelectElement
    expect(select.value).toBe('en')
    expect(select.options).toHaveLength(2)
  })

  it('renders color input', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Primary Color') as HTMLInputElement
    expect(input.type).toBe('color')
    expect(input.value).toBe('#3b82f6')
  })

  it('renders range input with min/max/step', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Volume') as HTMLInputElement
    expect(input.type).toBe('range')
    expect(input.min).toBe('0')
    expect(input.max).toBe('100')
    expect(input.step).toBe('5')
  })

  it('updates value on text input change', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Site Name') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'Updated' } })
    expect(input.value).toBe('Updated')
  })

  it('updates value on checkbox change', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const checkbox = screen.getByLabelText('Dark Mode') as HTMLInputElement

    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('updates value on select change', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const select = screen.getByLabelText('Language') as HTMLSelectElement

    fireEvent.change(select, { target: { value: 'ko' } })
    expect(select.value).toBe('ko')
  })

  it('highlights dirty fields', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Site Name') as HTMLInputElement

    // Before change — no dirty indicator
    expect(screen.queryByTestId('dirty-siteName')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Changed' } })

    // After change — dirty indicator visible
    expect(screen.getByTestId('dirty-siteName')).toBeInTheDocument()
  })

  it('calls onSave with current values', () => {
    const onSave = vi.fn()
    render(<SettingsPanel fields={sampleFields} onSave={onSave} />)

    const input = screen.getByLabelText('Site Name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Saved' } })

    const saveBtn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveBtn)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ siteName: 'Saved' }),
    )
  })

  it('resets values on reset button click', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)

    const input = screen.getByLabelText('Site Name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Changed' } })
    expect(input.value).toBe('Changed')

    const resetBtn = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetBtn)

    expect(input.value).toBe('My Site')
  })

  it('disables save button when not dirty', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn).toBeDisabled()
  })

  it('enables save button when dirty', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)

    const input = screen.getByLabelText('Site Name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Changed' } })

    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn).not.toBeDisabled()
  })

  it('disables reset button when not dirty', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const resetBtn = screen.getByRole('button', { name: /reset/i })
    expect(resetBtn).toBeDisabled()
  })

  it('associates labels with inputs via htmlFor/id', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)

    // getByLabelText already verifies label-input association
    expect(screen.getByLabelText('Site Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Max Items')).toBeInTheDocument()
    expect(screen.getByLabelText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
    expect(screen.getByLabelText('Primary Color')).toBeInTheDocument()
    expect(screen.getByLabelText('Volume')).toBeInTheDocument()
  })

  it('renders fields without category under "Other"', () => {
    const fieldsNoCategory: SettingField[] = [
      { key: 'name', label: 'Name', type: 'text', value: 'test' },
    ]
    render(<SettingsPanel fields={fieldsNoCategory} onSave={vi.fn()} />)
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(
      <SettingsPanel fields={sampleFields} onSave={vi.fn()} className="custom-panel" />,
    )
    expect(container.firstChild).toHaveClass('custom-panel')
  })
})

// ---------------------------------------------------------------------------
// SettingRow (internal) — tested via SettingsPanel
// ---------------------------------------------------------------------------

describe('SettingRow rendering via SettingsPanel', () => {
  it('renders number input change correctly', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Max Items') as HTMLInputElement

    fireEvent.change(input, { target: { value: '42' } })
    expect(input.value).toBe('42')
  })

  it('renders range input change correctly', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Volume') as HTMLInputElement

    fireEvent.change(input, { target: { value: '75' } })
    expect(input.value).toBe('75')
  })

  it('renders color input change correctly', () => {
    render(<SettingsPanel fields={sampleFields} onSave={vi.fn()} />)
    const input = screen.getByLabelText('Primary Color') as HTMLInputElement

    fireEvent.change(input, { target: { value: '#ff0000' } })
    expect(input.value).toBe('#ff0000')
  })
})
