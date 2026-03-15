# H Chat 종합 기획서 - TODO List

> **기준 문서**: `docs/HChat_Comprehensive_Planning_Analysis.md`
> **작성일**: 2026-03-15
> **총 투자**: $645.5K · **기간**: 30주 · **팀**: 13명
> **신규 모듈**: 19개 / ~6,100줄 · **기존 재활용**: 12개 모듈 → 30% 단축

---

## 0. Sprint 0 착수 전 선행과제 (필수)

> Sprint 0 (14일) 착수 전 완료 필수 — 미완 시 Sprint 0 연기

### 0.1 SAP Fiori PoC (2일)
- [ ] SAP Fiori에서 Content Script DOM 접근 검증
- [ ] sap-ui-content 주요 컴포넌트 추출 가능 여부 확인
- [ ] Shadow DOM 탐색 + waitForDOMStable() 구현 테스트
- [ ] 실패 시 플랜 B (SAP API 직접 연동) 문서화

### 0.2 MARS 비용 시뮬레이션 (1일)
- [ ] 6단계 에이전트 1회 리서치 세션 $0.27 실측 검증
  - [ ] Planner (Opus 4.6): $0.02
  - [ ] Search (Haiku): $0.01
  - [ ] Web (Haiku): $0.02
  - [ ] Data (Sonnet): $0.03
  - [ ] Analysis (Opus 4.6): $0.15
  - [ ] Report (Sonnet): $0.04
- [ ] 월 $45K 예산 → 167K 세션 → 사용자당 일 3.3회 시뮬레이션
- [ ] 비용 급등 시 Haiku 다운그레이드 시나리오 준비
- [ ] Analysis 에이전트 Opus→Sonnet 전환 시 품질 영향 테스트

### 0.3 hchat-pwa 관계 정의 (경영진 협의)
- [ ] 옵션 A: 병행 (Extension=데스크톱, PWA=모바일)
- [ ] 옵션 B: Extension Only (PWA 중단)
- [ ] 옵션 C: Extension 우선, PWA를 경량 뷰어로 전환
- [ ] 경영진 의사결정 확보 및 문서화

### 0.4 Multi-tenant 아키텍처 설계
- [ ] 16개 계열사 동시 서비스 격리 설계
- [ ] Row-Level Security + OPA Policy Engine 아키텍처
- [ ] 계열사별 LLM 모델 할당 · 비용 분리 모델
- [ ] 데이터 상주 정책 (국내 데이터 센터)

### 0.5 팀 구성 확정
- [ ] 13인 팀 역할별 확정
  - [ ] PM 1명
  - [ ] FE 엔지니어 3명 (최소 1명 Chrome Extension 경험자)
  - [ ] BE 엔지니어 3명
  - [ ] ML/AI 엔지니어 2명
  - [ ] Infra/DevOps 1명
  - [ ] QA 엔지니어 1명
  - [ ] 유지보수 2명
- [ ] Extension 전문인력 확보 (SWOT 약점 대응)

---

## 1. Sprint 0 — 기술검증 (2주, $37.4K)

> 42 태스크 · 7개 Go/No-Go 판정 기준

### 1.1 Go/No-Go 판정 7항

- [ ] **#1 Readability.js 정확도**: 주요 사이트 5개 중 4+ 성공
  - [ ] Confluence 페이지 추출 테스트
  - [ ] Jira Cloud 이슈 추출 테스트
  - [ ] SAP Fiori 데이터 추출 테스트
  - [ ] Google Docs 추출 테스트
  - [ ] 내부 Wiki 추출 테스트
  - [ ] No-Go 시: 대안 라이브러리 평가 (Turndown)
- [ ] **#2 SAP Fiori DOM 접근**: sap-ui-content 주요 컴포넌트 추출 가능
  - [ ] No-Go 시: SAP API 직접 연동 전환
- [ ] **#3 PII 11패턴 검출**: Precision 95%+, Recall 90%+
  - [ ] 주민등록번호, 계좌번호, 카드번호, 휴대전화, 이메일
  - [ ] 여권번호, 운전면허, IP 주소, 사번, 비밀번호 필드, JWT 토큰
  - [ ] No-Go 시: 패턴 축소 + ML 기반 보완
