'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { MarketplaceAgent, CreateAgentInput, UpdateAgentInput, MarketplaceFilters } from './marketplaceTypes'
import {
  getMarketplaceAgents,
  getMarketplaceAgentById,
  createMarketplaceAgent,
  updateMarketplaceAgent,
  deleteMarketplaceAgent,
  getMarketplaceStats,
} from './marketplaceService'

interface MarketplaceState {
  readonly agents: MarketplaceAgent[]
  readonly loading: boolean
  readonly error: string | null
}

export function useMarketplaceAgents(filters?: MarketplaceFilters) {
  const [state, setState] = useState<MarketplaceState>({
    agents: [],
    loading: true,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const agents = await getMarketplaceAgents(filters)
      setState({ agents, loading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '에이전트 목록을 불러올 수 없습니다',
      }))
    }
  }, [filters])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateAgentInput) => {
      const agent = await createMarketplaceAgent(input)
      await refresh()
      return agent
    },
    [refresh],
  )

  const update = useCallback(
    async (id: string, input: UpdateAgentInput) => {
      const result = await updateMarketplaceAgent(id, input)
      await refresh()
      return result
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteMarketplaceAgent(id)
      await refresh()
      return result
    },
    [refresh],
  )

  const stats = useMemo(() => ({
    total: state.agents.length,
    published: state.agents.filter((a) => a.status === 'published').length,
    avgRating: state.agents.length > 0
      ? Number((state.agents.reduce((s, a) => s + a.rating, 0) / state.agents.length).toFixed(1))
      : 0,
  }), [state.agents])

  return { ...state, refresh, create, update, remove, stats }
}

export function useMarketplaceAgent(id: string) {
  const [agent, setAgent] = useState<MarketplaceAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getMarketplaceAgentById(id)
        setAgent(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : '에이전트를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return { agent, loading, error }
}

export function useMarketplaceStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getMarketplaceStats>> | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMarketplaceStats()
      setStats(data)
    } catch {
      // stats 실패는 무시 — 핵심 기능 아님
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}
