import type { PageContext } from '../types/context'
import type { ExtensionSettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

const KEYS = {
  CONTEXT: 'hchat_context',
  SETTINGS: 'hchat_settings',
  CONVERSATIONS: 'hchat_conversations',
} as const

function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local
}

export async function getStoredContext(): Promise<PageContext | null> {
  if (!isChromeExtension()) return null
  const result = await chrome.storage.local.get(KEYS.CONTEXT)
  const ctx = result[KEYS.CONTEXT]
  return ctx ? (ctx as PageContext) : null
}

export async function setStoredContext(ctx: PageContext): Promise<void> {
  if (!isChromeExtension()) return
  await chrome.storage.local.set({ [KEYS.CONTEXT]: ctx })
}

export async function clearStoredContext(): Promise<void> {
  if (!isChromeExtension()) return
  await chrome.storage.local.remove(KEYS.CONTEXT)
}

export async function getSettings(): Promise<ExtensionSettings> {
  if (!isChromeExtension()) return DEFAULT_SETTINGS
  const result = await chrome.storage.local.get(KEYS.SETTINGS)
  const stored = result[KEYS.SETTINGS] as Partial<ExtensionSettings> | undefined
  return { ...DEFAULT_SETTINGS, ...(stored || {}) }
}

export async function setSettings(partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings()
  const updated = { ...current, ...partial }
  if (isChromeExtension()) {
    await chrome.storage.local.set({ [KEYS.SETTINGS]: updated })
  }
  return updated
}
