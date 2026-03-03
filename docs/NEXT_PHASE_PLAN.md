# H Chat 다음 단계 계획 (Phase 21~25)

> 작성일: 2026-03-03
> 현재 상태: Phase 20 완료, 모노레포 7개 앱 + 별도 레포 2개
> 완료 현황: 7개 앱 배포, 100+ 컴포넌트, 60+ 페이지, 53+ 스토리, 12 E2E 테스트

---

## Phase 21: Storybook 완성 + 디자인 시스템 정리

**목표**: 전체 컴포넌트 카탈로그 완성 및 디자인 시스템 문서화

### 21-1. 누락된 Storybook 스토리 추가
- [ ] LLM Router 컴포넌트 스토리 6개 (LRNavbar, ModelTable, CodeBlock, ProviderBadge, PriceCell, DocsSidebar)
- [ ] ROI 차트 컴포넌트 스토리 보강 5개 (MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart 인터랙션)
- [ ] Enterprise 컴포넌트 스토리 3개 (DepartmentManagement, AuditLogViewer, SSOConfigPanel)
- [ ] 목표: 70개+ 스토리

### 21-2. 디자인 토큰 문서화
- [ ] `packages/tokens/` 토큰 README — 색상, 타이포그래피, 스페이싱 문서
- [ ] 토큰 미리보기 Storybook 페이지 (색상 팔레트, 스케일)
- [ ] 앱별 커스텀 토큰 정리 (--roi-*, --lr-*, --user-*)

### 21-3. Storybook 배포 검증
- [ ] Vercel 재배포 확인 (일일 한도 리셋 후)
- [ ] 모든 스토리 렌더링 정상 확인
- [ ] Accessibility addon 동작 확인

**산출물**: 70개+ 스토리, 디자인 토큰 문서, Storybook 배포 검증

---

## Phase 22: API 서비스 레이어 + UX 폴리싱

**목표**: Mock 데이터를 API 서비스 레이어로 추상화, 로딩/에러 상태 UI 완성

### 22-1. API 서비스 레이어 통합
- [ ] Admin: Enterprise API 서비스를 통합 DataService로 리팩토링
- [ ] User: chatService, assistantService를 API-ready 인터페이스로 전환
- [ ] LLM Router: 모델 목록, 사용량 통계를 API 호출 형태로 추상화

### 22-2. 로딩/에러 상태 UI
- [ ] 스켈레톤 로더 컴포넌트 (테이블, 카드, 차트용)
- [ ] 에러 바운더리 + 재시도 UI
- [ ] 빈 상태 (Empty State) 일러스트레이션
- [ ] 토스트 알림 시스템

### 22-3. 폼 유효성 검증
- [ ] Admin 설정 폼: SSO, 모델 가격 등 입력값 검증
- [ ] LLM Router: 로그인/회원가입 폼 유효성
- [ ] User: 비서 생성 폼 유효성

**산출물**: DataService 추상화, 스켈레톤/에러/토스트 컴포넌트, 폼 검증

---

## Phase 23: 성능 최적화 + 번들 분석

**목표**: Core Web Vitals 개선 및 빌드 크기 최적화

### 23-1. 번들 분석
- [ ] 각 앱별 `@next/bundle-analyzer` 설정
- [ ] 불필요한 의존성 식별 및 제거
- [ ] Dynamic import 적용 (차트, 코드 블록, 모달)

### 23-2. 이미지 최적화
- [ ] Next.js Image 컴포넌트 적용
- [ ] OG Image 자동 생성 (각 앱별)
- [ ] Favicon/PWA 아이콘 정리

### 23-3. Lighthouse 점수 개선
- [ ] baseline 측정 (현재 Lighthouse CI 실행)
- [ ] Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Accessibility: 90+ / SEO: 90+

### 23-4. 코드 분할
- [ ] Route-based code splitting 확인
- [ ] 공용 청크 최적화 (Turborepo build 캐시)

**산출물**: 번들 리포트, Lighthouse 개선 결과, 이미지 최적화

