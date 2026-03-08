/**
 * GET /api/health
 *
 * DEPRECATED: Use /api/v1/health instead.
 * Delegates to v1 handler with deprecation headers for backward compatibility.
 */

import { GET as v1GET } from '../v1/health/route'
import { withVersionHeaders } from '../v1/version'

export async function GET() {
  const response = await v1GET()
  return withVersionHeaders(response, true)
}
