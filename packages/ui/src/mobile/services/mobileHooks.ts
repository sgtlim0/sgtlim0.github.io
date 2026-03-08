'use client'

import { useState, useMemo, useCallback, useEffect, type RefObject } from 'react'
import type { MobileTab, MobileChat, MobileAssistant, MobileSetting } from '../types'
import { useAsyncData } from '../../hooks/useAsyncData'
import * as svc from './mobileService'

export function useMobileTabs(initial: MobileTab = 'chat') {
  const [activeTab, setActiveTab] = useState<MobileTab>(initial)
  return { activeTab, setActiveTab } as const
}

export function useChatList() {
  const [chats, setChats] = useState<readonly MobileChat[]>([])
  const { data, loading, refetch } = useAsyncData(() => svc.getChatList())

  useEffect(() => {
    if (data) {
      setChats(data)
    }
  }, [data])

  const deleteChat = useCallback(async (id: string) => {
    await svc.deleteChat(id)
    setChats((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { chats, loading, deleteChat, refresh: refetch } as const
}

export function useAssistants() {
  const [assistants, setAssistants] = useState<readonly MobileAssistant[]>([])
  const { data, loading, refetch } = useAsyncData(() => svc.getAssistants())

  useEffect(() => {
    if (data) {
      setAssistants(data)
    }
  }, [data])

  const favorites = useMemo(() => assistants.filter((a) => a.isFavorite), [assistants])

  const toggleFavorite = useCallback(async (id: string) => {
    await svc.toggleFavorite(id)
    setAssistants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)),
    )
  }, [])

  return { assistants, favorites, loading, toggleFavorite, refresh: refetch } as const
}

export function useMobileSettings() {
  const [settings, setSettings] = useState<readonly MobileSetting[]>([])
  const { data, loading, refetch } = useAsyncData(() => svc.getSettings())

  useEffect(() => {
    if (data) {
      setSettings(data)
    }
  }, [data])

  const grouped = useMemo(() => {
    const groups: Record<MobileSetting['section'], MobileSetting[]> = {
      general: [],
      notification: [],
      privacy: [],
      about: [],
    }
    for (const s of settings) {
      groups[s.section].push(s)
    }
    return groups
  }, [settings])

  const updateSetting = useCallback(async (id: string, value: boolean | string) => {
    await svc.updateSetting(id, value)
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)))
  }, [])

  return { settings, grouped, loading, updateSetting, refresh: refetch } as const
}

interface SwipeGestureOptions {
  readonly onSwipeLeft?: () => void
  readonly onSwipeRight?: () => void
  readonly threshold?: number
}

export function useSwipeGesture(ref: RefObject<HTMLElement | null>, options: SwipeGestureOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0

    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
    }

    function handleTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return

      if (dx < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, onSwipeLeft, onSwipeRight, threshold])
}
