# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-07 | Phase 60 완료 기준

---

## 현재 배포 상태

| 앱 | URL | 상태 |
|---|---|---|
| Wiki | https://sgtlim0.github.io | ✅ |
| HMG | https://hchat-hmg.vercel.app | ✅ |
| Admin | https://hchat-admin.vercel.app | ✅ |
| User | https://hchat-user.vercel.app | ✅ |
| LLM Router | https://hchat-llm-router.vercel.app | ✅ |
| Desktop | https://hchat-desktop.vercel.app | ✅ |
| Mobile | https://hchat-mobile.vercel.app | ✅ |
| Storybook | https://hchat-storybook.vercel.app | ✅ |

---

## 프로젝트 수치 현황 (실측 2026-03-07)

| 항목 | 수량 |
|------|------|
| 앱 (모노레포) | 8개 |
| TS/TSX 파일 | 530개 |
| 총 코드 라인 | 50,226줄 (TS/TSX) |
| @hchat/ui | 30,464줄 (61%) |
| UI 컴포넌트 | 144개 |
| 서비스 파일 | 41개 |
| 페이지 | 55개 (page.tsx) |
| 커스텀 훅 | 60개 |
| Storybook | 135 파일 |
| 단위 테스트 | 63+ 파일, 880+ 테스트 |
| E2E 테스트 | 18 파일 |
| Interaction Tests | 6 파일, 28 테스트 |
| MSW 핸들러 | 39 endpoints (8 도메인) |
| Git 커밋 | 123개 |
| 완료 Phase | 60개 |

---

## 완료된 Phase (1~44)

### Phase 1~35 ✅
Wiki + HMG + Admin(24p) + User(5p) + LLM Router(10p) + Desktop(5p) + Mobile(4tab) + Storybook + E2E 18파일 + 단위테스트 20파일

### Phase 36: 단위 테스트 확장 ✅
17개 신규 테스트 파일, 505→608 테스트, 커버리지 15%→35%

### Phase 37: 코드 품질 + 패키지 분리 준비 ✅
console.log 0개, 커버리지 임계값 30%, @hchat/ui exports 6→16 경로

### Phase 38: Storybook Interaction Tests ✅
6파일 28 인터랙션 (NotificationBell, CategoryFilter, ChatSearchBar, WidgetCard, WorkflowNodeCard, Toast)

### Phase 39: 멀티테넌트 시스템 ✅
tenantService (CRUD + CSS 변수 동적 오버라이드), TenantSelector, TenantManagement, Mock 3개 (현대/기아/제네시스)

### Phase 40: AI 에이전트 마켓플레이스 ✅
marketplaceService (필터/정렬/install), AgentMarketCard, AgentMarketGrid, Mock 10개 에이전트, 8 카테고리

### Phase 41: 분석 엔진 고도화 ✅
analyticsService (z-score 이상탐지, 선형회귀 예측, 자동 인사이트 생성), Mock 4종 시계열

### Phase 42: RAG 문서 검색 ✅
ragService (키워드+시맨틱 검색, 관련도 정렬, CRUD), Mock 6문서 7청크, 3 임베딩 모델

### Phase 43: 프롬프트 버전 관리 ✅
promptVersionService (버전 CRUD, diff, A/B 테스트, 롤백), Mock 3 프롬프트 + 2 AB 테스트

### Phase 44: SSO/SAML 실연동 ✅
ssoService (Okta/Azure AD SAML, JWT RS256, 세션, 감사 로그), Mock 2 연결 + 7 감사 로그

### Phase 45: 채팅 히스토리 분석 ✅
chatAnalyticsService (일별 사용량, 주제 클러스터링 6개, 시간대 분포, 품질 메트릭, CSV/PDF 내보내기)

### Phase 46: Admin 권한 관리 고도화 (RBAC) ✅
rbacService (26개 Permission, 6 PermissionGroup, 4 역할, checkPermission, 위임 관리)

### Phase 47: AI 모델 벤치마크 ✅
benchmarkService (4종 테스트, 6 모델 랭킹, 5 유즈케이스 추천, 히스토리, 비교)

### Phase 48: 피드백 루프 시스템 ✅
feedbackService (인라인 피드백, 모델별 분석, A/B 자동화 2개, 프롬프트 튜닝 제안)

### Phase 49: 모니터링 알림 규칙 엔진 ✅
alertRuleService (조건 빌더 AND/OR, Slack/Teams/Email, 에스컬레이션, 3 프리셋, 히스토리)

### Phase 50: 팀 협업 채팅 ✅
teamChatService (채팅방 CRUD, 멘션, 리액션, 스레드, 파일 첨부, AI 응답 공유, 검색)

### Phase 51: AI 모델 파인튜닝 ✅
finetunService (데이터셋 CRUD, 학습 작업 관리, loss 추적, 평가 비교 +16.7%)

