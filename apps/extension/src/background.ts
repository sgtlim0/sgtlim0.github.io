import type { ExtensionContext, ExtensionMessage } from './types'

const CONTEXT_MENU_ID = 'hchat-analyze'
const STORAGE_KEY = 'hchat_context'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'H Chat으로 분석하기',
    contexts: ['selection', 'page'],
  })
})

function sendExtractMessage(
  tabId: number,
): Promise<Omit<ExtensionContext, 'mode'>> {
  const message: ExtensionMessage = { action: 'EXTRACT_TEXT' }
  return chrome.tabs.sendMessage(tabId, message)
}

async function storeContext(
  context: Omit<ExtensionContext, 'mode'>,
): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: context })
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return
  }

  if (!tab?.id) {
    return
  }

  try {
    const context = await sendExtractMessage(tab.id)

    if (info.selectionText) {
      await storeContext({ ...context, text: info.selectionText })
    } else {
      await storeContext(context)
    }

    await chrome.action.openPopup()
  } catch (error) {
    console.error('[H Chat] Failed to extract text:', error)
  }
})

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.action === 'SET_CONTEXT' && message.payload) {
      storeContext(message.payload as Omit<ExtensionContext, 'mode'>)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: String(error) }))
      return true
    }

    return false
  },
)
