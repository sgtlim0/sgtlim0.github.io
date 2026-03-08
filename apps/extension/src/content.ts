import type { ExtensionMessage, ExtensionContext } from './types'
import { shouldBlockExtraction } from './utils/blocklist'

const MAX_TEXT_LENGTH = 5000

function extractSelectedText(): string {
  const selection = window.getSelection()
  return selection ? selection.toString().trim() : ''
}

function extractPageText(): string {
  const text = document.body.innerText.trim()
  if (text.length > MAX_TEXT_LENGTH) {
    return text.slice(0, MAX_TEXT_LENGTH)
  }
  return text
}

function buildContext(text: string): Omit<ExtensionContext, 'mode'> {
  return {
    text,
    url: location.href,
    title: document.title,
  }
}

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: Omit<ExtensionContext, 'mode'>) => void,
  ) => {
    if (message.action === 'EXTRACT_TEXT') {
      if (shouldBlockExtraction(location.href)) {
        sendResponse(buildContext(''))
        return false
      }

      const selectedText = extractSelectedText()
      const text = selectedText.length > 0 ? selectedText : extractPageText()
      sendResponse(buildContext(text))
    }

    return false
  },
)
