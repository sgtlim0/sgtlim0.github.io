/**
 * AI Core backend configuration and fetch helper.
 *
 * The AI_CORE_URL is server-side only (no NEXT_PUBLIC_ prefix).
 */

const AI_CORE_URL = process.env.AI_CORE_URL || 'http://localhost:8000'

/**
 * Fetch a JSON endpoint on the AI Core backend.
 * @param path - The path to fetch (e.g. "/chat")
 * @param init - Optional RequestInit overrides
 * @returns The fetch Response
 */
export async function fetchAiCore(path: string, init?: RequestInit): Promise<Response> {
  const url = `${AI_CORE_URL}${path}`
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

/**
 * Extract the client IP from a NextRequest.
 * Falls back to "unknown" if no forwarded header is present.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
