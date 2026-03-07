export interface ServiceHealth {
  name: string
  status: 'up' | 'down' | 'degraded'
  latency?: number
  error?: string
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceHealth[]
  timestamp: string
}

export async function checkServiceHealth(
  name: string,
  url: string,
  timeoutMs = 5000,
): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return { name, status: response.ok ? 'up' : 'degraded', latency: Date.now() - start }
  } catch (error) {
    return {
      name,
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown',
    }
  }
}

export async function getSystemHealth(
  services: { name: string; url: string }[],
): Promise<HealthStatus> {
  const results = await Promise.all(services.map(({ name, url }) => checkServiceHealth(name, url)))
  const hasDown = results.some((s) => s.status === 'down')
  const hasDegraded = results.some((s) => s.status === 'degraded')
  return {
    status: hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    services: results,
    timestamp: new Date().toISOString(),
  }
}
