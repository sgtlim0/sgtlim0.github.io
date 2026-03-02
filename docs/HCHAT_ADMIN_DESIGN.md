# H Chat 사용내역 관리자 페이지 디자인 설계

## 개요

H Chat 사용내역을 관리하고 모니터링하는 관리자 대시보드 페이지를 설계합니다.
MoneyFlow 가계부 앱의 구조를 참고하여, HMG 디자인 가이드라인에 맞는 관리자 UI를 구현합니다.

### 참조
- **MoneyFlow**: https://moneyflow-cyan.vercel.app/ (가계부 웹앱, Next.js 16 + Tailwind CSS 4)
- **HMG 디자인**: wiki.pen 내 HMG 컴포넌트 시스템 (18개 변수, 18개 컴포넌트)
- **Storybook**: https://hchat-wiki-storybook.vercel.app/

---

## 화면 구성 (5개 페이지)

### 1. Admin-Dashboard (관리자 대시보드)

**목적**: 전체 사용 현황을 한눈에 파악

**구성 요소**:
| 영역 | 컴포넌트 | 내용 |
|------|----------|------|
| GNB | HMG/GNB | 로고: "H Chat Admin", 메뉴: 대시보드 / 사용내역 / 통계 / 설정 |
| 헤더 | 텍스트 | "관리자 대시보드", 오늘 날짜 표시 |
| 요약 카드 4개 | HMG/StatCard | 총 대화 수, 총 토큰 사용량, 활성 사용자, 이번 달 비용 |
| 최근 사용내역 | 테이블 (5행) | 사용자, 모델, 토큰, 비용, 시간 |
| 모델별 사용 비율 | 막대 차트 | Claude, GPT-4, Gemini 등 모델별 비율 |

**액션 버튼**:
- "전체 내역 보기" → 사용내역 페이지로 이동
- "리포트 다운로드" → CSV 내보내기

---

### 2. Admin-UsageHistory (사용내역)

**목적**: 전체 사용 기록을 검색/필터링하여 상세 조회

**구성 요소**:
| 영역 | 컴포넌트 | 내용 |
|------|----------|------|
| GNB | HMG/GNB | (공통) |
| 헤더 | 텍스트 | "사용 내역", "모든 AI 대화 기록을 확인하세요" |
| 요약 | StatCard x2 | 이번 달 토큰, 이번 달 비용 |
| 필터 탭 | HMG/TabFilter | 전체 / AI 채팅 / 그룹 채팅 / 도구 사용 |
| 기간 필터 | 월 선택기 | 2026년 3월 (드롭다운) |
| 테이블 | 커스텀 테이블 | 날짜, 사용자, 유형, 모델, 토큰, 비용, 상태 |

**테이블 컬럼**:
```
날짜 | 사용자 | 유형 | 모델 | 토큰 | 비용(₩) | 상태
2026-03-02 | user01 | AI 채팅 | Claude 3.5 | 2,450 | ₩12 | 완료
2026-03-02 | user03 | 그룹 채팅 | GPT-4 | 8,900 | ₩45 | 완료
2026-03-01 | user02 | 도구 사용 | Gemini | 1,200 | ₩6 | 실패
```

**액션 버튼**:
- "CSV 내보내기"
- 각 행: "상세 보기" 버튼

---

### 3. Admin-Statistics (통계)

**목적**: 사용 추이와 비용 분석을 시각화

**구성 요소**:
| 영역 | 컴포넌트 | 내용 |
|------|----------|------|
| GNB | HMG/GNB | (공통) |
| 헤더 | 텍스트 | "사용 통계", 기간 선택기 |
| 요약 카드 | StatCard x2 | 이번 달 총 토큰, 이번 달 총 비용 |
| 월별 추이 | 막대 차트 | 6개월 토큰/비용 추이 (가로 막대) |
| 모델별 분석 | 도넛 차트 영역 | Claude 45%, GPT-4 30%, Gemini 15%, 기타 10% |
| Top 5 사용자 | 리스트 | 사용자별 토큰 소비량 순위 |

---

