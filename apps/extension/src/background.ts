import type { ExtensionMessage, ExtensionResponse } from './types/messages'
import type { PageContext, AnalysisMode } from './types/context'

const STORAGE_KEY = 'hchat_context'
const PENDING_MODE_KEY = 'hchat_pending_mode'
const CONTEXT_TTL = 5 * 60 * 1000 // 5 minutes

interface StoredContext {
  context: PageContext
  expiresAt: number
}

/* ------------------------------------------------------------------ */
/*  Context Menu Setup                                                */
/* ------------------------------------------------------------------ */

chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: 'hchat-parent',
    title: 'H Chat',
    contexts: ['selection', 'page'],
  })

  // Mode children
  const modes: Array<{ id: string; title: string; mode: AnalysisMode }> = [
    { id: 'hchat-summarize', title: '요약', mode: 'summarize' },
    { id: 'hchat-explain', title: '설명', mode: 'explain' },
    { id: 'hchat-research', title: '리서치', mode: 'research' },
    { id: 'hchat-translate', title: '번역', mode: 'translate' },
  ]

  modes.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id,
      parentId: 'hchat-parent',
      title,
      contexts: ['selection', 'page'],
    })
  })

  // Separator
  chrome.contextMenus.create({
    id: 'hchat-separator',
    parentId: 'hchat-parent',
    type: 'separator',
    contexts: ['selection', 'page'],
  })

  // Side panel option
  chrome.contextMenus.create({
    id: 'hchat-sidepanel',
    parentId: 'hchat-parent',
    title: 'Open in Side Panel',
    contexts: ['selection', 'page'],
  })
})

/* ------------------------------------------------------------------ */
/*  Context Menu Click Handler                                        */
/* ------------------------------------------------------------------ */

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  const menuId = String(info.menuItemId)

  if (menuId === 'hchat-sidepanel') {
    await chrome.sidePanel.open({ tabId: tab.id })
    return
  }

  // Extract mode from menu ID
  const modeMatch = menuId.match(/^hchat-(.+)$/)
  if (!modeMatch) return

  const mode = modeMatch[1] as AnalysisMode

  try {
    // Request text extraction from content script
    const message: ExtensionMessage<void> = { action: 'EXTRACT_TEXT' }
    const response = await chrome.tabs.sendMessage<
      ExtensionMessage<void>,
      ExtensionResponse<PageContext>
    >(tab.id, message)

    if (!response.success || !response.data) {
      console.error('[H Chat Background] Extract failed:', response.error)
      return
    }

    // Store context with TTL
    const stored: StoredContext = {
      context: response.data,
      expiresAt: Date.now() + CONTEXT_TTL,
    }

    await chrome.storage.local.set({
      [STORAGE_KEY]: stored,
      [PENDING_MODE_KEY]: mode,
    })

    // Open popup
    await chrome.action.openPopup()
  } catch (error) {
    console.error('[H Chat Background] Context menu handler error:', error)
  }
})

/* ------------------------------------------------------------------ */
/*  Message Handlers                                                  */
/* ------------------------------------------------------------------ */

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void,
  ) => {
    const { action } = message

    if (action === 'SET_CONTEXT') {
      handleSetContext(message.payload as PageContext)
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
        )
      return true
    }

    if (action === 'CLEAR_CONTEXT') {
      handleClearContext()
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
        )
      return true
    }

    if (action === 'OPEN_SIDEPANEL') {
      handleOpenSidepanel(message.payload as number | undefined)
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
        )
      return true
    }

    return false
  },
)

async function handleSetContext(context: PageContext): Promise<void> {
  const stored: StoredContext = {
    context,
    expiresAt: Date.now() + CONTEXT_TTL,
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: stored })
}

async function handleClearContext(): Promise<void> {
  await chrome.storage.local.remove([STORAGE_KEY, PENDING_MODE_KEY])
}

async function handleOpenSidepanel(tabId?: number): Promise<void> {
  if (tabId) {
    await chrome.sidePanel.open({ tabId })
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id })
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Context Cleanup Alarm                                             */
/* ------------------------------------------------------------------ */

chrome.alarms.create('cleanup-context', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'cleanup-context') return

  const result = await chrome.storage.local.get(STORAGE_KEY)
  const stored = result[STORAGE_KEY] as StoredContext | undefined

  if (stored && Date.now() > stored.expiresAt) {
    await chrome.storage.local.remove([STORAGE_KEY, PENDING_MODE_KEY])
  }
})
