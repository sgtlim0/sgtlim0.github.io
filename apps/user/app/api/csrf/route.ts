/**
 * GET /api/csrf
 *
 * DEPRECATED: Use /api/v1/csrf instead.
 * Delegates to v1 handler with deprecation headers for backward compatibility.
 */

import { NextRequest } from 'next/server'

import { GET as v1GET } from '../v1/csrf/route'
import { withVersionHeaders } from '../v1/version'

export async function GET(request: NextRequest) {
  const response = await v1GET(request)
  return withVersionHeaders(response, true)
}
