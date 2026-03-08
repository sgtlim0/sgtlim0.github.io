/**
 * Clipboard utilities with navigator.clipboard API and legacy fallback.
 * SSR-safe: all functions check for browser environment.
 */

// ---------------------------------------------------------------------------
// Feature detection
// ---------------------------------------------------------------------------

export function isClipboardSupported(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }
  return !!(navigator.clipboard && typeof navigator.clipboard.writeText === 'function')
}

// ---------------------------------------------------------------------------
// Legacy fallback (textarea + execCommand)
// ---------------------------------------------------------------------------

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  // Prevent scrolling to bottom on iOS
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  textarea.setAttribute('readonly', '')

  document.body.appendChild(textarea)
  textarea.select()

  let success = false
  try {
    success = document.execCommand('copy')
  } catch {
    success = false
  } finally {
    document.body.removeChild(textarea)
  }

  return success
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Copy text to clipboard. Uses navigator.clipboard API when available,
 * falls back to document.execCommand('copy') for legacy browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Prefer modern API
  if (isClipboardSupported()) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Permission denied or other error — try legacy fallback
      return legacyCopy(text)
    }
  }

  // Legacy fallback
  return legacyCopy(text)
}

/**
 * Read text from clipboard. Requires navigator.clipboard API (no legacy fallback).
 * Only available in secure contexts (HTTPS / localhost).
 */
export async function readFromClipboard(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('readFromClipboard is not available in SSR')
  }

  if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
    throw new Error('Clipboard API is not supported in this browser')
  }

  return navigator.clipboard.readText()
}
