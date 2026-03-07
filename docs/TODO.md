# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-07 | Phase 35 완료 기준

---

## 현재 배포 상태

| 앱 | URL | 플랫폼 | 상태 |
|---|---|---|---|
| Wiki (포트폴리오 허브) | https://sgtlim0.github.io | GitHub Pages | ✅ |
| HMG 공식사이트 | https://hchat-hmg.vercel.app | Vercel | ✅ |
| Admin 관리자 패널 | https://hchat-admin.vercel.app | Vercel | ✅ |
| User 사용자 앱 | https://hchat-user.vercel.app | Vercel | ✅ |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel | ✅ |
| Desktop | https://hchat-desktop.vercel.app | Vercel | ✅ |
| Mobile | https://hchat-mobile.vercel.app | Vercel | ✅ |
| Storybook | https://hchat-storybook.vercel.app | Vercel | ✅ |

---

## 프로젝트 수치 현황 (실측 2026-03-07)

| 항목 | 수량 |
|------|------|
| 앱 (모노레포) | 8개 (Wiki, HMG, Admin, User, LLM Router, Desktop, Mobile, Storybook) |
| 별도 레포 | 2개 (hchat-v2-extension, hchat-desktop) |
| UI 패키지 | 2개 (@hchat/tokens, @hchat/ui) |
| TS/TSX 파일 | 463개 |
| 총 코드 라인 | 40,060줄 (TS/TSX) |
| CSS 파일/LOC | 41개, 22,664줄 |
| UI 컴포넌트 | 128개 |
| 페이지 | 55개 (page.tsx) |
| 레이아웃 | 9개 (layout.tsx) |
| Storybook 스토리 | 126 파일 / ~151 스토리 |
| CSS 디자인 토큰 | 194개 (light + dark) |
| E2E 테스트 | 18개 파일 |
| 단위 테스트 | 20 파일, ~284 테스트 (Vitest) |
| Wiki 콘텐츠 | 28 페이지 (5개 섹션) |
| AI 모델 (LLM Router) | 86개 |
| 커스텀 훅 | 60개 |
| Git 커밋 | 97개 (56일간) |

---

## 완료된 Phase (1~35)

### Phase 1~10: Wiki + HMG + 모노레포 ✅
Next.js 16 + Tailwind CSS 4, 마크다운 위키 28페이지, HMG 4페이지, npm workspaces + Turborepo

### Phase 11~15: Admin + ROI + Enterprise API ✅
Admin 14페이지, ROI 9페이지, 5종 SVG 차트, Excel 업로드, 부서관리/감사로그/SSO

### Phase 16~18: User 앱 + 채팅 인터랙션 ✅
User 5페이지, SSE 스트리밍, 커스텀 비서 생성, 대화 검색

### Phase 19~20: LLM Router + E2E + Lighthouse ✅
LLM Router 10페이지, 86개 모델, 12개 E2E, WCAG 2.1 AA, Lighthouse CI

### Phase 21~22: Storybook + 서비스 레이어 ✅
73개+ 스토리, Admin/User/LLM Router Provider Pattern, Skeleton/Toast/ErrorBoundary

### Phase 23~24: 성능 최적화 + CI/CD ✅
Dynamic import, Bundle Analyzer, Turbo 캐시, Prettier + Husky + lint-staged

### Phase 25~27: 통합 테스트 + 문서 + 심층 분석 ✅
18개 E2E (반응형, 다크모드, a11y), 5개 프로젝트 문서, PROJECT_ANALYSIS.md

### Phase 28: 단위 테스트 기반 구축 ✅
Vitest 4 + @testing-library/react 16 + jsdom 28, 20파일 ~284 테스트, CI 통합

### Phase 29: 실시간 대시보드 ✅
Mock 실시간 데이터 스트리밍, 4종 Live 컴포넌트, 4개 커스텀 훅

### Phase 30: SSE 스트리밍 실연동 ✅
StreamingPlayground, ModelComparison, 7 프로바이더 레이턴시, API 키 유틸리티

