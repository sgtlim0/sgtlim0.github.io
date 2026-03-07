# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-07 | Phase 44 완료 기준

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
| TS/TSX 파일 | 486개 |
| 총 코드 라인 | 44,797줄 (TS/TSX) |
| @hchat/ui | 214파일, 25,988줄 |
| UI 컴포넌트 | 132개 |
| 페이지 | 55개 (page.tsx) |
| Storybook | 135 파일 |
| 서비스 파일 | 30개 |
| 커스텀 훅 | 61개 |
| 단위 테스트 | 43 파일, 608 테스트 |
| E2E 테스트 | 18 파일 |
| Interaction Tests | 6 파일, 28 테스트 |
| Git 커밋 | 103개 |
| 완료 Phase | 44개 |

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

---

## 다음 계획 (Phase 45~54)

| Phase | 작업 | 설명 |
|-------|------|------|
| 45 | 채팅 히스토리 분석 | 대화 패턴 시각화, 주제 클러스터링, 사용자 행동 인사이트 |
| 46 | Admin 권한 관리 고도화 | RBAC, 세분화 권한 매트릭스, PermissionGate 컴포넌트 |
| 47 | AI 모델 벤치마크 | 자동 품질/속도/비용 벤치마크, 추천 엔진 |
| 48 | 피드백 루프 시스템 | 인라인 피드백, A/B 자동화, 프롬프트 튜닝 |
| 49 | 모니터링 알림 규칙 엔진 | 조건 빌더 UI, Slack/Teams 웹훅, 에스컬레이션 |
| 50 | 팀 협업 채팅 | WebSocket, 멘션, 스레드, 파일 공유 |
| 51 | AI 모델 파인튜닝 | 학습 데이터셋 관리, 진행 대시보드, 평가 메트릭 |
| 52 | 데이터 시각화 고도화 | D3.js 차트 래퍼, 드릴다운, 애니메이션 |
| 53 | 지식 그래프 | force-directed graph, NER 태깅, 검색 연동 |
| 54 | 음성 인터페이스 | STT/TTS, 음성 명령, 회의 요약 |

---

## 기술 부채

| # | 우선순위 | 항목 | 상태 |
|---|----------|------|------|
| 1 | CRITICAL | 단위 테스트 커버리지 | 43파일 608테스트 (35%), 목표 80% |
| 2 | CRITICAL | Mock → Real API 전환 | 전체 Mock, MSW 도입 후 점진적 전환 |
| 3 | HIGH | @hchat/ui 패키지 분리 | 25,988줄 단일 패키지, exports 16경로 준비됨 |
| 4 | HIGH | Admin 대형 페이지 테스트 | Context Provider 모킹 필요 |
| 5 | MEDIUM | Storybook Interaction 확장 | 6파일 → 전체 커버 |
| 6 | LOW | i18n 전체 앱 확장 | HMG 49키만 지원 |
