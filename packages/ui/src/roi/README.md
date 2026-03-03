# ROI 대시보드 컴포넌트

H Chat의 ROI(Return on Investment) 분석 대시보드 컴포넌트 패키지입니다. 실시간 데이터 시각화, 분석 리포팅, 부서별 성과 추적을 지원합니다.

## 사용 앱

- **apps/admin** — ROI 대시보드 페이지 (https://hchat-admin.vercel.app)

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { ROIDataProvider, useROIData, ROIOverview, DateFilter } from '@hchat/ui/roi';

export default function ROIDashboard() {
  return (
    <ROIDataProvider>
      <DateFilter />
      <ROIOverview />
    </ROIDataProvider>
  );
}

function MyROIComponent() {
  const { records, aggregated, hasData } = useROIData();
  if (!hasData) return <p>데이터를 업로드해주세요.</p>;
  return <div>{/* 집계 데이터 활용 */}</div>;
}
```

## 컴포넌트 분류

### 페이지 (9개)

모든 페이지는 실시간 차트 표시 (스트리밍, 도넛, 영역, 막대, 레이더 차트 포함)

| 페이지 | 설명 | 차트 |
|-------|------|------|
| **ROIDataUpload** | CSV 데이터 업로드 및 파싱 | - |
| **ROIOverview** | ROI 개요 및 KPI 대시보드 | MiniLineChart, KPICard |
| **ROIAdoption** | AI 도입률 분석 | DonutChart, 도입률 지표 |
| **ROIProductivity** | 생산성 향상도 및 효율성 | AreaChart, 생산성 메트릭 |
| **ROIAnalysis** | 상세 분석 및 비교 | MiniBarChart, 다중 지표 |
| **ROIOrganization** | 조직별 현황 및 성과 | RadarChart, 부서별 데이터 |
| **ROISentiment** | 사용자 만족도 (감정 분석) | HeatmapCell, 만족도 지수 |
| **ROIReports** | 보고서 생성 및 다운로드 | - |
| **ROISettings** | 대시보드 설정 및 필터 | - |

### 차트 컴포넌트 (5개, 순수 SVG/CSS)

`packages/ui/src/roi/charts/` 디렉토리에 위치

| 차트 | 설명 | 사용 사례 |
|-----|------|---------|
| **MiniLineChart** | 소형 선 그래프 (시간 추이) | 월별 ROI 추이, 누적 절감액 |
| **DonutChart** | 도넛 차트 (비율 표시) | 도입률, 만족도 분포 |
| **MiniBarChart** | 소형 막대 차트 (카테고리 비교) | 부서별 성과, 월별 지표 |
| **AreaChart** | 영역 차트 (누적 추이) | 누적 절감액, 누적 생산성 향상 |
| **RadarChart** | 레이더 차트 (다중 지표) | 부서별 종합 평가, 다각적 분석 |

### 필터 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| **DateFilter** | 날짜 범위 필터 (시작일~종료일) |
| **DepartmentFilter** | 부서별 필터 (조직 선택) |

### 유틸리티 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| **KPICard** | KPI 핵심지표 카드 (값, 변화율, 상태) |
| **ROISidebar** | 대시보드 사이드바 네비게이션 (페이지 링크) |
| **ChartPlaceholder** | 차트 로딩 플레이스홀더 |
| **InsightCard** | 인사이트 정보 카드 (발견사항) |
| **SurveyBar** | 설문조사 결과 바 |
| **HeatmapCell** | 히트맵 셀 (만족도 시각화) |

## Context API

### ROIDataContext

업로드된 CSV 데이터를 파싱하고 집계하여 모든 차트와 컴포넌트에 공급합니다.

```tsx
import { ROIDataProvider, useROIData } from '@hchat/ui/roi';

export function MyComponent() {
  const { records, aggregated, hasData, setRecords, clearRecords } = useROIData();

  // records: ParsedRecord[] — 파싱된 CSV 행 데이터
  // aggregated: AggregatedData | null — 집계된 분석 데이터
  // hasData: boolean — 데이터 여부

  return hasData ? (
    <div>
      총 레코드: {records.length}
      ROI 평균: {aggregated?.roiMetrics?.average}%
    </div>
  ) : (
    <p>데이터를 업로드해주세요.</p>
  );
}
```

### aggregateData.ts

CSV 데이터를 ROI 분석에 필요한 통계로 변환합니다.

```typescript
export interface AggregatedData {
  roiMetrics: { average: number; min: number; max: number };
  adoptionRate: number;
  productivityGain: number;
  costSavings: number;
  departmentPerformance: Record<string, number>;
  timeSeriesData: Array<{ date: string; value: number }>;
  // ... 추가 집계 데이터
}

export function aggregateAll(records: ParsedRecord[]): AggregatedData
```

## 특징

- 완전한 데이터 수집 및 분석 파이프라인
- 순수 SVG/CSS 차트 (외부 라이브러리 불필요)
- Context API 기반 전역 데이터 관리
- CSV 데이터 파싱 및 집계
- 실시간 데이터 동기화
- 다크모드 지원
- TypeScript 완전 지원
- 반응형 레이아웃

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰
- **@hchat/ui** — 기본 컴포넌트
