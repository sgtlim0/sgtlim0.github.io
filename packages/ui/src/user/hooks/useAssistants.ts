'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Assistant, AssistantCategory } from '../services/types'
import { mockAssistants } from '../services/mockData'
import { getCustomAssistants, saveCustomAssistant } from '../services/assistantService'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseAssistantsReturn {
  allAssistants: Assistant[]
  customAssistants: Assistant[]
  activeTab: 'official' | 'custom'
  activeCategory: AssistantCategory
  showCustomAssistantModal: boolean
  editingAssistant: Assistant | undefined
  setActiveTab: (tab: 'official' | 'custom') => void
  setActiveCategory: (category: AssistantCategory) => void
  handleSaveCustomAssistant: (data: Omit<Assistant, 'id' | 'isOfficial'>) => void
  handleOpenCustomAssistantModal: () => void
  closeCustomAssistantModal: () => void
}

export function useAssistants(): UseAssistantsReturn {
  const [customAssistants, setCustomAssistants] = useState<Assistant[]>([])
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official')
  const [activeCategory, setActiveCategory] = useState<AssistantCategory>('전체')
  const [showCustomAssistantModal, setShowCustomAssistantModal] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<Assistant | undefined>()

  useEffect(() => {
    setCustomAssistants(getCustomAssistants())
  }, [])

  const allAssistants = useMemo(
    () => [...mockAssistants, ...customAssistants],
    [customAssistants],
  )

  const handleSaveCustomAssistant = useCallback(
    (assistantData: Omit<Assistant, 'id' | 'isOfficial'>) => {
      const assistant: Assistant = {
        ...assistantData,
        id: editingAssistant?.id || generateId(),
        isOfficial: false,
      }
      saveCustomAssistant(assistant)
      setCustomAssistants(getCustomAssistants())
      setShowCustomAssistantModal(false)
      setEditingAssistant(undefined)
    },
    [editingAssistant],
  )

  const handleOpenCustomAssistantModal = useCallback(() => {
    setEditingAssistant(undefined)
    setShowCustomAssistantModal(true)
  }, [])

  const closeCustomAssistantModal = useCallback(() => {
    setShowCustomAssistantModal(false)
    setEditingAssistant(undefined)
  }, [])

  return {
    allAssistants,
    customAssistants,
    activeTab,
    activeCategory,
    showCustomAssistantModal,
    editingAssistant,
    setActiveTab,
    setActiveCategory,
    handleSaveCustomAssistant,
    handleOpenCustomAssistantModal,
    closeCustomAssistantModal,
  }
}
