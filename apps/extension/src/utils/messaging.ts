/**
 * chrome.runtime.sendMessage 타입 안전 래퍼 유틸리티
 * @module utils/messaging
 */

import type { ExtensionMessage, ExtensionResponse } from '../types/messages'

/**
 * Background Script로 메시지 전송
 * @param message - Extension 메시지
 * @returns Promise<ExtensionResponse<T>>
 */
export function sendMessage<T>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      resolve({
        success: false,
        error: 'Not in extension context',
      })
      return
    }

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        })
        return
      }

      resolve(response as ExtensionResponse<T>)
    })
  })
}

/**
 * 특정 탭의 Content Script로 메시지 전송
 * @param tabId - 대상 탭 ID
 * @param message - Extension 메시지
 * @returns Promise<ExtensionResponse<T>>
 */
export function sendTabMessage<T>(
  tabId: number,
  message: ExtensionMessage,
): Promise<ExtensionResponse<T>> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      resolve({
        success: false,
        error: 'Not in extension context',
      })
      return
    }

    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        })
        return
      }

      resolve(response as ExtensionResponse<T>)
    })
  })
}