- [ ] **#4 MARS 비용 검증**: $0.30/세션 이하 시뮬레이션
  - [ ] No-Go 시: 모델 다운그레이드 + 캐싱
- [ ] **#5 PRISM CI Gate**: 22개 항목 중 Critical 0건
  - [ ] No-Go 시: 아키텍처 수정 후 재심사
- [ ] **#6 MV3 Side Panel**: 기본 UI + Content Script 통신 정상
  - [ ] No-Go 시: Popup 폴백 전략
- [ ] **#7 성능 기준**: DOM 추출 <2초, 메모리 <100MB
  - [ ] No-Go 시: Worker 오프로딩

### 1.2 Extension 기본 구조

- [ ] Chrome MV3 Service Worker 셋업
- [ ] Side Panel 기본 UI (320~600px 가변)
- [ ] Popup 기본 UI (400×600px 고정)
- [ ] Content Script 주입 + 통신 프로토콜
- [ ] Omnibox `hc` 키워드 등록
- [ ] Manifest V3 설정 (permissions, CSP)

### 1.3 RQFP 엔진 프로토타입

- [ ] SmartDomExtractor 구현 (~300줄)
- [ ] RqfpEngine 구현 (R×0.4 + Q×0.4 + F×0.2, 임계 0.35) (~350줄)
- [ ] ShadowDomTraverser 구현 (~250줄)
- [ ] MutationStabilizer 구현 (100ms 안정화 대기) (~250줄)

---

## 2. Phase 1 — 기반 구축 (8주, $186.8K)

> 전환 기준: 커버리지 60%+ → Sprint 0 Go/No-Go 7개 통과

### 2.1 P0 기능 구현 (5개)

- [ ] **F01: Side Panel Agent UI**
  - [ ] 대화 탭: LLM 채팅, 스트리밍 응답, 컨텍스트 유지
  - [ ] 빠른 프롬프트 추천, 인라인 코드 블록
  - [ ] 다크/라이트 테마 (Extension 디자인 토큰 적용)
  - [ ] Pretendard + JetBrains Mono 폰트 적용
- [ ] **F02: Smart DOM 추출 (프로덕션)**
  - [ ] SapFioriAdapter 구현 (~350줄)
  - [ ] Confluence/Jira/SAP 각 사이트 추출 검증
  - [ ] RQFP Score 0.35+ 품질 보증
  - [ ] 추출 정확도 90%+ / 2초 이내 / $0.12/작업
- [ ] **F03: 컨텍스트 메뉴 분석**
  - [ ] 3-depth 구조 (텍스트/이미지/테이블/링크)
  - [ ] OS 네이티브 통합
  - [ ] 커스텀 메뉴 항목 (요약, 번역, 분석)
- [ ] **F04: SSE 스트리밍 응답**
  - [ ] Background SW ↔ Side Panel SSE 연결
  - [ ] AbortController 라이프사이클 관리
  - [ ] TTFT < 800ms 목표
- [ ] **F09: PII 마스킹 & 보안 (11패턴)**
  - [ ] 11패턴 PII 처리 파이프라인
  - [ ] Precision 95%+, Recall 90%+, 탐지율 99.9%+
  - [ ] AES-256-GCM 암호화 저장
  - [ ] 블록리스트 20 도메인 + 6 패턴

### 2.2 보안 기반

- [ ] Row-Level Security (RLS) 구현
- [ ] 불변 감사 로그 (SHA-256 해시 체인)
- [ ] Extension CSP (script-src 'self')
- [ ] CDP+Stealth (봇 탐지 우회 기반)
- [ ] HMAC-SHA256 JWT 인증

### 2.3 인프라

- [ ] FastAPI 백엔드 셋업 (Python 3.12)
- [ ] PostgreSQL 16 + pgvector 스키마
- [ ] Redis 7 (세션/캐시)
- [ ] Nginx API Gateway
- [ ] CWS 비공개 게시

### 2.4 UI 서피스 4종

- [ ] Side Panel: 5개 탭 (대화/리서치/데이터/히스토리/설정)
- [ ] Popup: 6개 퀵 액션 그리드
- [ ] Context Menu: 3-depth 네이티브
- [ ] Omnibox: `hc` + 자동완성

---

## 3. Phase 2 — 핵심 기능 (8주, $150.7K)

> 전환 기준: 커버리지 70%+ · 에러율 <2% · PII 11패턴 검증