### Phase 31: Desktop 모노레포 통합 ✅
apps/desktop/ 스캐폴딩 (5페이지), 7개 컴포넌트, 24개 디자인 토큰

### Phase 32: 알림 시스템 ✅
Mock WebSocket, 18개 한국어 템플릿, 4 UI + 2 훅, Admin 알림 페이지

### Phase 33: 대시보드 커스터마이징 ✅
10종 위젯, CSS Grid, 드래그앤드롭, localStorage 영속, 4 UI + 2 훅

### Phase 34: AI 워크플로우 빌더 ✅
8종 노드, SVG 베지어 엣지, 4개 템플릿, Mock 순차 실행, 5 UI

### Phase 35: 모바일 앱 ✅
PWA 480px, 7개 모바일 컴포넌트, 스와이프 제스처, mobileService + 5 훅

---

## 다음 계획 (Phase 36~54)

### Phase 36: 테스트 커버리지 80% 달성 [ ]

**목표**: 현재 4.3% → 80%+ 단위 테스트 커버리지

- [ ] 핵심 서비스 테스트: chatService, mockApiService, aggregateData, workflowService
- [ ] UI 컴포넌트 테스트: ChatPage, WorkflowBuilder, CustomDashboard, StreamingPlayground
- [ ] 훅 테스트: useDashboardLayout, useStreamingChat, useNotifications, useSwipeGesture
- [ ] CI 커버리지 임계값 강화 (--coverage.thresholds)
- [ ] MSW(Mock Service Worker) 도입으로 네트워크 레벨 모킹

### Phase 37: @hchat/ui 패키지 분리 [ ]

**목표**: 23,385줄 단일 패키지 → 도메인별 서브패키지

- [ ] `@hchat/ui-admin` (68파일) 분리
- [ ] `@hchat/ui-user` (34파일) 분리
- [ ] `@hchat/ui-llm-router` (22파일) 분리
- [ ] 배럴 export 정리 (admin/index.ts 46→도메인별 분산)
- [ ] Turborepo 의존성 그래프 업데이트
- [ ] 기존 import 경로 마이그레이션 스크립트

### Phase 38: Storybook Interaction Tests [ ]

**목표**: play() 함수 기반 사용자 시나리오 자동 검증

- [ ] Admin: 로그인 폼 제출, ROI 차트 인터랙션, 위젯 드래그앤드롭
- [ ] User: 채팅 메시지 전송, 비서 생성 모달, 파일 업로드
- [ ] LLM Router: 모델 필터링/정렬, Playground 파라미터 조절
- [ ] @storybook/test 설정 + CI 통합

### Phase 39: 멀티테넌트 시스템 [ ]

**목표**: 조직별 격리, 커스텀 브랜딩

- [ ] 테넌트 컨텍스트 (TenantProvider, useTenant)
- [ ] 조직별 토큰 오버라이드 (CSS 변수 동적 주입)
- [ ] 데이터 파티셔닝 (테넌트 ID 기반 필터링)
- [ ] 테넌트 관리 Admin 페이지 (생성/수정/삭제)
- [ ] 테넌트별 로고, 컬러, 이름 커스터마이징

### Phase 40: AI 에이전트 마켓플레이스 [ ]

**목표**: 커뮤니티 에이전트 공유/설치/평가 시스템

- [ ] 에이전트 카드 UI (설명, 평점, 설치수, 카테고리)
- [ ] 에이전트 상세 페이지 (README, 변경로그, 리뷰)
- [ ] 설치/제거 워크플로우 (의존성 체크, 권한 요청)
- [ ] 에이전트 빌더 (프롬프트/도구/모델 조합 에디터)
- [ ] 평가 시스템 (별점, 리뷰, 사용량 통계)

### Phase 41: 분석 엔진 고도화 [ ]

**목표**: ML 기반 이상 탐지, 예측 분석, 자동 인사이트

- [ ] 시계열 이상 탐지 (z-score, IQR 기반)
- [ ] 사용량 예측 (선형 회귀, 이동 평균)
- [ ] 자동 인사이트 생성 (패턴 감지 → 자연어 설명)
- [ ] 대시보드 위젯으로 인사이트 표시
- [ ] 알림 연동 (이상 감지 시 자동 알림)

