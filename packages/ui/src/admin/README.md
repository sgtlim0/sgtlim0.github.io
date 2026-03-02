# Admin 관리자 패널 컴포넌트

H Chat 관리자 패널(Admin Dashboard)에 사용되는 UI 컴포넌트 및 관리 기능 패키지입니다.

## 사용 앱

- **apps/admin** — H Chat 관리자 대시보드

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { AdminDashboard, StatCard, DataTable } from '@hchat/ui/admin';
import { AdminServiceProvider } from '@hchat/ui/admin/services';

export default function AdminLayout({ children }) {
  return (
    <AdminServiceProvider>
      {children}
    </AdminServiceProvider>
  );
}
```

## 컴포넌트 분류

### 기본 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| **StatusBadge** | 상태 표시 배지 |
| **MonthPicker** | 월 선택 달력 위젯 |
| **StatCard** | 통계 수치 카드 |
| **DataTable** | 데이터 테이블 |
| **BarChartRow** | 수평 막대 차트 행 |
| **UserCard** | 사용자 정보 카드 |
| **SettingsRow** | 설정 행 항목 |

### 대시보드 페이지

| 컴포넌트 | 설명 |
|---------|------|
| **AdminDashboard** | 메인 대시보드 |
| **AdminUsageHistory** | 사용 이력 조회 |
| **AdminStatistics** | 통계 분석 |
| **AdminUserManagement** | 사용자 관리 |
| **AdminSettings** | 설정 관리 |

### 고급 기능

| 컴포넌트 | 설명 |
|---------|------|
| **AdminProviderStatus** | API 제공자 상태 모니터링 |
| **AdminModelPricing** | 모델 가격 관리 |
| **AdminPromptLibrary** | 프롬프트 라이브러리 관리 |
| **AdminAgentMonitoring** | 에이전트 실행 모니터링 |
| **AdminFeatureUsage** | 기능 사용량 분석 |
| **DepartmentManagement** | 부서 관리 |
| **AuditLogViewer** | 감사 로그 조회 |
| **SSOConfigPanel** | SSO 설정 관리 |

### 인증

- **LoginPage** — 관리자 로그인 페이지
- **auth/** — 인증 관련 컴포넌트

### 서비스 레이어

API 데이터 페칭 및 상태 관리는 `@hchat/ui/admin/services`에서 제공됩니다.

자세한 내용은 [services/README.md](/packages/ui/src/admin/services/README.md) 참고

## 특징

- 다크모드 지원
- Mock API 및 실제 API 연동 가능
- Context 기반 상태 관리
- TypeScript 완전 지원
- 반응형 레이아웃

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰
- **@hchat/ui** — 기본 컴포넌트
