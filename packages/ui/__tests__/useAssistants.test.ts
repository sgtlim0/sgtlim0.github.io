/**
 * Tests for useAssistants hook (packages/ui/src/user/hooks/useAssistants.ts)
 *
 * Covers:
 * - Initial state (activeTab, activeCategory, modal state)
 * - allAssistants = mockAssistants + customAssistants
 * - setActiveTab / setActiveCategory
 * - handleOpenCustomAssistantModal / closeCustomAssistantModal
 * - handleSaveCustomAssistant (create new + edit existing)
 * - getCustomAssistants / saveCustomAssistant integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock assistant service
const mockGetCustomAssistants = vi.fn(() => [])
const mockSaveCustomAssistant = vi.fn()

vi.mock('../src/user/services/assistantService', () => ({
  getCustomAssistants: (...args: unknown[]) => mockGetCustomAssistants(...args),
  saveCustomAssistant: (...args: unknown[]) => mockSaveCustomAssistant(...args),
}))

// Mock mockData to have predictable assistants
vi.mock('../src/user/services/mockData', () => ({
  mockAssistants: [
    {
      id: 'a1',
      name: 'Official Bot',
      icon: '🤖',
      iconColor: '#000',
      model: 'GPT-4o',
      description: 'Official assistant',
      category: '채팅',
      isOfficial: true,
    },
    {
      id: 'a2',
      name: 'Work Bot',
      icon: '📋',
      iconColor: '#111',
      model: '',
      description: 'Work assistant',
      category: '업무',
      isOfficial: true,
    },
  ],
}))

import { useAssistants } from '../src/user/hooks/useAssistants'

describe('useAssistants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCustomAssistants.mockReturnValue([])
  })

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useAssistants())

    expect(result.current.activeTab).toBe('official')
    expect(result.current.activeCategory).toBe('전체')
    expect(result.current.showCustomAssistantModal).toBe(false)
    expect(result.current.editingAssistant).toBeUndefined()
  })

  it('should include mockAssistants in allAssistants when no custom assistants', () => {
    const { result } = renderHook(() => useAssistants())

    expect(result.current.allAssistants).toHaveLength(2)
    expect(result.current.allAssistants[0].id).toBe('a1')
    expect(result.current.allAssistants[1].id).toBe('a2')
    expect(result.current.customAssistants).toHaveLength(0)
  })

  it('should load custom assistants on mount', () => {
    const customList = [
      {
        id: 'custom-1',
        name: 'My Bot',
        icon: '👤',
        iconColor: '#f00',
        model: 'GPT-3.5',
        description: 'Custom',
        category: '채팅' as const,
        isOfficial: false,
      },
    ]
    mockGetCustomAssistants.mockReturnValue(customList)

    const { result } = renderHook(() => useAssistants())

    // After useEffect, customAssistants should be loaded
    expect(result.current.customAssistants).toHaveLength(1)
    expect(result.current.customAssistants[0].name).toBe('My Bot')
    // allAssistants = 2 official + 1 custom
    expect(result.current.allAssistants).toHaveLength(3)
  })

  it('should change activeTab via setActiveTab', () => {
    const { result } = renderHook(() => useAssistants())

    act(() => {
      result.current.setActiveTab('custom')
    })

    expect(result.current.activeTab).toBe('custom')

    act(() => {
      result.current.setActiveTab('official')
    })

    expect(result.current.activeTab).toBe('official')
  })

  it('should change activeCategory via setActiveCategory', () => {
    const { result } = renderHook(() => useAssistants())

    act(() => {
      result.current.setActiveCategory('업무')
    })

    expect(result.current.activeCategory).toBe('업무')

    act(() => {
      result.current.setActiveCategory('번역')
    })

    expect(result.current.activeCategory).toBe('번역')
  })

  it('should open custom assistant modal and clear editingAssistant', () => {
    const { result } = renderHook(() => useAssistants())

    act(() => {
      result.current.handleOpenCustomAssistantModal()
    })

    expect(result.current.showCustomAssistantModal).toBe(true)
    expect(result.current.editingAssistant).toBeUndefined()
  })

  it('should close custom assistant modal and clear editingAssistant', () => {
    const { result } = renderHook(() => useAssistants())

    // Open first
    act(() => {
      result.current.handleOpenCustomAssistantModal()
    })

    expect(result.current.showCustomAssistantModal).toBe(true)

    // Close
    act(() => {
      result.current.closeCustomAssistantModal()
    })

    expect(result.current.showCustomAssistantModal).toBe(false)
    expect(result.current.editingAssistant).toBeUndefined()
  })

  it('should save a new custom assistant', () => {
    // After save, getCustomAssistants will return the newly saved assistant
    const savedAssistant = {
      id: 'new-id',
      name: 'New Bot',
      icon: '🆕',
      iconColor: '#0f0',
      model: 'Claude',
      description: 'Newly created',
      category: '글쓰기' as const,
      isOfficial: false,
    }
    mockGetCustomAssistants.mockReturnValueOnce([]).mockReturnValue([savedAssistant])

    const { result } = renderHook(() => useAssistants())

    // Open modal first
    act(() => {
      result.current.handleOpenCustomAssistantModal()
    })

    // Save assistant
    act(() => {
      result.current.handleSaveCustomAssistant({
        name: 'New Bot',
        icon: '🆕',
        iconColor: '#0f0',
        model: 'Claude',
        description: 'Newly created',
        category: '글쓰기',
      })
    })

    // saveCustomAssistant should have been called with an assistant object
    expect(mockSaveCustomAssistant).toHaveBeenCalledTimes(1)
    const savedArg = mockSaveCustomAssistant.mock.calls[0][0]
    expect(savedArg.name).toBe('New Bot')
    expect(savedArg.isOfficial).toBe(false)
    expect(savedArg.id).toBeDefined()

    // Modal should be closed after save
    expect(result.current.showCustomAssistantModal).toBe(false)
    expect(result.current.editingAssistant).toBeUndefined()
  })

  it('should refresh customAssistants after save', () => {
    const newCustom = {
      id: 'c1',
      name: 'Saved Bot',
      icon: '💾',
      iconColor: '#00f',
      model: 'GPT-4',
      description: 'Saved',
      category: '정리' as const,
      isOfficial: false,
    }
    // Initially no custom, after save returns one
    mockGetCustomAssistants.mockReturnValueOnce([]).mockReturnValue([newCustom])

    const { result } = renderHook(() => useAssistants())

    act(() => {
      result.current.handleSaveCustomAssistant({
        name: 'Saved Bot',
        icon: '💾',
        iconColor: '#00f',
        model: 'GPT-4',
        description: 'Saved',
        category: '정리',
      })
    })

    // allAssistants should now include the custom one
    expect(result.current.allAssistants).toHaveLength(3)
    expect(result.current.customAssistants).toHaveLength(1)
    expect(result.current.customAssistants[0].name).toBe('Saved Bot')
  })

  it('should generate an id for new assistant when no editingAssistant', () => {
    mockGetCustomAssistants.mockReturnValue([])

    const { result } = renderHook(() => useAssistants())

    act(() => {
      result.current.handleSaveCustomAssistant({
        name: 'Test',
        icon: '🧪',
        iconColor: '#999',
        model: 'Model',
        description: 'Test desc',
        category: '채팅',
      })
    })

    const savedArg = mockSaveCustomAssistant.mock.calls[0][0]
    // id should be a non-empty string (generated by generateId)
    expect(typeof savedArg.id).toBe('string')
    expect(savedArg.id.length).toBeGreaterThan(0)
  })

  it('should return all expected fields in the hook result', () => {
    const { result } = renderHook(() => useAssistants())

    const keys = Object.keys(result.current)
    expect(keys).toContain('allAssistants')
    expect(keys).toContain('customAssistants')
    expect(keys).toContain('activeTab')
    expect(keys).toContain('activeCategory')
    expect(keys).toContain('showCustomAssistantModal')
    expect(keys).toContain('editingAssistant')
    expect(keys).toContain('setActiveTab')
    expect(keys).toContain('setActiveCategory')
    expect(keys).toContain('handleSaveCustomAssistant')
    expect(keys).toContain('handleOpenCustomAssistantModal')
    expect(keys).toContain('closeCustomAssistantModal')
  })

  it('should support cycling through all category values', () => {
    const { result } = renderHook(() => useAssistants())
    const categories = ['전체', '채팅', '업무', '번역', '정리', '보고', '그림', '글쓰기'] as const

    for (const cat of categories) {
      act(() => {
        result.current.setActiveCategory(cat)
      })
      expect(result.current.activeCategory).toBe(cat)
    }
  })
})
