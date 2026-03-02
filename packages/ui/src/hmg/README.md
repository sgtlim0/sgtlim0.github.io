# HMG 공식사이트 컴포넌트

현대자동차그룹(HMG) 공식사이트에 사용되는 UI 컴포넌트 패키지입니다.

## 사용 앱

- **apps/hmg** — H Chat 공식사이트

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { GNB, HeroBanner, TabFilter, Footer } from '@hchat/ui/hmg';

export default function HomePage() {
  return (
    <>
      <GNB />
      <HeroBanner />
      <TabFilter />
      <Footer />
    </>
  );
}
```

## 컴포넌트 목록

| 컴포넌트 | 설명 |
|---------|------|
| **GNB** | 페이지 상단 네비게이션 바 |
| **HeroBanner** | 대형 배너 컴포넌트 |
| **TabFilter** | 탭 기반 필터링 컴포넌트 |
| **Footer** | 페이지 하단 푸터 |
| **HmgStatCard** | 통계 정보 카드 |
| **StepItem** | 단계별 가이드 항목 |
| **DownloadItem** | 다운로드 리스트 항목 |
| **PillButton** | 알약 형태 버튼 |

## 특징

- 다크모드 지원 (ThemeProvider)
- Tailwind CSS 스타일링
- TypeScript 완전 지원
- 반응형 레이아웃

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰 (색상, 타이포그래피)
- **@hchat/ui** — 기본 컴포넌트 (Badge, ThemeToggle)
