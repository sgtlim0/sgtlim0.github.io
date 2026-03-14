import { useState, useEffect, useCallback } from 'react'
import type { ExtensionSettings } from '../../types/settings'
import { DEFAULT_SETTINGS } from '../../types/settings'
import { getSettings, setSettings as saveSettings } from '../../utils/storage'

export interface UseExtensionSettingsReturn {
  settings: ExtensionSettings
  isLoading: boolean
  error: Error | null
  updateSettings: (partial: Partial<ExtensionSettings>) => Promise<void>
}

export function useExtensionSettings(): UseExtensionSettingsReturn {
  const [settings, setLocalSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const loaded = await getSettings()
        setLocalSettings(loaded)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load settings'))
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()

    // Listen for storage changes
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === 'local' && changes.hchat_settings) {
        const newSettings = changes.hchat_settings.newValue as ExtensionSettings
        if (newSettings) {
          setLocalSettings(newSettings)
        }
      }
    }

    if (typeof chrome !== 'undefined' && chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange)
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange)
      }
    }
  }, [])

  const updateSettings = useCallback(async (partial: Partial<ExtensionSettings>) => {
    try {
      setError(null)
      const updated = await saveSettings(partial)
      setLocalSettings(updated)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update settings')
      setError(error)
      throw error
    }
  }, [])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  }
}
