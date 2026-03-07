# H Chat 다음 단계 계획 (Phase 36~54)

> 작성일: 2026-03-07
> 현재 상태: Phase 35 완료, 모노레포 8개 앱 + 별도 레포 2개
> 완료 현황: 8개 앱 배포, 128 컴포넌트, 55 페이지, 126 스토리 파일, 284 테스트

---

## Phase 21~35 완료 요약

| Phase | 주요 작업 | 상태 |
|-------|----------|------|
| 21 | Storybook 73개+ 완성, 디자인 토큰 문서 | ✅ |
| 22 | API 서비스 레이어 (Admin/User/LLM Router Provider Pattern) | ✅ |
| 23 | 성능 최적화 (Dynamic Import, Bundle Analyzer, Turbo 캐시) | ✅ |
| 24 | CI/CD (Lighthouse CI, Prettier + Husky + lint-staged) | ✅ |
| 25 | 통합 테스트 (18 E2E, ARCHITECTURE/API_SPEC/DEMO 문서) | ✅ |
| 26 | Storybook 103개 (Shared 카테고리, 97% 커버리지) | ✅ |
| 27 | PROJECT_ANALYSIS 심층 분석, 전체 문서 정비 | ✅ |
| 28 | 단위 테스트 (Vitest 4, 20파일 ~284 테스트) | ✅ |
| 29 | 실시간 대시보드 (4종 Live 컴포넌트) | ✅ |
| 30 | SSE 스트리밍 (StreamingPlayground, ModelComparison) | ✅ |
| 31 | Desktop 모노레포 통합 (5페이지, 7 컴포넌트, 24 토큰) | ✅ |
| 32 | 알림 시스템 (Mock WebSocket, 4 UI, 2 훅, 18 템플릿) | ✅ |
| 33 | 대시보드 커스터마이징 (10종 위젯, CSS Grid, localStorage) | ✅ |
| 34 | AI 워크플로우 빌더 (8종 노드, SVG 엣지, 4 템플릿) | ✅ |
| 35 | 모바일 앱 (PWA, 7 컴포넌트, 스와이프 제스처) | ✅ |

---

## Phase 36: 테스트 커버리지 80% 달성 [ ]

**목표**: 현재 4.3% (20/463) → 80%+ 단위 테스트 커버리지

### 36-1. 핵심 서비스 테스트 (최우선)
- [ ] chatService 전체 메서드 (send, stream, history, CRUD)
- [ ] mockApiService 전체 메서드 (providers, models, features, departments)
- [ ] workflowService (노드 CRUD, 엣지 연결, 실행 시뮬레이션)
- [ ] widgetService (위젯 CRUD, 레이아웃 저장/복원)
- [ ] notificationService (구독, 해제, 읽음 표시)
- [ ] mobileService (채팅, 어시스턴트, 히스토리, 설정)

### 36-2. UI 컴포넌트 테스트
- [ ] ChatPage (메시지 전송, SSE 응답, 대화 전환)
- [ ] WorkflowBuilder (노드 추가/삭제, 엣지 연결)
- [ ] CustomDashboard (위젯 추가/제거, 레이아웃 변경)
- [ ] StreamingPlayground (모델 선택, 파라미터, 스트리밍)
- [ ] NotificationPanel (알림 목록, 읽음 처리, 설정)

### 36-3. 훅 테스트
- [ ] useDashboardLayout (13개 액션)
- [ ] useStreamingChat (스트리밍, abort, onComplete)
- [ ] useNotifications + useNotificationBadge
- [ ] useSwipeGesture (터치 이벤트)
- [ ] useFormValidation (검증 규칙, 에러 메시지)

### 36-4. CI 강화
- [ ] --coverage.thresholds 설정 (statements: 80, branches: 75, functions: 80, lines: 80)
- [ ] PR 코멘트 커버리지 요약
- [ ] MSW(Mock Service Worker) 도입

**산출물**: 80%+ 커버리지, MSW 모킹, CI 임계값 강화

---

## Phase 37: @hchat/ui 패키지 분리 [ ]

**목표**: 23,385줄 → 도메인별 서브패키지 분리

### 37-1. 패키지 분리
- [ ] `@hchat/ui-core` (root 컴포넌트: Badge, Theme, Toast, Skeleton, etc.)
- [ ] `@hchat/ui-admin` (admin/ + roi/ = 95파일)
- [ ] `@hchat/ui-user` (user/ = 34파일)
- [ ] `@hchat/ui-llm-router` (llm-router/ = 22파일)
- [ ] `@hchat/ui-mobile` (mobile/ = 12파일)
- [ ] `@hchat/ui-desktop` (desktop/ = 8파일)

### 37-2. 마이그레이션
- [ ] import 경로 자동 변환 스크립트 (codemod)
- [ ] Turborepo 의존성 그래프 업데이트
- [ ] Storybook alias 업데이트
- [ ] CI 빌드 검증

