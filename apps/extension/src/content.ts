import type { ExtensionMessage, ExtensionResponse } from './types/messages'
import type { PageContext } from './types/context'
import { sanitizePII } from './utils/sanitize'
import { shouldBlockExtraction } from './utils/blocklist'

const MAX_TEXT_LENGTH = 5000

/* ------------------------------------------------------------------ */
/*  Text Extraction                                                   */
/* ------------------------------------------------------------------ */

function extractSelectedText(): string {
  const selection = window.getSelection()
  return selection ? selection.toString().trim() : ''
}

function extractPageText(): string {
  // Smart extraction: prioritize semantic content containers
  const candidates = [
    document.querySelector('article'),
    document.querySelector('main'),
    document.body,
  ]

  for (const element of candidates) {
    if (!element) continue
    const text = element.innerText.trim()
    if (text.length > 50) {
      return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text
    }
  }

  return ''
}

function extractFavicon(): string | undefined {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ]

  for (const selector of selectors) {
    const link = document.querySelector<HTMLLinkElement>(selector)
    if (link?.href) {
      return link.href
    }
  }

  return undefined
}

function buildPageContext(text: string): PageContext {
  const sanitizeResult = sanitizePII(text)

  return {
    text: sanitizeResult.text,
    url: location.href,
    title: document.title,
    favicon: extractFavicon(),
    timestamp: Date.now(),
    sanitized: sanitizeResult.detectedPatterns.length > 0,
  }
}

/* ------------------------------------------------------------------ */
/*  Message Handler                                                   */
/* ------------------------------------------------------------------ */

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse<PageContext>) => void,
  ) => {
    if (message.action !== 'EXTRACT_TEXT') {
      return false
    }

    // Blocklist check
    if (shouldBlockExtraction(location.href)) {
      sendResponse({
        success: false,
        error: 'Text extraction blocked on sensitive sites (banking, payment, authentication)',
      })
      return false
    }

    try {
      const selectedText = extractSelectedText()
      const text = selectedText.length > 0 ? selectedText : extractPageText()

      if (!text) {
        sendResponse({
          success: false,
          error: 'No extractable text found on this page',
        })
        return false
      }

      const context = buildPageContext(text)
      sendResponse({ success: true, data: context })
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Extraction failed',
      })
    }

    return false
  },
)
