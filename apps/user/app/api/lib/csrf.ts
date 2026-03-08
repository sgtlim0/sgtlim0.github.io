/**
 * Server-side CSRF token validation for API routes.
 *
 * Validates that POST requests include a non-empty X-CSRF-Token header
 * with a valid UUID format, matching the token set by the client-side
 * csrf utility (packages/ui/src/utils/csrf.ts).
 */

import { NextResponse } from 'next/server'

const CSRF_HEADER = 'x-csrf-token'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validates the CSRF token from the request header.
 * Returns null if valid, or a NextResponse with 403 if invalid.
 */
export function validateCsrfHeader(
  request: Request,
): NextResponse | null {
  const token = request.headers.get(CSRF_HEADER)

  if (!token) {
    return NextResponse.json(
      { error: 'Missing CSRF token' },
      { status: 403 },
    )
  }

  if (!UUID_PATTERN.test(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token format' },
      { status: 403 },
    )
  }

  return null
}
