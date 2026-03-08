/**
 * GET /api/v1/csrf
 *
 * Issues a signed CSRF token using the Double Submit Cookie pattern.
 * Sets the token as an httpOnly cookie and returns it in the JSON body.
 * The client must include the token in the X-CSRF-Token header on POST requests.
 */

import { NextRequest } from 'next/server'

import { getClientIp } from '../../lib/aiCore'
import { createCsrfTokenResponse } from '../../lib/csrf'
import { checkRateLimit, createRateLimitResponse } from '../../lib/rateLimit'
import { withVersionHeaders } from '../version'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitResult = checkRateLimit(ip, 'csrf')

  if (!rateLimitResult.allowed) {
    return withVersionHeaders(createRateLimitResponse(rateLimitResult))
  }

  const response = await createCsrfTokenResponse()
  return withVersionHeaders(response)
}