### 3.1 P1 기능 구현 (8개)

- [ ] **F05: DataFrame 자동 변환 (L3)**
  - [ ] HTML 테이블 자동 감지 → JSON/CSV/XLSX
  - [ ] 감지율 95% / 1초/<1000행 / Web Worker 병렬
  - [ ] 컬럼 타입 자동 추론
  - [ ] 대용량 청크 스트리밍
- [ ] **F06: Dynamic Multi-Model**
  - [ ] 스코어링: q×0.4 + l×0.3 + c×0.2 + a×0.1
  - [ ] 5+ 프로바이더 (Opus, GPT-5.2, Gemini, Grok, Nano Banana)
  - [ ] Circuit Breaker (30% 오류율 트리거)
  - [ ] Rate Limiter 토큰 버킷
- [ ] **F07: MARS 리서치 파이프라인 (L4)**
  - [ ] LangGraph StateGraph 기반 6종 에이전트
  - [ ] Planner($0.02) → Search($0.01) → Web($0.02) → Data($0.03) → Analysis($0.15) → Report($0.04)
  - [ ] HITL Gate (Analysis 전 사용자 확인)
  - [ ] 합계 $0.27/세션, 최대 120초
  - [ ] ResearchState TypedDict 상태 관리
- [ ] **F08: 에이전틱 브라우징 RPA**
  - [ ] 브라우저 자동화 기본 동작
  - [ ] 멀티 탭 오케스트레이션
- [ ] **F10: HITL 승인 체계**
  - [ ] 고위험 작업 사전 승인 요청
  - [ ] 승인/거절 감사 로그
- [ ] **F14: 감사 로그 대시보드**
  - [ ] L1~L4 불변 감사 (SHA-256 체인)
  - [ ] OpenTelemetry 통합
- [ ] **F15: 봇 탐지 우회**
  - [ ] CDP Stealth 최적화
  - [ ] navigator.webdriver 속성 숨김
- [ ] **F16: Omnibox 통합**
  - [ ] `hc` + Space/Tab → 실시간 자동완성
  - [ ] 검색/데이터/히스토리/MARS 모드

### 3.2 보안 감사

- [ ] OWASP Top 10 체크리스트
- [ ] 에이전트 보안 체크리스트
- [ ] 데이터 주권 체크리스트
- [ ] Zero Trust 6계층 검증
  - [ ] L1 Extension CSP
  - [ ] L2 Edge Security (WAF + TLS 1.3)
  - [ ] L3 Authentication (JWT + TOTP 2FA)
  - [ ] L4 Authorization (OPA + RBAC)
  - [ ] L5 Data Protection (PII 11패턴 + AES-256-GCM)
  - [ ] L6 Audit (SHA-256 해시 체인 + OpenTelemetry)

---

## 4. Phase 3 — 통합 최적화 (8주, $134.2K)

> 전환 기준: 커버리지 80%+ · 에러율 <1% · MARS $0.27 확인

### 4.1 P2 기능 구현 (3개)

- [ ] **F11: Self-Healing 자가 복구**
  - [ ] 3-Strike Rule (MAX_HEAL=3, 3회 초과 → OPEN)
  - [ ] 지수 백오프 (5분 → 15분 → 45분)
  - [ ] AST + LLM 진단 (구문 오류 85~90% 자동 수정)
  - [ ] Unified Diff 패치 적용 (복구 55~70% 단축)
  - [ ] SPEC-SH 테스트: OPEN 3600초 동작 확인
- [ ] **F12: 시맨틱 DOM 시각화**
  - [ ] DOM 구조 시각적 표시
  - [ ] 추출 영역 하이라이트
- [ ] **F13: 오프라인 큐**
  - [ ] 네트워크 단절 시 요청 큐잉
  - [ ] 복구 시 자동 재전송

### 4.2 Multi-tenant 완성

- [ ] 16개 계열사 격리 검증
- [ ] Row-Level Security 완전 적용
- [ ] 계열사별 OPA 정책 배포
- [ ] 계열사별 LLM 비용 분리 대시보드

### 4.3 성능 최적화

- [ ] 번들 크기 < 5MB
- [ ] Side Panel 로드 < 1,000ms
- [ ] Popup 로드 < 300ms
- [ ] Content Script 주입 < 100ms
- [ ] 메모리 사용 < 100MB
- [ ] DOM 추출 < 2초
- [ ] MARS 세션 < 120초