---

## Phase 24: CI/CD 파이프라인 강화

**목표**: 자동화된 품질 게이트 및 배포 파이프라인

### 24-1. GitHub Actions 워크플로우 확장
- [ ] PR 시 자동: lint + type-check + build (Turborepo)
- [ ] E2E 테스트 자동 실행 (배포 URL 대상)
- [ ] Lighthouse CI PR 코멘트 (점수 변화 표시)
- [ ] 번들 크기 비교 PR 코멘트

### 24-2. 배포 자동화
- [ ] Vercel Preview Deploy 설정 (PR별 미리보기)
- [ ] 환경별 변수 관리 (dev/staging/prod)
- [ ] 배포 후 헬스체크 자동 검증

### 24-3. 코드 품질
- [ ] ESLint 규칙 통일 (모든 앱 동일 설정)
- [ ] Prettier 자동 적용
- [ ] Husky pre-commit hook (lint-staged)

**산출물**: CI/CD 워크플로우, Preview Deploy, 코드 품질 자동화

---

## Phase 25: 통합 테스트 + 문서 최종화

**목표**: 전체 플랫폼 품질 검증 및 프로젝트 문서 마무리

### 25-1. E2E 테스트 확장
- [ ] 크로스 앱 네비게이션 테스트 (랜딩 → 각 앱)
- [ ] 다크모드 일관성 테스트 (모든 앱)
- [ ] 반응형 레이아웃 테스트 (모바일/태블릿/데스크톱)
- [ ] 접근성 자동 테스트 (axe-core 기반)

### 25-2. 단위 테스트 추가
- [ ] packages/ui 컴포넌트 단위 테스트 (Vitest + Testing Library)
- [ ] 목표: 80%+ 커버리지
- [ ] 유틸리티 함수 테스트 (aggregateData, mockData 등)

### 25-3. 프로젝트 문서 최종화
- [ ] 전체 아키텍처 다이어그램 (Mermaid)
- [ ] 기여 가이드 (CONTRIBUTING.md)
- [ ] 배포 가이드 (각 앱별 Vercel 설정)
- [ ] API 스펙 문서 (Enterprise API)

### 25-4. 데모 시나리오
- [ ] 포트폴리오 발표용 데모 스크립트 작성
- [ ] 각 앱별 주요 기능 시연 순서 정리
- [ ] 스크린샷/GIF 캡처

**산출물**: E2E/단위 테스트, 아키텍처 문서, 데모 시나리오

---

## 우선순위 및 의존성

```
Phase 21 (Storybook 완성)    ──┐
Phase 22 (API 추상화)         ──┼── 병렬 실행 가능
Phase 24 (CI/CD)              ──┘
                                ↓
Phase 23 (성능 최적화)         ── Phase 22 이후 권장
                                ↓
Phase 25 (통합 테스트 + 문서)  ── 최종 마무리
```

---

## 장기 로드맵 (Phase 26+)

| 작업 | 설명 |
|------|------|
| Desktop 모노레포 통합 | hchat-desktop을 모노레포로 이전 또는 서브모듈 연결 |
| Extension 연동 | hchat-v2-extension과 Admin 사용량 데이터 실시간 연동 |
| 실시간 대시보드 | WebSocket 기반 Admin 실시간 모니터링 |
| 다국어 확장 | 일본어, 중국어 추가 (현재 한/영) |
| AI 모델 실연동 | LLM Router에서 실제 AI 모델 API 호출 |
| 모바일 앱 | React Native 또는 PWA 기반 모바일 클라이언트 |

---

## 성공 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 앱 배포 | 7개 | 7개 ✅ |
| Storybook 스토리 | 53개+ | 70개+ |
| E2E 테스트 | 12개 | 25개+ |
| Lighthouse a11y | 미측정 | 90+ |
| 단위 테스트 커버리지 | 0% | 80%+ |
| 컴포넌트 | 100개+ | 120개+ |
| 페이지 | 60개+ | 65개+ |
