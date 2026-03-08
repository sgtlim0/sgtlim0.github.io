/**
 * API versioning utilities.
 *
 * Adds standard versioning headers to all API responses:
 * - X-API-Version: Current API version
 * - Deprecation headers for legacy (unversioned) endpoints
 */

export const API_VERSION = 'v1'

/**
 * Adds API version headers to a Response.
 * @param response - The response to augment
 * @param deprecated - Whether this is a deprecated (unversioned) endpoint
 * @returns The response with version headers
 */
export function withVersionHeaders<T extends Response>(
  response: T,
  deprecated = false,
): T {
  response.headers.set('X-API-Version', API_VERSION)

  if (deprecated) {
    response.headers.set('Deprecation', 'true')
    response.headers.set(
      'Sunset',
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString(),
    )
    response.headers.set(
      'Link',
      '</api/v1>; rel="successor-version"',
    )
  }

  return response
}