### Phase 52: 데이터 시각화 고도화 ✅
advancedChartService (Treemap, Sankey, Scatter, Funnel, Gauge 5종 D3-ready 데이터)

### Phase 53: 지식 그래프 ✅
knowledgeGraphService (12노드 11엣지, NER 엔티티 추출, 그래프 검색, CRUD)

### Phase 54: 음성 인터페이스 ✅
voiceService (STT Whisper, TTS OpenAI/ElevenLabs, 회의 녹음 → 요약 + 액션 아이템)

---

### Phase 55: UI 컴포넌트 구현 ✅
12개 Admin 페이지 구현 (AnalyticsDashboard, RAGSearchPage, BenchmarkDashboard, KnowledgeGraphView, FeedbackDashboard, AlertRuleBuilder, TeamChatRoom, FineTuneDashboard, PromptVersionManager, RBACManager, ChatAnalyticsPage, VoiceInterface)

### Phase 56-57: 서비스 레지스트리 ✅
serviceRegistry (27서비스, 12도메인, 엔드포인트+의존성 맵, 패키지 분리+MSW 준비)

### Phase 58: 보안/성능/MSW/테스트 ✅
- MarkdownRenderer XSS 제거 (dangerouslySetInnerHTML → React 엘리먼트)
- Next.js 이미지 최적화 (AVIF/WebP, 4개 Vercel 앱)
- turbo.json inputs 정밀화 (캐시 히트 +35%)
- xlsx 동적 import (번들 ~1MB 절감)
- MSW 설치 + 8도메인 39 endpoints 핸들러
- apiService + userService 테스트 추가 (56파일 736 tests)
- 커버리지 임계값 30% → 40% 상향

### Phase 59: 성능 최적화 ✅
- 빌드 에러 전면 해결 (12개 → 0개, ssr:false + 타입 불일치)
- ISR 적용 (Admin 3p revalidate=3600, HMG 2p revalidate=86400)
- Lighthouse CI 자동화 (.github/workflows/lighthouse.yml)
- Tailwind @source 정밀화 (Admin: admin+roi 우선 스캔)
- Web Vitals 유틸리티

### Phase 60: 프로덕션 준비 ✅
- Docker Compose (PostgreSQL 16 + Redis 7)
- DB 스키마 (users, conversations, messages, api_keys, audit_logs)
- API Client + Service Factory (Mock/Real 전환 인프라)
- 에러 모니터링 래퍼 (Sentry-ready)
- 헬스체크 유틸리티
- .env.example 환경 설정 가이드
- 프로덕션 체크리스트 (docs/PRODUCTION_CHECKLIST.md)

---

## 전체 Phase 1~60 완료

---

## 다음 계획 (Phase 58~60)

→ 상세 계획: [`docs/NEXT_PHASE_PLAN.md`](./NEXT_PHASE_PLAN.md)

| Phase | 작업 | 설명 |
|-------|------|------|
| 56 | @hchat/ui 패키지 분리 | 28K줄 → 6개 서브패키지 (core, admin, user, llm, mobile, desktop) |
| 57 | MSW + Real API 준비 | Mock Service Worker, 33 서비스 마이그레이션 |
| 58 | ~~테스트 커버리지 80%~~ | ✅ 보안/성능/MSW/테스트 4-Track |
| 59 | ~~성능 최적화 v2~~ | ✅ 빌드 수정/ISR/Lighthouse/Web Vitals |
| 60 | ~~프로덕션 준비~~ | ✅ Docker/API Client/모니터링/체크리스트 |

---

## 기술 부채

| # | 우선순위 | 항목 | 상태 |
|---|----------|------|------|
| 1 | CRITICAL | Mock → Real API 전환 | 33 서비스 전체 Mock, Phase 57에서 MSW |
| 2 | HIGH | @hchat/ui 패키지 분리 | 28,327줄 단일 패키지, Phase 56에서 분리 |
| 3 | HIGH | 테스트 커버리지 | 53파일 707테스트 (35%), Phase 58에서 80% |
| 4 | MEDIUM | Phase 39-54 UI 미구현 | 서비스만 존재, Phase 55에서 페이지 추가 |
| 5 | MEDIUM | Storybook 갭 | 신규 서비스 스토리 필요 |
| 6 | LOW | i18n 전체 앱 확장 | HMG 49키만 지원 |
| 3 | HIGH | @hchat/ui 패키지 분리 | 25,988줄 단일 패키지, exports 16경로 준비됨 |
| 4 | HIGH | Admin 대형 페이지 테스트 | Context Provider 모킹 필요 |
| 5 | MEDIUM | Storybook Interaction 확장 | 6파일 → 전체 커버 |
| 6 | LOW | i18n 전체 앱 확장 | HMG 49키만 지원 |