### 4. Admin-UserManagement (사용자 관리)

**목적**: 사용자별 사용량 관리 및 권한 설정

**구성 요소**:
| 영역 | 컴포넌트 | 내용 |
|------|----------|------|
| GNB | HMG/GNB | (공통) |
| 헤더 | 텍스트 | "사용자 관리", 사용자 수 표시 |
| 검색바 | 검색 입력 | 사용자 이름/ID 검색 |
| 사용자 카드 | 커스텀 카드 x6 | 아바타, 이름, 부서, 총 대화, 이번 달 토큰, 상태 뱃지 |

**사용자 카드 정보**:
```
[아바타] 김철수 (user01)
├ 부서: AI혁신팀
├ 총 대화: 245회
├ 이번 달 토큰: 125,000
├ 상태: [활성]
└ [상세 보기] [권한 설정]
```

---

### 5. Admin-Settings (관리 설정)

**목적**: 시스템 설정 및 제한 관리

**구성 요소**:
| 영역 | 컴포넌트 | 내용 |
|------|----------|------|
| GNB | HMG/GNB | (공통) |
| 헤더 | 텍스트 | "관리 설정" |
| 일반 설정 | 폼 섹션 | 시스템 이름, 기본 언어, 알림 설정 |
| 모델 설정 | 토글 리스트 | 각 AI 모델 활성화/비활성화, 일일 토큰 한도 |
| 비용 설정 | 입력 폼 | 월 예산 한도, 경고 임계값(%) |
| 액션 | 버튼 | "설정 저장", "초기화" |

**모델 설정 행**:
```
[토글] Claude 3.5 Sonnet  | 일일 한도: 100,000 토큰 | [수정]
[토글] GPT-4 Turbo        | 일일 한도: 50,000 토큰  | [수정]
[토글] Gemini Pro          | 일일 한도: 80,000 토큰  | [수정]
```

---

## 디자인 시스템 확장

### 추가 컴포넌트 (wiki.pen에 추가)

| 컴포넌트 ID | 이름 | 용도 |
|-------------|------|------|
| Admin/DataTable | 데이터 테이블 | 사용내역, 사용자 목록 표시 |
| Admin/TableRow | 테이블 행 | 데이터 행 (호버, 스트라이프) |
| Admin/StatusBadge | 상태 뱃지 | 완료(초록), 진행중(파랑), 실패(빨강) |
| Admin/BarChartRow | 막대 차트 행 | 모델별/사용자별 사용량 시각화 |
| Admin/UserCard | 사용자 카드 | 사용자 정보 + 사용량 요약 |
| Admin/SettingsRow | 설정 행 | 토글 + 라벨 + 입력 필드 |
| Admin/MonthPicker | 월 선택기 | 기간 필터용 드롭다운 |

### 추가 디자인 변수

```
hmg-status-success: #4CAF50 (기존 hmg-approve 재사용)
hmg-status-error: #E53935 (기존 hmg-reject 재사용)
hmg-status-pending: #FFA726
hmg-chart-bar1: #00B4D8 (기존 hmg-teal)
hmg-chart-bar2: #3A5BC5 (기존 hmg-blue)
hmg-chart-bar3: #E15C39 (기존 hmg-accent)
hmg-chart-bar4: #118762 (기존 hmg-green)
```

---

## wiki.pen 화면 배치

기존 HMG 화면 아래에 배치 (y=5000):

| 화면 | 위치 (x, y) | 크기 |
|------|-------------|------|
| Admin-Dashboard | (0, 5000) | 1440 x 900 |
| Admin-UsageHistory | (1540, 5000) | 1440 x 1200 |
| Admin-Statistics | (3080, 5000) | 1440 x 1100 |
| Admin-UserManagement | (4620, 5000) | 1440 x 1000 |
| Admin-Settings | (6160, 5000) | 1440 x 1000 |
| Admin-Dashboard - Dark | (0, 6400) | 1440 x 900 |
| Admin-UsageHistory - Dark | (1540, 6400) | 1440 x 1200 |
| Admin-Statistics - Dark | (3080, 6400) | 1440 x 1100 |
| Admin-UserManagement - Dark | (4620, 6400) | 1440 x 1000 |
| Admin-Settings - Dark | (6160, 6400) | 1440 x 1000 |

