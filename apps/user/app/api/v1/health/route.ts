/**
 * GET /api/v1/health
 *
 * Proxies to AI Core /health and returns a degraded status
 * if the upstream service is unreachable.
 */

import { NextResponse } from 'next/server'

import { fetchAiCore } from '../../lib/aiCore'
import { withVersionHeaders, API_VERSION } from '../version'

export async function GET() {
  try {
    const upstream = await fetchAiCore('/health')

    if (!upstream.ok) {
      return withVersionHeaders(
        NextResponse.json(
          { status: 'degraded', aiCore: false, proxy: true, apiVersion: API_VERSION },
          { status: 200 },
        ),
      )
    }

    const data = await upstream.json()

    return withVersionHeaders(
      NextResponse.json({
        status: 'ok',
        aiCore: true,
        proxy: true,
        apiVersion: API_VERSION,
        upstream: data,
      }),
    )
  } catch {
    return withVersionHeaders(
      NextResponse.json(
        { status: 'degraded', aiCore: false, proxy: true, apiVersion: API_VERSION },
        { status: 200 },
      ),
    )
  }
}