### Phase 42: RAG 문서 검색 [ ]

**목표**: 벡터 DB 기반 사내 문서 검색

- [ ] 임베딩 파이프라인 (OpenAI/Cohere 임베딩)
- [ ] 청킹 전략 (문단/섹션/슬라이딩 윈도우)
- [ ] 벡터 검색 UI (질의 입력, 관련 문서 카드)
- [ ] 하이브리드 검색 (키워드 + 시맨틱)
- [ ] 출처 표시 (문서명, 섹션, 하이라이트)

### Phase 43: 프롬프트 버전 관리 [ ]

**목표**: 프롬프트 히스토리, A/B 테스트

- [ ] 프롬프트 에디터 (버전 히스토리, diff 비교)
- [ ] A/B 테스트 설정 (트래픽 분배, 기간 설정)
- [ ] 성과 비교 대시보드 (응답 품질, 속도, 비용)
- [ ] 프롬프트 라이브러리 공유 (팀 내 공유/포크)
- [ ] 롤백 기능 (이전 버전으로 즉시 복원)

### Phase 44: SSO/SAML 실연동 [ ]

**목표**: Okta/Azure AD SAML 2.0 실연동

- [ ] SAML 2.0 SP 구현 (metadata, assertion consumer)
- [ ] Okta/Azure AD IdP 연동 테스트
- [ ] JWT 토큰 발급/검증 (RS256, 리프레시 토큰)
- [ ] 세션 관리 (갱신, 만료, 강제 로그아웃)
- [ ] SSO 설정 관리 페이지 (기존 Mock → 실연동)

### Phase 45: 채팅 히스토리 분석 [ ]

**목표**: 대화 패턴 시각화, 주제 클러스터링

- [ ] 대화 통계 대시보드 (일별/주별/월별 추이)
- [ ] 주제 클러스터링 (TF-IDF + k-means 시각화)
- [ ] 사용자 행동 인사이트 (자주 쓰는 기능, 피크 시간)
- [ ] 대화 품질 분석 (응답 시간, 사용자 만족도)
- [ ] 내보내기 (CSV, PDF 리포트)

### Phase 46: Admin 권한 관리 고도화 [ ]

**목표**: RBAC (역할 기반 접근 제어)

- [ ] 역할 정의 (admin, manager, viewer, custom)
- [ ] 권한 매트릭스 UI (리소스 × 액션 체크박스)
- [ ] 페이지/기능별 접근 제어 (PermissionGate 컴포넌트)
- [ ] 감사 추적 강화 (권한 변경 로그)
- [ ] 위임 기능 (일시적 권한 부여/해제)

### Phase 47: AI 모델 벤치마크 [ ]

**목표**: 모델별 응답 품질/속도/비용 자동 벤치마크

- [ ] 벤치마크 테스트 스위트 (10개 표준 질문)
- [ ] 자동 실행 스케줄러 (일간/주간)
- [ ] 비교 리포트 (레이더 차트, 랭킹 테이블)
- [ ] 모델 추천 엔진 (용도별 최적 모델 제안)
- [ ] 벤치마크 히스토리 (성능 변화 추이)

### Phase 48: 피드백 루프 시스템 [ ]

**목표**: 사용자 만족도 수집, 응답 평가, A/B 자동화

- [ ] 인라인 피드백 (👍/👎, 별점, 코멘트)
- [ ] 피드백 대시보드 (시간별 추이, 모델별 비교)
- [ ] 자동 A/B 테스트 (트래픽 분배, 승자 자동 배포)
- [ ] 피드백 기반 프롬프트 튜닝 제안
- [ ] 피드백 내보내기 (CSV, API)

### Phase 49: 모니터링 알림 규칙 엔진 [ ]

**목표**: 커스텀 알림 조건 빌더

