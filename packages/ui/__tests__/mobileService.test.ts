import { describe, it, expect } from 'vitest'
import {
  getChatList,
  getAssistants,
  getSettings,
  toggleFavorite,
  deleteChat,
  updateSetting,
} from '../src/mobile/services/mobileService'

describe('getChatList', () => {
  it('returns an array of chats', async () => {
    const chats = await getChatList()
    expect(Array.isArray(chats)).toBe(true)
    expect(chats.length).toBeGreaterThan(0)
    expect(chats[0]).toHaveProperty('id')
    expect(chats[0]).toHaveProperty('title')
    expect(chats[0]).toHaveProperty('model')
  })
})

describe('getAssistants', () => {
  it('returns an array of assistants', async () => {
    const assistants = await getAssistants()
    expect(Array.isArray(assistants)).toBe(true)
    expect(assistants.length).toBeGreaterThan(0)
    expect(assistants[0]).toHaveProperty('id')
    expect(assistants[0]).toHaveProperty('name')
    expect(assistants[0]).toHaveProperty('category')
  })
})

describe('getSettings', () => {
  it('returns settings with sections', async () => {
    const settings = await getSettings()
    expect(Array.isArray(settings)).toBe(true)
    expect(settings.length).toBeGreaterThan(0)
    expect(settings[0]).toHaveProperty('section')
    expect(settings[0]).toHaveProperty('type')
  })

  it('contains multiple sections', async () => {
    const settings = await getSettings()
    const sections = new Set(settings.map((s) => s.section))
    expect(sections.size).toBeGreaterThanOrEqual(2)
  })
})

describe('toggleFavorite', () => {
  it('toggles favorite status', async () => {
    const before = await getAssistants()
    const target = before[0]
    const wasFavorite = target.isFavorite
    await toggleFavorite(target.id)
    const after = await getAssistants()
    const updated = after.find((a) => a.id === target.id)
    expect(updated?.isFavorite).toBe(!wasFavorite)
    // Toggle back
    await toggleFavorite(target.id)
  })
})

describe('deleteChat', () => {
  it('removes a chat from the list', async () => {
    const before = await getChatList()
    const countBefore = before.length
    const lastChat = before[before.length - 1]
    await deleteChat(lastChat.id)
    const after = await getChatList()
    expect(after.length).toBe(countBefore - 1)
    expect(after.find((c) => c.id === lastChat.id)).toBeUndefined()
  })
})

describe('updateSetting', () => {
  it('updates a setting value', async () => {
    const settings = await getSettings()
    const toggleSetting = settings.find((s) => s.type === 'toggle')
    if (!toggleSetting) return
    const originalValue = toggleSetting.value
    await updateSetting(toggleSetting.id, !originalValue)
    const updated = await getSettings()
    const changed = updated.find((s) => s.id === toggleSetting.id)
    expect(changed?.value).toBe(!originalValue)
    // Revert
    await updateSetting(toggleSetting.id, originalValue as boolean)
  })
})
