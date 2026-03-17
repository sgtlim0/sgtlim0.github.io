/**
 * LLM Router API proxy helper.
 *
 * Forwards requests to the upstream LLM Router backend,
 * injecting the server-side API key. This prevents exposing
 * the API key to the browser.
 */

const LLM_ROUTER_API_URL = process.env.LLM_ROUTER_API_URL || 'http://localhost:8000'
const LLM_ROUTER_API_KEY = process.env.LLM_ROUTER_API_KEY || ''

/**
 * Forwards a request to the upstream LLM Router API.
 * @param path - API path (e.g. "/models")
 * @param init - Optional RequestInit overrides
 * @returns The upstream Response
 */
export async function fetchRouter(path: string, init?: RequestInit): Promise<Response> {
  const url = `${LLM_ROUTER_API_URL}${path}`
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(LLM_ROUTER_API_KEY ? { Authorization: `Bearer ${LLM_ROUTER_API_KEY}` } : {}),
      ...init?.headers,
    },
  })
}

/**
 * Extract the client IP from a request.
 * Falls back to "unknown" if no forwarded header is present.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
