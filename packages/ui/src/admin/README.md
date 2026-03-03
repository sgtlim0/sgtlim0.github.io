# Admin 관리자 패널 컴포넌트

H Chat 관리자 대시보드에 사용되는 엔터프라이즈급 UI 컴포넌트 및 관리 기능 패키지입니다. 대시보드, ROI 분석, 사용자 관리, SSO 설정, 감사 로그 등 17개 페이지를 지원합니다.

## 사용 앱

- **apps/admin** — H Chat 관리자 대시보드 (https://hchat-admin.vercel.app)
  - 로컬 개발: `npm run dev:admin` (localhost:3002)

## 설치

```bash
npm install @hchat/ui
```

## 빠른 시작

### 레이아웃에서 서비스 프로바이더 설정

```tsx
import { AdminServiceProvider } from '@hchat/ui/admin/services';
import AdminNav from '@/components/AdminNav';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AdminServiceProvider>
          <AdminNav />
          {children}
        </AdminServiceProvider>
      </body>
    </html>
  );
}
```

### 컴포넌트 사용

```tsx
import {
  AdminDashboard,
  StatCard,
  DataTable,
  StatusBadge
} from '@hchat/ui/admin';
import { useDashboard } from '@hchat/ui/admin/services';

export default function DashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <AdminDashboard stats={data?.stats} />
    </div>
  );
}
```

## 컴포넌트 카테고리

### 기본 UI 컴포넌트

| 컴포넌트 | 설명 | 용도 |
|---------|------|------|
| **StatusBadge** | 상태 표시 배지 | 사용자/에이전트 상태 표시 |
| **MonthPicker** | 월 선택 달력 위젯 | 기간별 데이터 조회 |
| **StatCard** | 통계 수치 카드 | 핵심 지표 표시 |
| **DataTable** | 데이터 테이블 | 사용자/감사로그/프롬프트 목록 |
| **BarChartRow** | 수평 막대 차트 | 비교 데이터 시각화 |
| **UserCard** | 사용자 정보 카드 | 사용자 정보 표시 |
| **SettingsRow** | 설정 행 항목 | 토글/설정 옵션 |

### 대시보드 페이지 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---------|------|------|
| **AdminDashboard** | `/` | 메인 대시보드 (요약 통계) |
| **AdminUsageHistory** | `/usage` | 월별 사용 이력 및 통계 |
| **AdminStatistics** | `/statistics` | 기간별 상세 분석 |
| **AdminUserManagement** | `/users` | 사용자 목록 및 권한 관리 |
| **AdminSettings** | `/settings` | 시스템 전역 설정 |

### ROI 대시보드 컴포넌트

ROI 분석 섹션의 8개 페이지:

| 페이지 | 경로 | 설명 |
|--------|------|------|
| ROI Overview | `/roi/overview` | ROI 지표 및 요약 |
| Adoption | `/roi/adoption` | 도입률 분석 |
| Productivity | `/roi/productivity` | 생산성 개선 효과 |
| Analysis | `/roi/analysis` | 상세 분석 리포트 |
| Organization | `/roi/organization` | 조직별 분석 |
| Sentiment | `/roi/sentiment` | 사용자 만족도 분석 |
| Reports | `/roi/reports` | 생성된 리포트 목록 |
| Upload | `/roi/upload` | 데이터 업로드 |

### 엔터프라이즈 관리 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---------|------|------|
| **DepartmentManagement** | `/departments` | 부서 생성, 편집, 삭제 |
| **AuditLogViewer** | `/audit-logs` | 시스템 감사 로그 조회 |
| **SSOConfigPanel** | `/sso` | SSO/SAML 설정 관리 |
| **AdminProviderStatus** | `/providers` | AI 제공자(OpenAI, Claude 등) 상태 모니터링 |
| **AdminModelPricing** | `/models` | 모델 가격 및 사용료 관리 |
| **AdminFeatureUsage** | `/features` | 기능별 사용량 통계 |
| **AdminPromptLibrary** | `/prompts` | 프롬프트 템플릿 라이브러리 |
| **AdminAgentMonitoring** | `/agents` | 에이전트 실행 상태 및 로그 |

### 인증 관련

| 항목 | 설명 |
|------|------|
| **LoginPage** | 관리자 로그인 페이지 |
| **AuthProvider** | 인증 Context 프로바이더 |
| **ProtectedRoute** | 인증 보호 라우트 |
| **useAuth()** 훅 | 현재 사용자 및 인증 상태 접근 |

### 네비게이션

**AdminNav** (`apps/admin/components/AdminNav.tsx`)
- 반응형 네비게이션 바 (데스크톱/모바일)
- 14개 항목 자동 라우팅
- 다크모드 토글 및 로그아웃 기능
- 모바일 햄버거 메뉴

## 서비스 레이어

API 데이터 페칭 및 상태 관리는 `@hchat/ui/admin/services`에서 제공됩니다.

### 사용 가능한 훅

**대시보드**: `useDashboard()`
**사용 이력**: `useUsageHistory(year, month)`, `useMonthlyUsageStats(year, month)`
**통계**: `useStatistics(period)`
**사용자**: `useUsers()`, `useUserSearch(query)`
**설정**: `useSettings()`
**제공자**: `useProviders()`, `useProviderIncidents()`
**모델**: `useModels()`, `useMonthlyCosts(months)`
**기능**: `useFeatureUsage()`, `useWeeklyTrend(weeks)`, `useAdoptionRates()`
**프롬프트**: `usePrompts(category?)`, `usePromptById(id)`
**에이전트**: `useAgentStatus()`, `useAgentLogs(limit)`, `useDailyTrend()`

자세한 내용은 [services/README.md](/packages/ui/src/admin/services/README.md) 참고

## 특징

- **엔터프라이즈급**: 부서 관리, SSO, 감사 로그, ROI 분석
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 최적화
- **다크모드**: ThemeProvider 기반 전체 테마 지원
- **Mock API**: 개발 중 실제 API 없이 완전 기능 테스트
- **TypeScript**: 전체 타입 안정성 보장
- **Context 기반**: AdminServiceProvider로 깔끔한 데이터 흐름
- **접근성**: ARIA 레이블, 키보드 네비게이션, 시맨틱 마크업

## 배포

| 환경 | URL | 로컬 포트 |
|------|-----|----------|
| Production | https://hchat-admin.vercel.app | - |
| Development | localhost | 3002 |

Vercel 배포 설정: `apps/admin/vercel.json`

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰 (색상, 타이포그래피, 스페이싱)
- **@hchat/ui** — 기본 컴포넌트 (Badge, ThemeProvider, ThemeToggle)
