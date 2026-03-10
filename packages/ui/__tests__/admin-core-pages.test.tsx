import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import AdminDashboard from '../src/admin/AdminDashboard'
import AdminUsageHistory from '../src/admin/AdminUsageHistory'
import AdminStatistics from '../src/admin/AdminStatistics'
import AdminUserManagement from '../src/admin/AdminUserManagement'
import AdminSettings from '../src/admin/AdminSettings'
import AdminProviderStatus from '../src/admin/AdminProviderStatus'
import AdminModelPricing from '../src/admin/AdminModelPricing'
import AdminFeatureUsage from '../src/admin/AdminFeatureUsage'
import AdminPromptLibrary from '../src/admin/AdminPromptLibrary'
import AdminAgentMonitoring from '../src/admin/AdminAgentMonitoring'

// ════════════════════════════════════════════════════════════════════
// 1. AdminDashboard
// ════════════════════════════════════════════════════════════════════
describe('AdminDashboard', () => {
  it('should render page title', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('관리자 대시보드')).toBeDefined()
  })

  it('should render subtitle with date', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('2026년 3월 2일 기준 사용 현황 요약')).toBeDefined()
  })

  it('should render 4 stat cards', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('총 대화 수')).toBeDefined()
    expect(screen.getByText('1,247')).toBeDefined()
    expect(screen.getByText('총 토큰 사용량')).toBeDefined()
    expect(screen.getByText('2.4M')).toBeDefined()
    expect(screen.getByText('활성 사용자')).toBeDefined()
    expect(screen.getByText('38')).toBeDefined()
    expect(screen.getByText('이번 달 비용')).toBeDefined()
    expect(screen.getByText('₩127K')).toBeDefined()
  })

  it('should render recent usage section header', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('최근 사용내역')).toBeDefined()
  })

  it('should render model usage bar chart section', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('모델별 사용 비율')).toBeDefined()
    expect(screen.getByText('45%')).toBeDefined()
    expect(screen.getByText('30%')).toBeDefined()
  })

  it('should render action buttons', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('전체 내역 보기')).toBeDefined()
    expect(screen.getByText('리포트 다운로드')).toBeDefined()
  })

  it('should render DataTable with usage data', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('user01')).toBeDefined()
    // 'AI 채팅' appears in the data row
    expect(screen.getAllByText('AI 채팅').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Claude 3.5').length).toBeGreaterThanOrEqual(1)
  })
})

