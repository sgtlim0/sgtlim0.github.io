/**
 * Feature Flag 서비스
 * localStorage 기반 런타임 기능 토글 시스템
 */

export interface FeatureFlag {
  key: string
  enabled: boolean
  description: string
}

const STORAGE_KEY = 'hchat_feature_flags'

const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  'chat.streaming': { key: 'chat.streaming', enabled: true, description: 'SSE streaming' },
  'roi.simulator': { key: 'roi.simulator', enabled: true, description: 'ROI simulator' },
  'desktop.swarm': { key: 'desktop.swarm', enabled: false, description: 'Swarm mode' },
  'user.research': { key: 'user.research', enabled: true, description: 'Deep research' },
}

function loadFlags(): Record<string, FeatureFlag> {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_FLAGS }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { ...DEFAULT_FLAGS }
    }

    const parsed = JSON.parse(stored) as Record<string, boolean>
    const flags = { ...DEFAULT_FLAGS }

    for (const [key, enabled] of Object.entries(parsed)) {
      if (key in flags) {
        flags[key] = { ...flags[key], enabled }
      }
    }

    return flags
  } catch {
    return { ...DEFAULT_FLAGS }
  }
}

function saveFlags(flags: Record<string, FeatureFlag>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const serialized: Record<string, boolean> = {}
    for (const [key, flag] of Object.entries(flags)) {
      serialized[key] = flag.enabled
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

let cachedFlags: Record<string, FeatureFlag> | null = null
let listeners: Array<() => void> = []

function getFlags(): Record<string, FeatureFlag> {
  if (cachedFlags === null) {
    cachedFlags = loadFlags()
  }
  return cachedFlags
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function isFeatureEnabled(key: string): boolean {
  const flags = getFlags()
  const flag = flags[key]
  return flag ? flag.enabled : false
}

export function getFeatureFlags(): FeatureFlag[] {
  const flags = getFlags()
  return Object.values(flags)
}

export function setFeatureFlag(key: string, enabled: boolean): void {
  const flags = getFlags()
  const existing = flags[key]

  if (!existing) {
    return
  }

  const updatedFlags = {
    ...flags,
    [key]: { ...existing, enabled },
  }

  cachedFlags = updatedFlags
  saveFlags(updatedFlags)
  notifyListeners()
}

export function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getSnapshot(): Record<string, boolean> {
  const flags = getFlags()
  const snapshot: Record<string, boolean> = {}
  for (const [key, flag] of Object.entries(flags)) {
    snapshot[key] = flag.enabled
  }
  return snapshot
}

export function getServerSnapshot(): Record<string, boolean> {
  const snapshot: Record<string, boolean> = {}
  for (const [key, flag] of Object.entries(DEFAULT_FLAGS)) {
    snapshot[key] = flag.enabled
  }
  return snapshot
}

/** 테스트 전용: 캐시 초기화 */
export function resetFlags(): void {
  cachedFlags = null
  listeners = []
}
