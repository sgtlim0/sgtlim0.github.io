/**
 * POST /api/chat/stream
 *
 * DEPRECATED: Use /api/v1/chat/stream instead.
 * Delegates to v1 handler with deprecation headers for backward compatibility.
 */

import { NextRequest } from 'next/server'

import { POST as v1POST } from '../../v1/chat/stream/route'
import { withVersionHeaders } from '../../v1/version'

export async function POST(request: NextRequest) {
  const response = await v1POST(request)
  return withVersionHeaders(response, true)
}