### 4.4 Edge Security

- [ ] WAF 통합
- [ ] TLS 1.3 강제
- [ ] CORS Allowlist 적용

---

## 5. Phase 4 — GA 릴리스 (4주, $136.4K)

### 5.1 Canary 배포

- [ ] 5% 배포 → 모니터링
- [ ] 25% 확장 → 안정성 확인
- [ ] 100% 전체 배포
- [ ] 자동 롤백 4가지 조건 설정

### 5.2 부하 테스트

- [ ] 동시 RPS 500 sustained
- [ ] WebSocket 10,000 동시 연결
- [ ] 스트리밍 30 tokens/sec
- [ ] SLA 99.9% 검증 (연간 다운타임 < 8.76시간)

### 5.3 테스트 완료

- [ ] 기존 5,997개 + 신규 3,350개 = **9,350+ 테스트**
- [ ] 테스트 커버리지 **85%+**
- [ ] 단위 70% + 통합 20% + E2E 10%
- [ ] 자동화 테스트 비율 95%+ (QA 1명 대응)

### 5.4 보안 최종 심사

- [ ] OWASP 최종 점검
- [ ] 침투 테스트 수행
- [ ] 데이터 주권 감사 완료

### 5.5 GA 출시

- [ ] CWS 사내 공개
- [ ] Forcelist 정책 적용 (오토에버 500명)
- [ ] 챔피언 5명 선발 및 온보딩
- [ ] NPS 45+ 달성 확인

---

## 6. GAP 해소 추적 (14개 영역)

| # | 영역 | 현재 → 목표 | 담당 Phase | 상태 |
|---|------|---------|----------|------|
| 1 | L2 Smart DOM | sanitize → RQFP+Shadow DOM | P1 | - [ ] |
| 2 | L3 DataFrame | SheetJS → HTML 자동감지 | P2 | - [ ] |
| 3 | PII Scrubbing | 7패턴 → 11패턴 99.9% | P1 | - [ ] |
| 4 | L4 MARS Agent | 단일 API → 6단계 LangGraph | P2 | - [ ] |
| 5 | Multi-Model | 3 → 5+ Dynamic | P2 | - [ ] |
| 6 | 감사 로그 | 토큰 → SHA-256 체인 | P2 | - [ ] |
| 7 | Self-Healing | CircuitBreaker → AI 자동복구 | P3 | - [ ] |
| 8 | 블록리스트 | 20+6 → **충족** | — | - [x] |

---

## 7. 기존 자산 재활용 체크리스트 (12개 모듈)

> 기존 모노레포 자산 재활용 → 개발 기간 30% 단축

- [ ] 490 UI 컴포넌트 (packages/ui) → Extension Side Panel/Popup
- [ ] 5,997개 테스트 (packages/ui/__tests__) → 테스트 기반 확보
- [ ] 86개 LLM 모델 라우팅 (llm-router) → Dynamic Multi-Model
- [ ] Docker 인프라 (PG16+Redis7) → 백엔드 즉시 구동
- [ ] RBAC/SSO/JWT (admin/auth/) → Zero Trust L3/L4
- [ ] PII 새니타이즈 (sanitize.ts) → 11패턴 확장
- [ ] 블록리스트 (blocklist.ts) → 그대로 사용 (충족)
- [ ] SSE 스트리밍 (sseService.ts) → F04 SSE 기반
- [ ] IndexedDB (idb) → 대화 히스토리 저장
- [ ] Web Worker (workerUtils.ts) → DataFrame 병렬 처리
- [ ] Circuit Breaker (circuitBreaker.ts) → Self-Healing 기반
- [ ] 오프라인 큐 (offlineQueue.ts) → F13 기반

---

## 8. 리스크 완화 체크리스트

### 기술 리스크 (높음/높음)

- [ ] **SPA/Shadow DOM** — SAP Fiori PoC + waitForDOMStable() + MutationStabilizer
- [ ] **AI 환각** — Citation 필수 + HITL Gate + 정확도 92%+ KPI

### 기술 리스크 (중간)