**산출물**: 6개 UI 서브패키지, 빌드 독립성, tree-shaking 개선

---

## Phase 38: Storybook Interaction Tests [ ]

**목표**: play() 함수 기반 사용자 시나리오 자동 검증

### 38-1. 테스트 작성
- [ ] Admin: 로그인 폼 → 대시보드 진입
- [ ] Admin: ROI 차트 호버/클릭 인터랙션
- [ ] Admin: 위젯 드래그앤드롭 레이아웃
- [ ] User: 채팅 메시지 전송 → SSE 응답
- [ ] User: 커스텀 비서 생성 모달
- [ ] LLM Router: 모델 테이블 정렬/필터
- [ ] LLM Router: Playground 파라미터 조절

### 38-2. CI 통합
- [ ] @storybook/test 설정
- [ ] test-storybook CLI 통합
- [ ] GitHub Actions workflow 추가

**산출물**: 15+ interaction tests, CI 자동 실행

---

## Phase 39: 멀티테넌트 시스템 [ ]

**목표**: 조직별 격리, 커스텀 브랜딩

- [ ] TenantProvider + useTenant 컨텍스트
- [ ] 조직별 CSS 변수 동적 오버라이드
- [ ] 데이터 파티셔닝 (테넌트 ID 기반)
- [ ] 테넌트 관리 Admin 페이지
- [ ] 테넌트별 커스터마이징 (로고, 컬러, 이름)

**산출물**: 멀티테넌트 아키텍처, 테넌트 관리 UI

---

## Phase 40: AI 에이전트 마켓플레이스 [ ]

**목표**: 커뮤니티 에이전트 공유/설치/평가 시스템

- [ ] 에이전트 카드 UI (설명, 평점, 설치수)
- [ ] 에이전트 상세 (README, 변경로그, 리뷰)
- [ ] 설치/제거 워크플로우
- [ ] 에이전트 빌더 (프롬프트+도구+모델 조합)
- [ ] 평가 시스템 (별점, 리뷰, 통계)

**산출물**: 마켓플레이스 UI, 에이전트 빌더, 평가 시스템

---

## Phase 41~54: 장기 로드맵

| Phase | 작업 | 핵심 기능 |
|-------|------|----------|
| 41 | 분석 엔진 고도화 | ML 이상 탐지, 예측 분석, 자동 인사이트 |
| 42 | RAG 문서 검색 | 벡터 DB, 임베딩 파이프라인, 하이브리드 검색 |
| 43 | 프롬프트 버전 관리 | 히스토리, A/B 테스트, 성과 비교 |
| 44 | SSO/SAML 실연동 | Okta/Azure AD, JWT, 세션 관리 |
| 45 | 채팅 히스토리 분석 | 대화 패턴, 주제 클러스터링, 행동 인사이트 |
| 46 | Admin 권한 고도화 | RBAC, 권한 매트릭스, 위임 |
| 47 | AI 모델 벤치마크 | 자동 품질/속도/비용 벤치마크, 추천 엔진 |
| 48 | 피드백 루프 | 인라인 피드백, A/B 자동화, 프롬프트 튜닝 |
| 49 | 알림 규칙 엔진 | 조건 빌더, Slack/Teams 웹훅, 에스컬레이션 |
| 50 | 팀 협업 채팅 | WebSocket, 멘션, 스레드, 파일 공유 |
| 51 | AI 파인튜닝 | 학습 데이터셋, 진행 대시보드, 평가 메트릭 |
| 52 | 데이터 시각화 고도화 | D3.js, 드릴다운, 애니메이션 |
| 53 | 지식 그래프 | force-directed graph, NER 태깅, 검색 연동 |
| 54 | 음성 인터페이스 | STT/TTS, 음성 명령, 회의 요약 |

---

## 우선순위 및 의존성

```
Phase 36 (테스트 80%)        ──┐
Phase 37 (UI 패키지 분리)     ──┼── 병렬 실행 가능 (기반 강화)
Phase 38 (Interaction Tests)  ──┘
                               ↓
Phase 39 (멀티테넌트)         ──┐
Phase 40 (에이전트 마켓)       ──┼── 병렬 실행 가능 (기능 확장)
Phase 41 (분석 엔진)           ──┘
                               ↓
Phase 42~54 (장기 로드맵)     ── 순서 유연, 비즈니스 우선순위에 따라
```

---

## 성공 지표

| 지표 | Phase 35 현재 | Phase 40 목표 |
|------|--------------|---------------|
| 단위 테스트 커버리지 | 4.3% | 80%+ |
| UI 패키지 수 | 1 (monolithic) | 6 (domain-split) |
| Interaction Tests | 0 | 15+ |
| Storybook 스토리 | 126 파일 | 150+ 파일 |
| 앱 배포 | 8개 | 8개 |
| 컴포넌트 | 128개 | 150+ |
| 페이지 | 55개 | 65+ |
