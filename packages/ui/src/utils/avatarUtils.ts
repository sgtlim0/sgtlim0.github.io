/**
 * Avatar utility functions — initials extraction and deterministic color mapping.
 */

const AVATAR_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#84CC16', // lime
  '#A855F7', // purple
] as const

/**
 * Extract initials from a name string.
 * - Korean: first character (e.g. "김철수" → "김")
 * - English: first letters of first and last words (e.g. "John Doe" → "JD")
 * - Single word English: first letter uppercase (e.g. "Admin" → "A")
 * - Empty/undefined: returns ""
 */
export function getInitials(name?: string): string {
  if (!name || name.trim().length === 0) {
    return ''
  }

  const trimmed = name.trim()

  // Check if the first character is Korean (Hangul syllables range)
  const firstChar = trimmed.charAt(0)
  const code = firstChar.charCodeAt(0)
  const isKorean = code >= 0xAC00 && code <= 0xD7AF

  if (isKorean) {
    return firstChar
  }

  // English: split by spaces, take first char of first and last words
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0)

  if (words.length === 0) {
    return ''
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }

  const first = words[0].charAt(0).toUpperCase()
  const last = words[words.length - 1].charAt(0).toUpperCase()

  return `${first}${last}`
}

/**
 * Generate a deterministic hash from a string.
 * Uses a simple djb2-like algorithm for consistent results.
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xFFFFFFFF
  }
  return Math.abs(hash)
}

/**
 * Get a deterministic background color based on a name string.
 * The same name always produces the same color.
 */
export function getAvatarColor(name?: string): string {
  if (!name || name.trim().length === 0) {
    return '#9CA3AF' // gray-400 fallback
  }

  const hash = hashString(name.trim())
  const index = hash % AVATAR_COLORS.length

  return AVATAR_COLORS[index]
}