- [ ] **MARS 비용 초과** — $0.27 세션 한도 + Analysis Opus→Sonnet 다운그레이드 시나리오
- [ ] **Multi-tenant 격리** — RLS + OPA + 계열사별 정책

### 비즈니스 리스크

- [ ] **LLM API 비용 급등** — 멀티모델 라우팅 + 캐싱 60%↓
- [ ] **경쟁사 진입 (Copilot)** — 사내 딥통합 해자 + 데이터 주권
- [ ] **핵심 인력 이탈** — RSU + Bus Factor 3+ + 지식 문서화

### 외부 리스크

- [ ] **Chrome 정책 변경** — MV3 최신 준수 + Edge 호환 준비
- [ ] **데이터 유출/보안** — Zero Trust 6계층 + PII 11패턴

---

## 9. KPI 추적 체크리스트

### 성공 기준 (6 / 12 / 24개월)

| 기준 | 6개월 | 12개월 | 24개월 |
|------|------|-------|-------|
| 좌석 수 | - [ ] 2,000 | - [ ] 8,000 | - [ ] 50,000 |
| DAU/MAU | - [ ] 55% | - [ ] 65% | - [ ] 70%+ |
| NPS | - [ ] 40 | - [ ] 50 | - [ ] 55+ |
| 자동화율 | - [ ] 30% | - [ ] 50% | - [ ] 60%+ |
| ARR | - [ ] $312K | - [ ] $1.54M | - [ ] $12.1M |
| 비용절감 | - [ ] $138K | - [ ] $550K | - [ ] $1,650K |
| 도입 계열사 | - [ ] 1 | - [ ] 5+ | - [ ] 16+ |
| Active Extension | - [ ] 1,100 | - [ ] 5,200 | - [ ] 35,000+ |
| 설치율 | - [ ] 80%+ | - [ ] 92%+ | - [ ] 95%+ |
| 응답 정확도 | - [ ] 85%+ | - [ ] 90%+ | - [ ] 92%+ |

### 단위 경제 KPI

- [ ] CAC **~$15** 유지 (Forcelist 효과)
- [ ] LTV **$720** 달성 (36개월 기준)
- [ ] LTV/CAC **48x** 유지
- [ ] Gross Margin **65%** 유지
- [ ] Payback **<1개월**

### 비용 절감 항목별

- [ ] 웹 리서치 효율화: **$200K**/년
- [ ] IT 헬프데스크 자동화: **$150K**/년
- [ ] 인시던트 복구 단축: **$100K**/년
- [ ] 데이터 입력 자동화: **$100K**/년

---

## 10. 신규 모듈 개발 추적 (19개 / ~6,100줄)

### L2 Smart DOM (~1,500줄)

- [ ] SmartDomExtractor (~300줄)
- [ ] RqfpEngine (~350줄)
- [ ] ShadowDomTraverser (~250줄)
- [ ] SapFioriAdapter (~350줄)
- [ ] MutationStabilizer (~250줄)

### L3 DataFrame (~800줄)

- [ ] DataFrameEngine (~400줄)
- [ ] TableDetector (~200줄)
- [ ] ColumnTypeInferrer (~200줄)

### L4 MARS Agent (~2,000줄)

- [ ] AgentOrchestrator (~400줄)
- [ ] PlannerAgent (~300줄)
- [ ] SearchAgent (~250줄)
- [ ] WebAgent (~300줄)
- [ ] DataAgent (~250줄)
- [ ] AnalysisAgent (~300줄)
- [ ] ReportAgent (~200줄)

### Cross-cutting (~1,800줄)

- [ ] DynamicModelRouter (~400줄)
- [ ] SelfHealingEngine (~500줄)
- [ ] AuditLogger SHA-256 체인 (~300줄)
- [ ] PIIScrubber 11패턴 확장 (~300줄)
- [ ] OmniboxHandler (~300줄)

---

> **총 TODO 항목**: 180+ 체크포인트
> **크리티컬 패스**: 선행과제 5항 → Sprint 0 (7 Go/No-Go) → Phase 1 (F01→F04) → Phase 2 (F06→F07 MARS) → Phase 3 (Self-Healing) → GA
> **핵심 차별점 vs AI Browser OS TODO**: RQFP 엔진 모듈 상세, Go/No-Go 7항 세부, 19개 신규 모듈 줄 수 추적, 12개 기존 자산 재활용 체크리스트