// ════════════════════════════════════════════════════════════════════
// 2. AdminUsageHistory
// ════════════════════════════════════════════════════════════════════
describe('AdminUsageHistory', () => {
  it('should render page title', () => {
    render(<AdminUsageHistory />)
    expect(screen.getByText('사용 내역')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminUsageHistory />)
    expect(screen.getByText('모든 AI 대화 기록을 확인하세요')).toBeDefined()
  })

  it('should render stat cards', () => {
    render(<AdminUsageHistory />)
    expect(screen.getByText('이번 달 토큰')).toBeDefined()
    expect(screen.getByText('892K')).toBeDefined()
    expect(screen.getByText('이번 달 비용')).toBeDefined()
    expect(screen.getByText('₩47K')).toBeDefined()
  })

  it('should render all 4 filter tabs', () => {
    render(<AdminUsageHistory />)
    // tabs have same text as data rows so use getAllByText
    expect(screen.getAllByText('전체').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('AI 채팅').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('그룹 채팅').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('도구 사용').length).toBeGreaterThanOrEqual(1)
  })

  it('should render CSV export button', () => {
    render(<AdminUsageHistory />)
    expect(screen.getByText('CSV 내보내기')).toBeDefined()
  })

  it('should show all rows by default', () => {
    render(<AdminUsageHistory />)
    expect(screen.getAllByText('user01').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('user02')).toBeDefined()
    expect(screen.getByText('user03')).toBeDefined()
  })

  it('should filter rows when AI 채팅 tab clicked', () => {
    render(<AdminUsageHistory />)
    // Click the first "AI 채팅" which is the tab button
    const tabs = screen.getAllByText('AI 채팅')
    fireEvent.click(tabs[0])
    // user01 and user05 have AI 채팅 type
    expect(screen.getAllByText('user01').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('user05')).toBeDefined()
    // user03 has 그룹 채팅 - should be filtered out
    expect(screen.queryByText('user03')).toBeNull()
  })

  it('should filter rows when 도구 사용 tab clicked', () => {
    render(<AdminUsageHistory />)
    const tabs = screen.getAllByText('도구 사용')
    fireEvent.click(tabs[0])
    expect(screen.getByText('user02')).toBeDefined()
    expect(screen.queryByText('user05')).toBeNull()
  })

  it('should render MonthPicker with default values', () => {
    render(<AdminUsageHistory />)
    expect(screen.getByText('2026년 3월')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 3. AdminStatistics
// ════════════════════════════════════════════════════════════════════
describe('AdminStatistics', () => {
  it('should render page title', () => {
    render(<AdminStatistics />)
    expect(screen.getByText('사용 통계')).toBeDefined()
  })

  it('should render stat cards with trends', () => {
    render(<AdminStatistics />)
    expect(screen.getByText('이번 달 총 토큰')).toBeDefined()
    expect(screen.getByText('이번 달 총 비용')).toBeDefined()
  })

  it('should render monthly trend section', () => {
    render(<AdminStatistics />)
    expect(screen.getByText('월별 토큰/비용 추이')).toBeDefined()
    expect(screen.getByText('10월')).toBeDefined()
    expect(screen.getByText('3월')).toBeDefined()
  })

  it('should render model breakdown section', () => {
    render(<AdminStatistics />)
    expect(screen.getByText('모델별 사용 분석')).toBeDefined()
    expect(screen.getByText('55%')).toBeDefined()
  })

  it('should render top 5 users', () => {
    render(<AdminStatistics />)
    expect(screen.getByText('Top 5 사용자')).toBeDefined()
    expect(screen.getByText(/김철수/)).toBeDefined()
    expect(screen.getByText('125,000')).toBeDefined()
    expect(screen.getByText(/이영희/)).toBeDefined()
    expect(screen.getByText(/박민수/)).toBeDefined()
    expect(screen.getByText(/최수진/)).toBeDefined()
    expect(screen.getByText(/김민호/)).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 4. AdminUserManagement
// ════════════════════════════════════════════════════════════════════
describe('AdminUserManagement', () => {
  it('should render page title', () => {
    render(<AdminUserManagement />)
    expect(screen.getByText('사용자 관리')).toBeDefined()
  })

  it('should render user count', () => {
    render(<AdminUserManagement />)
    expect(screen.getByText('총 6명의 사용자')).toBeDefined()
  })

  it('should render search input', () => {
    render(<AdminUserManagement />)
    expect(screen.getByPlaceholderText('사용자 이름 또는 ID 검색...')).toBeDefined()
  })

  it('should render all 6 user cards', () => {
    render(<AdminUserManagement />)
    expect(screen.getByText('김철수')).toBeDefined()
    expect(screen.getByText('이영희')).toBeDefined()
    expect(screen.getByText('박민수')).toBeDefined()
    expect(screen.getByText('최수진')).toBeDefined()
    expect(screen.getByText('정대호')).toBeDefined()
    expect(screen.getByText('한지민')).toBeDefined()
  })

  it('should filter users by name search', () => {
    render(<AdminUserManagement />)
    const input = screen.getByPlaceholderText('사용자 이름 또는 ID 검색...')
    fireEvent.change(input, { target: { value: '김철수' } })
    expect(screen.getByText('김철수')).toBeDefined()
    expect(screen.queryByText('이영희')).toBeNull()
  })

  it('should filter users by userId search', () => {
    render(<AdminUserManagement />)
    const input = screen.getByPlaceholderText('사용자 이름 또는 ID 검색...')
    fireEvent.change(input, { target: { value: 'user04' } })
    expect(screen.getByText('최수진')).toBeDefined()
    expect(screen.queryByText('김철수')).toBeNull()
  })

  it('should show no results for non-matching query', () => {
    render(<AdminUserManagement />)
    const input = screen.getByPlaceholderText('사용자 이름 또는 ID 검색...')
    fireEvent.change(input, { target: { value: 'zzzzz' } })
    expect(screen.queryByText('김철수')).toBeNull()
    expect(screen.queryByText('이영희')).toBeNull()
  })
})

// ════════════════════════════════════════════════════════════════════
// 5. AdminSettings
// ════════════════════════════════════════════════════════════════════
describe('AdminSettings', () => {
  it('should render page title', () => {
    render(<AdminSettings />)
    expect(screen.getByText('관리 설정')).toBeDefined()
  })

  it('should render general settings section', () => {
    render(<AdminSettings />)
    expect(screen.getByText('일반 설정')).toBeDefined()
    expect(screen.getByText('시스템 이름')).toBeDefined()
    expect(screen.getByText('기본 언어')).toBeDefined()
  })

  it('should render default system name', () => {
    render(<AdminSettings />)
    const systemNameInput = screen.getByDisplayValue('H Chat v3')
    expect(systemNameInput).toBeDefined()
  })

  it('should render model settings section with all models', () => {
    render(<AdminSettings />)
    expect(screen.getByText('모델 설정')).toBeDefined()
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeDefined()
    expect(screen.getByText('GPT-4o')).toBeDefined()
    expect(screen.getByText('Gemini Pro 1.5')).toBeDefined()
    expect(screen.getByText('Claude Haiku 4.5')).toBeDefined()
    expect(screen.getByText('GPT-4o mini')).toBeDefined()
  })

  it('should render cost settings section', () => {
    render(<AdminSettings />)
    expect(screen.getByText('비용 설정')).toBeDefined()
    expect(screen.getByText('월 예산 한도 (USD)')).toBeDefined()
    expect(screen.getByDisplayValue('$500.00')).toBeDefined()
  })

  it('should render save and reset buttons', () => {
    render(<AdminSettings />)
    expect(screen.getByText('설정 저장')).toBeDefined()
    expect(screen.getByText('초기화')).toBeDefined()
  })

  it('should toggle model setting off', () => {
    render(<AdminSettings />)
    // Switch to "모델 설정" tab to find the switches
    fireEvent.click(screen.getByText('모델 설정'))
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBe(5)
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    fireEvent.click(switches[0])
    expect(switches[0].getAttribute('aria-checked')).toBe('false')
  })

  it('should toggle model setting back on', () => {
    render(<AdminSettings />)
    // Switch to "모델 설정" tab to find the switches
    fireEvent.click(screen.getByText('모델 설정'))
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])
    fireEvent.click(switches[0])
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
  })
})

// ════════════════════════════════════════════════════════════════════
// 6. AdminProviderStatus
// ════════════════════════════════════════════════════════════════════
describe('AdminProviderStatus', () => {
  it('should render page title', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('AI 제공자 상태')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('실시간 AI 서비스 모니터링')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('전체 제공자')).toBeDefined()
    expect(screen.getByText('정상 운영')).toBeDefined()
    expect(screen.getByText('평균 응답 시간')).toBeDefined()
    expect(screen.getByText('217ms')).toBeDefined()
    expect(screen.getByText('평균 가동률')).toBeDefined()
    expect(screen.getByText('99.90%')).toBeDefined()
  })

  it('should render all 3 provider cards', () => {
    render(<AdminProviderStatus />)
    expect(screen.getAllByText('Amazon Bedrock').length).toBeGreaterThanOrEqual(1)
    // 'OpenAI' appears in both provider card and incident log
    expect(screen.getAllByText('OpenAI').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Google Gemini').length).toBeGreaterThanOrEqual(1)
  })

  it('should render status badges for providers', () => {
    render(<AdminProviderStatus />)
    const onlineLabels = screen.getAllByText('정상')
    expect(onlineLabels.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('지연')).toBeDefined()
  })

  it('should render provider details', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('120ms')).toBeDefined()
    expect(screen.getByText('99.97%')).toBeDefined()
    expect(screen.getByText('ap-northeast-2')).toBeDefined()
    expect(screen.getByText('180ms')).toBeDefined()
    expect(screen.getByText('US East')).toBeDefined()
  })

  it('should render supported models', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeDefined()
    expect(screen.getByText('GPT-4o')).toBeDefined()
    expect(screen.getByText('Gemini 1.5 Pro')).toBeDefined()
  })

  it('should render incident log', () => {
    render(<AdminProviderStatus />)
    expect(screen.getByText('최근 이벤트 로그')).toBeDefined()
    expect(screen.getByText('응답 지연 발생 (>500ms)')).toBeDefined()
    expect(screen.getByText('정상 복구')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 7. AdminModelPricing
// ════════════════════════════════════════════════════════════════════
describe('AdminModelPricing', () => {
  it('should render page title', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('모델 가격 정보')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('AI 모델별 요금 및 월별 비용 추이')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('활성 모델')).toBeDefined()
    expect(screen.getByText('8개')).toBeDefined()
    expect(screen.getByText('가장 많이 사용')).toBeDefined()
    expect(screen.getByText('가장 경제적')).toBeDefined()
  })

  it('should render pricing table headers', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('모델별 요금표')).toBeDefined()
    expect(screen.getByText('제공자')).toBeDefined()
    expect(screen.getByText('모델')).toBeDefined()
    expect(screen.getByText('컨텍스트')).toBeDefined()
    expect(screen.getByText('입력 비용')).toBeDefined()
    expect(screen.getByText('출력 비용')).toBeDefined()
    expect(screen.getByText('등급')).toBeDefined()
  })

  it('should render all model rows', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeDefined()
    expect(screen.getByText('Claude 3 Opus')).toBeDefined()
    expect(screen.getByText('Claude 3 Haiku')).toBeDefined()
    expect(screen.getAllByText('GPT-4o').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('GPT-4 Turbo')).toBeDefined()
    expect(screen.getByText('Gemini 1.5 Pro')).toBeDefined()
  })

  it('should render tier badges', () => {
    render(<AdminModelPricing />)
    const premiumBadges = screen.getAllByText('Premium')
    expect(premiumBadges.length).toBe(4)
    const economyBadges = screen.getAllByText('Economy')
    expect(economyBadges.length).toBe(3)
    const standardBadges = screen.getAllByText('Standard')
    expect(standardBadges.length).toBe(1)
  })

  it('should render popular tag for popular models', () => {
    render(<AdminModelPricing />)
    const popularTags = screen.getAllByText('인기')
    expect(popularTags.length).toBe(5)
  })

  it('should render monthly cost chart', () => {
    render(<AdminModelPricing />)
    expect(screen.getByText('월별 비용 추이 (₩M)')).toBeDefined()
    expect(screen.getByText('2025.09')).toBeDefined()
    expect(screen.getByText('2026.02')).toBeDefined()
  })

  it('should render chart legend', () => {
    render(<AdminModelPricing />)
    // 'Bedrock' appears in both table rows and legend
    expect(screen.getAllByText('Bedrock').length).toBeGreaterThanOrEqual(2)
    // 'OpenAI' and 'Google' appear in both table and legend
    expect(screen.getAllByText('OpenAI').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Google').length).toBeGreaterThanOrEqual(2)
  })
})

// ════════════════════════════════════════════════════════════════════
// 8. AdminFeatureUsage
// ════════════════════════════════════════════════════════════════════
describe('AdminFeatureUsage', () => {
  it('should render page title', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('기능별 사용량')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('AI 기능 사용 현황 및 트렌드 분석')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('총 기능')).toBeDefined()
    expect(screen.getAllByText('6개').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('이번 달 총 사용량')).toBeDefined()
    expect(screen.getByText('가장 인기 기능')).toBeDefined()
  })

  it('should render feature usage table headers', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('기능별 상세 통계')).toBeDefined()
    expect(screen.getByText('기능명')).toBeDefined()
    // '월간 사용량' is a table header
    expect(screen.getByText('월간 사용량')).toBeDefined()
    // '전월 대비' appears in both stat card and table header
    expect(screen.getAllByText('전월 대비').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('활성 사용자')).toBeDefined()
    expect(screen.getByText('평균 응답시간')).toBeDefined()
    expect(screen.getByText('만족도')).toBeDefined()
  })

  it('should render all 6 feature rows', () => {
    render(<AdminFeatureUsage />)
    // 'Chat' appears in table, chart legend, and adoption rate
    expect(screen.getAllByText('Chat').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Group Chat').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Tool Use').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Agent').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Debate').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Report').length).toBeGreaterThanOrEqual(1)
  })

  it('should render up/down trend indicators', () => {
    render(<AdminFeatureUsage />)
    const upArrows = screen.getAllByText(/↑/)
    const downArrows = screen.getAllByText(/↓/)
    expect(upArrows.length).toBeGreaterThanOrEqual(5)
    expect(downArrows.length).toBeGreaterThanOrEqual(1)
  })

  it('should render weekly usage trend chart', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('주간 사용량 추이 (K건)')).toBeDefined()
    expect(screen.getByText('W1')).toBeDefined()
    expect(screen.getByText('W4')).toBeDefined()
  })

  it('should render adoption rate section', () => {
    render(<AdminFeatureUsage />)
    expect(screen.getByText('기능 도입률')).toBeDefined()
    expect(screen.getByText('89%')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 9. AdminPromptLibrary
// ════════════════════════════════════════════════════════════════════
describe('AdminPromptLibrary', () => {
  it('should render page title', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('프롬프트 라이브러리')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('조직 내 공유 프롬프트 템플릿 관리')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('등록 프롬프트')).toBeDefined()
    expect(screen.getAllByText('6개').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('평균 평점')).toBeDefined()
    expect(screen.getByText('활성 기여자')).toBeDefined()
    expect(screen.getByText('6명')).toBeDefined()
  })

  it('should render all 5 category tabs', () => {
    render(<AdminPromptLibrary />)
    // '전체' is a tab; '업무', '개발', '마케팅', '분석' also appear as category badges on cards
    expect(screen.getAllByText('전체').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('업무').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('개발').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('마케팅').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('분석').length).toBeGreaterThanOrEqual(1)
  })

  it('should render all 6 prompt cards by default', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('회의록 작성 도우미')).toBeDefined()
    expect(screen.getByText('코드 리뷰 가이드')).toBeDefined()
    expect(screen.getByText('마케팅 카피 생성기')).toBeDefined()
    expect(screen.getByText('데이터 인사이트 추출')).toBeDefined()
    expect(screen.getByText('이메일 자동 답변')).toBeDefined()
    expect(screen.getByText('SQL 쿼리 최적화')).toBeDefined()
  })

  it('should render prompt tags', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('회의')).toBeDefined()
    expect(screen.getByText('코드리뷰')).toBeDefined()
    expect(screen.getByText('카피라이팅')).toBeDefined()
  })

  it('should render prompt authors', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText(/김민수/)).toBeDefined()
    expect(screen.getByText(/박지원/)).toBeDefined()
    expect(screen.getByText(/이서연/)).toBeDefined()
  })

  it('should render usage counts', () => {
    render(<AdminPromptLibrary />)
    expect(screen.getByText('342회 사용')).toBeDefined()
    expect(screen.getByText('278회 사용')).toBeDefined()
  })

  it('should filter prompts by 개발 category', () => {
    render(<AdminPromptLibrary />)
    // Find the tab button - '개발' appears as both tab and category badge
    // The tabs come first in DOM order
    const devTexts = screen.getAllByText('개발')
    fireEvent.click(devTexts[0]) // click the tab
    expect(screen.getByText('코드 리뷰 가이드')).toBeDefined()
    expect(screen.getByText('SQL 쿼리 최적화')).toBeDefined()
    expect(screen.queryByText('회의록 작성 도우미')).toBeNull()
    expect(screen.queryByText('마케팅 카피 생성기')).toBeNull()
  })

  it('should filter prompts by 업무 category', () => {
    render(<AdminPromptLibrary />)
    const busiTexts = screen.getAllByText('업무')
    fireEvent.click(busiTexts[0])
    expect(screen.getByText('회의록 작성 도우미')).toBeDefined()
    expect(screen.getByText('이메일 자동 답변')).toBeDefined()
    expect(screen.queryByText('코드 리뷰 가이드')).toBeNull()
  })

  it('should show all prompts after switching back to 전체', () => {
    render(<AdminPromptLibrary />)
    const analysisTexts = screen.getAllByText('분석')
    fireEvent.click(analysisTexts[0])
    expect(screen.queryByText('회의록 작성 도우미')).toBeNull()

    const allTexts = screen.getAllByText('전체')
    fireEvent.click(allTexts[0])
    expect(screen.getByText('회의록 작성 도우미')).toBeDefined()
    expect(screen.getByText('데이터 인사이트 추출')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 10. AdminAgentMonitoring
// ════════════════════════════════════════════════════════════════════
describe('AdminAgentMonitoring', () => {
  it('should render page title', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('에이전트 실행 모니터링')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('실시간 에이전트/자동화 실행 상태')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('활성 에이전트')).toBeDefined()
    expect(screen.getByText('오늘 실행')).toBeDefined()
    expect(screen.getByText('328건')).toBeDefined()
    // '성공률' appears as both stat card label and agent detail
    expect(screen.getAllByText('성공률').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('96.2%')).toBeDefined()
    expect(screen.getByText('평균 실행 시간')).toBeDefined()
    expect(screen.getAllByText('12.4초').length).toBeGreaterThanOrEqual(1)
  })

  it('should render all 5 agent cards', () => {
    render(<AdminAgentMonitoring />)
    // Agent names appear in both cards and execution log
    expect(screen.getAllByText('Code Reviewer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('TDD Guide').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Build Resolver').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Security Reviewer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('E2E Runner').length).toBeGreaterThanOrEqual(1)
  })

  it('should render agent status badges', () => {
    render(<AdminAgentMonitoring />)
    // '실행 중' appears in agent cards (2) and execution log (1)
    const runningLabels = screen.getAllByText('실행 중')
    expect(runningLabels.length).toBeGreaterThanOrEqual(2)
    const idleLabels = screen.getAllByText('대기')
    expect(idleLabels.length).toBe(2)
    const errorLabels = screen.getAllByText('오류')
    expect(errorLabels.length).toBe(1)
  })

  it('should render agent details', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('2분 전')).toBeDefined()
    expect(screen.getByText('98.5%')).toBeDefined()
    // 1,247 is totalExecutions for Code Reviewer
    expect(screen.getAllByText('1,247').length).toBeGreaterThanOrEqual(1)
  })

  it('should render execution log table headers', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('최근 실행 로그')).toBeDefined()
    expect(screen.getByText('시간')).toBeDefined()
    expect(screen.getByText('에이전트')).toBeDefined()
    expect(screen.getByText('작업')).toBeDefined()
    expect(screen.getByText('상태')).toBeDefined()
    expect(screen.getByText('실행 시간')).toBeDefined()
    expect(screen.getByText('토큰 사용')).toBeDefined()
  })

  it('should render execution rows with correct statuses', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('코드 품질 분석')).toBeDefined()
    expect(screen.getByText('보안 취약점 스캔')).toBeDefined()
    const successLabels = screen.getAllByText('성공')
    expect(successLabels.length).toBeGreaterThanOrEqual(4)
    expect(screen.getByText('실패')).toBeDefined()
  })

  it('should render daily execution trend', () => {
    render(<AdminAgentMonitoring />)
    expect(screen.getByText('오늘 실행 추이 (시간별)')).toBeDefined()
    expect(screen.getByText('00:00')).toBeDefined()
    expect(screen.getByText('52건')).toBeDefined()
  })
})