---

## Storybook 스토리 구성

### Atoms (새 컴포넌트)
```
stories/atoms/StatusBadge.stories.tsx
  - Success (완료)
  - Error (실패)
  - Pending (진행중)

stories/atoms/MonthPicker.stories.tsx
  - Default
  - Selected
```

### Molecules (새 컴포넌트)
```
stories/molecules/DataTable.stories.tsx
  - UsageHistory (사용내역 테이블)
  - EmptyState (데이터 없음)

stories/molecules/BarChartRow.stories.tsx
  - ModelUsage (모델별 사용량)
  - UserRanking (사용자 순위)

stories/molecules/UserCard.stories.tsx
  - Active (활성 사용자)
  - Inactive (비활성 사용자)

stories/molecules/SettingsRow.stories.tsx
  - Toggle (토글 설정)
  - Input (입력 설정)
```

### Organisms (페이지)
```
stories/organisms/AdminDashboard.stories.tsx
  - Default (라이트)
  - DarkMode

stories/organisms/AdminUsageHistory.stories.tsx
  - Default
  - Filtered (필터 적용)
  - DarkMode

stories/organisms/AdminStatistics.stories.tsx
  - Default
  - DarkMode

stories/organisms/AdminUserManagement.stories.tsx
  - Default
  - DarkMode

stories/organisms/AdminSettings.stories.tsx
  - Default
  - DarkMode
```

---

## 데이터 모델

### UsageRecord (사용 기록)
```typescript
interface UsageRecord {
  id: string;
  userId: string;
  userName: string;
  type: 'ai-chat' | 'group-chat' | 'tool-use';
  model: string;           // 'Claude 3.5' | 'GPT-4' | 'Gemini' 등
  tokens: number;
  cost: number;            // 원화 (₩)
  status: 'completed' | 'failed' | 'pending';
  date: string;            // ISO 8601
  memo?: string;
}
```

### AdminUser (관리 대상 사용자)
```typescript
interface AdminUser {
  id: string;
  name: string;
  department: string;
  avatar?: string;
  totalConversations: number;
  monthlyTokens: number;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];   // 허용된 모델 목록
}
```

### AdminStats (통계 요약)
```typescript
interface AdminStats {
  totalConversations: number;
  totalTokens: number;
  activeUsers: number;
  monthlyCost: number;
  modelBreakdown: Record<string, number>;  // 모델별 토큰
  monthlyTrend: { month: string; tokens: number; cost: number }[];
}
```

---

## 구현 순서

1. **wiki.pen 컴포넌트 추가** — Admin/ 접두어로 7개 컴포넌트 추가
2. **wiki.pen 화면 구성** — 5개 Light 화면 + 5개 Dark 화면 (총 10개)
3. **React 컴포넌트 구현** — StatusBadge, DataTable, BarChart, UserCard, SettingsRow, MonthPicker
4. **페이지 구현** — AdminDashboard, AdminUsageHistory, AdminStatistics, AdminUserManagement, AdminSettings
5. **Storybook 스토리 작성** — 각 컴포넌트 + 페이지 스토리
6. **빌드 검증** — `npm run build` + `npm run build-storybook`
7. **배포** — Vercel (메인 사이트 + Storybook)

## MoneyFlow 참조 매핑

| MoneyFlow 페이지 | H Chat Admin 페이지 | 차이점 |
|-----------------|---------------------|--------|
| Dashboard | Admin-Dashboard | 금액 → 토큰/비용, 거래 → AI 대화 |
| Transaction History | Admin-UsageHistory | 수입/지출 → AI채팅/그룹채팅/도구사용 |
| Statistics | Admin-Statistics | 카테고리 → 모델별, 월별 추이 동일 |
| Add Transaction | Admin-UserManagement | 거래 추가 → 사용자 관리 (다른 목적) |
| Settings | Admin-Settings | 모델별 토글, 토큰 한도 추가 |
