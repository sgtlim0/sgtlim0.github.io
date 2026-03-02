# ROI 대시보드 컴포넌트

H Chat의 ROI(Return on Investment) 분석 대시보드 컴포넌트 패키지입니다.

## 사용 앱

- **apps/admin** — ROI 대시보드 페이지

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { ROIDataProvider, ROIOverview, DateFilter } from '@hchat/ui/roi';

export default function ROIDashboard() {
  return (
    <ROIDataProvider>
      <DateFilter />
      <ROIOverview />
    </ROIDataProvider>
  );
}
```

## 컴포넌트 분류

### 페이지 (9개)

| 페이지 | 설명 |
|-------|------|
| **ROIDataUpload** | 데이터 업로드 페이지 |
| **ROIOverview** | ROI 개요 대시보드 |
| **ROIAdoption** | 도입률 분석 |
| **ROIProductivity** | 생산성 향상도 |
| **ROIAnalysis** | 상세 분석 |
| **ROIOrganization** | 조직별 현황 |
| **ROISentiment** | 사용자 만족도 (감정) |
| **ROIReports** | 보고서 생성 |
| **ROISettings** | 대시보드 설정 |

### 차트 (순수 SVG/CSS, 라이브러리 없음)

| 차트 | 설명 |
|-----|------|
| **MiniLineChart** | 소형 선 그래프 |
| **DonutChart** | 도넛 차트 |
| **MiniBarChart** | 소형 막대 차트 |
| **AreaChart** | 영역 차트 |
| **RadarChart** | 레이더 차트 |

### 필터

| 컴포넌트 | 설명 |
|---------|------|
| **DateFilter** | 날짜 범위 필터 |
| **DepartmentFilter** | 부서별 필터 |

### 유틸리티 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| **KPICard** | KPI 핵심지표 카드 |
| **ROISidebar** | 대시보드 사이드바 네비게이션 |
| **ChartPlaceholder** | 차트 로딩 플레이스홀더 |
| **InsightCard** | 인사이트 정보 카드 |
| **SurveyBar** | 설문조사 바 |
| **HeatmapCell** | 히트맵 셀 |

## Context API

### ROIDataContext

업로드된 데이터를 관리하고 모든 차트에 연동합니다.

```tsx
import { ROIDataProvider, useROIData } from '@hchat/ui/roi';

function MyComponent() {
  const { data, loading, error } = useROIData();
  return <div>{/* 데이터 활용 */}</div>;
}
```

## 특징

- 업로드 데이터 자동 연동
- 순수 SVG/CSS 차트 (외부 라이브러리 불필요)
- 다크모드 지원
- TypeScript 완전 지원
- 반응형 레이아웃

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰
- **@hchat/ui** — 기본 컴포넌트
