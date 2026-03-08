'use client'

import { getApiMode } from '../../client/serviceFactory'
import { getApiClient } from '../../client/serviceFactory'

export interface ResearchSource {
  title: string
  url: string
  snippet?: string
}

export interface ResearchResult {
  query: string
  answer: string
  sources: ResearchSource[]
}

export interface ResearchService {
  search(query: string, numSources?: number): Promise<ResearchResult>
}

class RealResearchService implements ResearchService {
  async search(query: string, numSources = 5): Promise<ResearchResult> {
    try {
      const client = getApiClient()
      const result = await client.post<ResearchResult>('/api/research', {
        query,
        numSources,
      })
      return result
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Research 검색 실패: ${error.message}`
          : 'Research 검색 중 알 수 없는 오류가 발생했습니다',
      )
    }
  }
}

const mockSources: ResearchSource[] = [
  {
    title: '현대자동차그룹 AI 전략 보고서 2025',
    url: 'https://www.hyundai.com/ai-strategy-2025',
    snippet:
      '현대자동차그룹은 2025년까지 AI 기반 자율주행 및 스마트 팩토리 기술을 핵심 성장 동력으로 삼고 있으며, 연간 AI R&D 투자를 전년 대비 40% 확대할 계획입니다.',
  },
  {
    title: '생성형 AI 기업 도입 가이드 - McKinsey',
    url: 'https://www.mckinsey.com/gen-ai-enterprise-guide',
    snippet:
      '기업의 생성형 AI 도입은 업무 생산성을 평균 25-35% 향상시키며, 특히 문서 작성, 코드 생성, 고객 응대 분야에서 가장 높은 효과를 보이고 있습니다.',
  },
  {
    title: 'LLM 기반 사내 챗봇 구축 사례 연구',
    url: 'https://techblog.example.com/enterprise-llm-chatbot',
    snippet:
      'RAG(Retrieval-Augmented Generation) 파이프라인을 활용한 사내 챗봇은 기존 FAQ 시스템 대비 응답 정확도를 78%에서 94%로 향상시켰으며, 직원 만족도 점수가 4.2/5로 개선되었습니다.',
  },
]

class MockResearchService implements ResearchService {
  async search(query: string, numSources = 5): Promise<ResearchResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const selectedSources = mockSources.slice(0, Math.min(numSources, mockSources.length))

    return {
      query,
      answer: `"${query}"에 대한 검색 결과입니다. 관련 자료를 ${selectedSources.length}건 찾았습니다. 현대자동차그룹의 AI 전략과 생성형 AI 기업 도입 사례를 종합하면, AI 기술은 업무 생산성 향상과 비용 절감에 크게 기여하고 있습니다. 특히 RAG 기반 시스템은 기존 방식 대비 높은 정확도와 사용자 만족도를 보여주고 있습니다.`,
      sources: selectedSources,
    }
  }
}

export function createResearchService(): ResearchService {
  const mode = getApiMode()
  if (mode === 'real') {
    return new RealResearchService()
  }
  return new MockResearchService()
}