- [ ] 규칙 빌더 UI (조건 조합: AND/OR, 임계값, 기간)
- [ ] 알림 채널 (이메일, Slack, Teams 웹훅)
- [ ] 에스컬레이션 정책 (단계별 알림, 자동 해제)
- [ ] 알림 히스토리 + 통계
- [ ] 프리셋 규칙 템플릿 (API 오류율, 비용 초과, 사용량 급증)

### Phase 50: 팀 협업 채팅 [ ]

**목표**: 실시간 멀티유저 채팅방

- [ ] 채팅방 CRUD (생성, 초대, 나가기)
- [ ] 실시간 메시지 (WebSocket, presence 표시)
- [ ] 멘션 (@user), 스레드 (답글), 리액션
- [ ] 파일 공유 (드래그앤드롭, 미리보기)
- [ ] AI 비서 공유 (팀 내 비서 결과 공유)

### Phase 51: AI 모델 파인튜닝 [ ]

**목표**: 사내 데이터 기반 모델 커스터마이징

- [ ] 학습 데이터셋 관리 (업로드, 검증, 전처리)
- [ ] 파인튜닝 작업 관리 (시작, 진행률, 완료)
- [ ] 학습 진행 대시보드 (loss 차트, 에포크)
- [ ] 평가 메트릭 (기본 vs 파인튜닝 비교)
- [ ] 모델 배포 (파인튜닝 모델 → LLM Router 등록)

### Phase 52: 데이터 시각화 고도화 [ ]

**목표**: D3.js 기반 인터랙티브 차트

- [ ] D3.js 차트 라이브러리 래퍼 (현재 SVG → D3 마이그레이션)
- [ ] 드릴다운 (차트 클릭 → 상세 데이터)
- [ ] 커스텀 대시보드 위젯 (사용자 정의 차트)
- [ ] 애니메이션 전환 (데이터 변경 시 부드러운 트랜지션)
- [ ] 차트 내보내기 (PNG, SVG, PDF)

### Phase 53: 지식 그래프 [ ]

**목표**: 사내 문서/대화 기반 지식 네트워크

- [ ] 지식 노드 (문서, 개념, 인물, 프로젝트)
- [ ] 관계 시각화 (D3 force-directed graph)
- [ ] 자동 태깅 (NER 기반 엔티티 추출)
- [ ] 검색 연동 (지식 그래프 기반 관련 문서 추천)
- [ ] 그래프 편집 (노드/엣지 추가, 수정, 삭제)

### Phase 54: 음성 인터페이스 [ ]

**목표**: STT/TTS 통합, 음성 명령

- [ ] STT (Web Speech API / Whisper API)
- [ ] TTS (Web Speech API / ElevenLabs)
- [ ] 음성 명령 (채팅 전송, 페이지 이동)
- [ ] 실시간 회의 요약 (녹음 → 트랜스크립트 → 요약)
- [ ] 접근성 강화 (시각장애인 음성 네비게이션)

---

## 기술 부채

| # | 우선순위 | 항목 | 상태 |
|---|----------|------|------|
| 1 | CRITICAL | 단위 테스트 커버리지 | 20/463 파일 (4.3%), Phase 36에서 80% 목표 |
| 2 | CRITICAL | Mock → Real API 전환 | 전체 Mock, MSW 도입 후 점진적 전환 |
| 3 | HIGH | @hchat/ui 패키지 분리 | 23,385줄 단일 패키지, Phase 37에서 분리 |
| 4 | HIGH | Admin 배럴 export 비대 | index.ts 46 exports, tree-shaking 비효율 |
| 5 | HIGH | Storybook Interaction Tests | 0개, Phase 38에서 play() 함수 도입 |
| 6 | MEDIUM | console.log (소스) | 4개 (LLM Router login/signup) |
| 7 | MEDIUM | ChatPage.tsx 429줄 | 서브 컴포넌트 분리 필요 |
| 8 | MEDIUM | mockData.ts 1,099줄 | 프로바이더별 분리 필요 |
| 9 | LOW | i18n 키 커버리지 | HMG 49키만 지원, 전체 앱 확장 필요 |
| 10 | LOW | Admin 빌드 캐시 | .next 275MB, 캐시 정리 자동화 |
