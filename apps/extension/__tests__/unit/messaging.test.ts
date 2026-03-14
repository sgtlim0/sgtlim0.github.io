import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessage, sendTabMessage } from '../../src/utils/messaging'
import type { ExtensionMessage } from '../../src/types/messages'

describe('messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chrome.runtime.lastError = null
  })

  describe('sendMessage', () => {
    it('should resolve with response on success', async () => {
      const mockResponse = { success: true, data: 'test data' }
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
        callback(mockResponse)
      })

      const message: ExtensionMessage = { type: 'GET_CONTEXT' }
      const result = await sendMessage(message)

      expect(result).toEqual(mockResponse)
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message, expect.any(Function))
    })

    it('should handle lastError', async () => {
      chrome.runtime.lastError = { message: 'Connection error' }
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
        callback(undefined)
      })

      const message: ExtensionMessage = { type: 'ANALYZE' }
      const result = await sendMessage(message)

      expect(result).toEqual({
        success: false,
        error: 'Connection error',
      })
    })

    it('should handle non-extension context', async () => {
      const originalChrome = globalThis.chrome
      // @ts-expect-error Testing non-extension context
      delete globalThis.chrome

      const message: ExtensionMessage = { type: 'GET_CONTEXT' }
      const result = await sendMessage(message)

      expect(result).toEqual({
        success: false,
        error: 'Not in extension context',
      })

      globalThis.chrome = originalChrome
    })

    it('should handle missing chrome.runtime', async () => {
      const originalRuntime = chrome.runtime
      // @ts-expect-error Testing missing runtime
      delete chrome.runtime

      const message: ExtensionMessage = { type: 'GET_CONTEXT' }
      const result = await sendMessage(message)

      expect(result).toEqual({
        success: false,
        error: 'Not in extension context',
      })

      chrome.runtime = originalRuntime
    })

    it('should pass message payload correctly', async () => {
      const mockResponse = { success: true, data: { result: 'analyzed' } }
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
        callback(mockResponse)
      })

      const message: ExtensionMessage = {
        type: 'ANALYZE',
        payload: { text: 'analyze this', mode: 'summarize' },
      }

      await sendMessage(message)

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message, expect.any(Function))
    })
  })

  describe('sendTabMessage', () => {
    it('should resolve with response on success', async () => {
      const mockResponse = { success: true, data: 'tab response' }
      vi.mocked(chrome.tabs.sendMessage).mockImplementation((_tabId, _msg, callback) => {
        callback(mockResponse)
      })

      const tabId = 123
      const message: ExtensionMessage = { type: 'GET_SELECTION' }
      const result = await sendTabMessage(tabId, message)

      expect(result).toEqual(mockResponse)
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message, expect.any(Function))
    })

    it('should handle lastError', async () => {
      chrome.runtime.lastError = { message: 'Tab not found' }
      vi.mocked(chrome.tabs.sendMessage).mockImplementation((_tabId, _msg, callback) => {
        callback(undefined)
      })

      const tabId = 999
      const message: ExtensionMessage = { type: 'GET_SELECTION' }
      const result = await sendTabMessage(tabId, message)

      expect(result).toEqual({
        success: false,
        error: 'Tab not found',
      })
    })

    it('should handle non-extension context', async () => {
      const originalChrome = globalThis.chrome
      // @ts-expect-error Testing non-extension context
      delete globalThis.chrome

      const message: ExtensionMessage = { type: 'GET_SELECTION' }
      const result = await sendTabMessage(123, message)

      expect(result).toEqual({
        success: false,
        error: 'Not in extension context',
      })

      globalThis.chrome = originalChrome
    })

    it('should handle missing chrome.tabs', async () => {
      const originalTabs = chrome.tabs
      // @ts-expect-error Testing missing tabs
      delete chrome.tabs

      const message: ExtensionMessage = { type: 'GET_SELECTION' }
      const result = await sendTabMessage(123, message)

      expect(result).toEqual({
        success: false,
        error: 'Not in extension context',
      })

      chrome.tabs = originalTabs
    })

    it('should send to correct tab ID', async () => {
      const mockResponse = { success: true }
      vi.mocked(chrome.tabs.sendMessage).mockImplementation((_tabId, _msg, callback) => {
        callback(mockResponse)
      })

      const tabId = 456
      const message: ExtensionMessage = { type: 'INJECT_UI' }
      await sendTabMessage(tabId, message)

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message, expect.any(Function))
    })
  })

  describe('error handling edge cases', () => {
    it('sendMessage should handle undefined lastError after clearing', async () => {
      chrome.runtime.lastError = { message: 'Error' }
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
        chrome.runtime.lastError = null
        callback({ success: true })
      })

      const message: ExtensionMessage = { type: 'GET_CONTEXT' }
      const result = await sendMessage(message)

      expect(result).toEqual({ success: true })
    })

    it('sendTabMessage should handle null response', async () => {
      vi.mocked(chrome.tabs.sendMessage).mockImplementation((_tabId, _msg, callback) => {
        callback(null)
      })

      const message: ExtensionMessage = { type: 'GET_SELECTION' }
      const result = await sendTabMessage(123, message)

      expect(result).toBe(null)
    })
  })
})
