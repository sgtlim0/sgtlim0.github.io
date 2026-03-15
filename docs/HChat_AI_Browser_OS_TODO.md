# H Chat AI Browser OS - TODO List

> **기준 문서**: `docs/HChat_AI_Browser_OS_Analysis.md`
> **작성일**: 2026-03-15
> **총 투자**: $645.5K · **기간**: 30주 · **팀**: 13명

---

## 0. Sprint 0 착수 전 선행과제 (필수)

> Sprint 0 (14일) 착수 전 4항 완료 필수 — 미완 시 Sprint 0 연기

- [ ] **SAP Fiori DOM 접근 PoC** (2일)
  - [ ] SAP Fiori에서 Content Script DOM 접근 가능 여부 검증
  - [ ] Shadow DOM 탐색 및 waitForDOMStable() 구현 확인
  - [ ] 실패 시 플랜 B (대안 접근 방식) 문서화
- [ ] **MARS 비용 시뮬레이션** (1일)
  - [ ] 6종 에이전트 1회 리서치 세션 $0.27 실측 검증
  - [ ] 월 $45K 예산 → 167K 세션 → 사용자당 일 3.3회 시뮬레이션
  - [ ] 비용 급등 시 Haiku 다운그레이드 시나리오 준비
- [ ] **hchat-pwa 관계 정의** (경영진 협의)
  - [ ] 옵션 A: 병행 (Extension=데스크톱, PWA=모바일)
  - [ ] 옵션 B: Extension Only (PWA 중단)
  - [ ] 옵션 C: Extension 우선, PWA를 경량 뷰어로 전환
  - [ ] 경영진 의사결정 확보
- [ ] **Multi-tenant 아키텍처 설계** (설계)
  - [ ] 16개 계열사 동시 서비스 격리 설계
  - [ ] Row-Level Security + OPA Policy Engine 아키텍처
  - [ ] 계열사별 LLM 모델 할당 · 비용 분리 모델

---

## 1. Sprint 0 — 기술검증 (2주, $37.4K)

> 42 태스크 · 7개 Go/No-Go 판정 기준

### M0 MVP (Day 14) Go 기준: Smart DOM + 단일 에이전트 데모 + 유스케이스 3개 시연

- [ ] **Extension 기본 구조**
  - [ ] Chrome MV3 Service Worker 셋업
  - [ ] Side Panel + Popup + Content Script 기본 구조
  - [ ] Omnibox `hchat` 키워드 등록
  - [ ] Manifest V3 설정 (permissions, CSP)
- [ ] **Smart DOM 추출 (L2) PoC**
  - [ ] Readability.js 통합 및 노이즈 제거 테스트
  - [ ] RQFP (Relevance Quality Filtering Pipeline) 구현
  - [ ] Shadow DOM / SPA 사이트 대응 (MutationObserver)
  - [ ] 추출 정확도 90%+ 달성 여부 검증
- [ ] **단일 에이전트 데모**
  - [ ] LLM API 연결 (Claude/GPT-4o)
  - [ ] SSE 스트리밍 응답 (Side Panel ↔ Background SW)
  - [ ] 3개 유스케이스 시연 가능 상태
- [ ] **PII 마스킹 기본 구현**
  - [ ] 7패턴 PII 감지 (주민번호, 카드, 이메일 등)
  - [ ] Content Script 전처리 단계 적용
  - [ ] 블록리스트 20 도메인 + 6 패턴 적용
- [ ] **Go/No-Go 판정** (7개 기준 검토)

---

## 2. Phase 1 — 기반 구축 (8주, $186.8K)

### M1 Alpha (Week 10) Go 기준: NPS 35+ / 정확도 80%+ / CWS 게시

- [ ] **F01: Side Panel Agent UI**
  - [ ] 채팅 인터페이스 (메시지 입력/표시)
  - [ ] 대화 히스토리 관리 (IndexedDB)
  - [ ] 다크/라이트 테마 지원
  - [ ] 반응형 레이아웃 (Side Panel 너비 적응)
- [ ] **F02: Smart DOM 추출 (프로덕션)**
  - [ ] Confluence 페이지 추출 테스트
  - [ ] Jira Cloud 이슈 추출 테스트
  - [ ] SAP Fiori 데이터 추출 (Shadow DOM 대응)
  - [ ] 추출 정확도 90%+ / 2초 이내 목표
- [ ] **F03: 컨텍스트 메뉴 분석**
  - [ ] 선택 텍스트 → 즉시 분석
  - [ ] 이미지/테이블 → 데이터 추출
  - [ ] 커스텀 메뉴 항목 (요약, 번역, 분석)
- [ ] **F04: SSE 스트리밍 응답**
  - [ ] Background SW ↔ Side Panel SSE 연결
  - [ ] AbortController 라이프사이클 관리
  - [ ] TTFT < 800ms 목표
  - [ ] 탭 전환/취소 시 정상 정리
- [ ] **F09: PII 마스킹 & 보안 (강화)**
  - [ ] 11패턴 PII 처리 6단계 파이프라인
  - [ ] AES-256-GCM 암호화 저장
  - [ ] Background SW 블록리스트 + 서버 Zod 검증
- [ ] **보안 기반**
  - [ ] Row-Level Security (RLS) 구현
  - [ ] 불변 감사 로그 (SHA-256 해시 체인)
  - [ ] Extension CSP (`script-src 'self'`)
  - [ ] CDP+Stealth (봇 탐지 우회 기반)
- [ ] **인프라**
  - [ ] FastAPI 백엔드 셋업 (Python 3.12)
  - [ ] PostgreSQL 16 + pgvector 스키마
  - [ ] Redis 7 (세션/캐시)
  - [ ] CWS 비공개 게시
- [ ] **테스트**
  - [ ] 단위 테스트 커버리지 70%+
  - [ ] 파일럿 사용자 500명 NPS 측정
  - [ ] 정확도 80%+ 달성 확인

---

## 3. Phase 2 — 핵심 기능 (8주, $150.7K)

### M2 Beta (Week 18) Go 기준: DAU 55% / 자동화 25%+ / 보안 감사 통과

- [ ] **F05: DataFrame 자동 변환 (L3)**
  - [ ] HTML 테이블 → JSON/CSV/XLSX 자동 변환
  - [ ] 테이블 감지율 95% 목표
  - [ ] 1,000행 3초 이내 (Web Worker 병렬)
  - [ ] SAP/ERP 테이블 호환성 테스트
- [ ] **F06: Dynamic Multi-Model**
  - [ ] 작업별 최적 모델 자동 선택 로직
  - [ ] 19개 모델 카탈로그 (Opus, GPT-5.2, Gemini 등)
  - [ ] 비용 최적화 라우팅 ($0.12/작업 목표)
  - [ ] 경량 모델 폴백 (Haiku, GPT-4o-mini)
- [ ] **F07: MARS 리서치 파이프라인 (L4)**
  - [ ] LangGraph + CrewAI 기반 6종 에이전트 구현
  - [ ] Planner → Search → Web → Data → Analysis → Report
  - [ ] $0.27/세션 비용 검증
  - [ ] 전체 세션 120초 이내
- [ ] **F08: 에이전틱 브라우징 RPA**
  - [ ] 브라우저 자동화 기본 동작
  - [ ] 웹 폼 자동 입력
  - [ ] 멀티 탭 오케스트레이션
- [ ] **F10: HITL 승인 체계**
  - [ ] Human-in-the-Loop 승인 워크플로우
  - [ ] 고위험 작업 사전 승인 요청
  - [ ] 승인/거절 감사 로그
- [ ] **F14: 감사 로그 대시보드**
  - [ ] 감사 추적 UI (Admin Console)
  - [ ] SHA-256 해시 체인 무결성 검증
  - [ ] OpenTelemetry 통합
- [ ] **F15: 봇 탐지 우회 (Stealth)**
  - [ ] CDP (Chrome DevTools Protocol) 최적화
  - [ ] navigator.webdriver 속성 숨김
  - [ ] 지문 방어 (fingerprint randomization)
- [ ] **F16: Omnibox 통합**
  - [ ] `hchat` 키워드 → 즉시 검색/요약
  - [ ] 자동완성 제안
  - [ ] 최근 명령어 히스토리
- [ ] **보안 감사**
  - [ ] OWASP Top 10 체크리스트
  - [ ] 에이전트 보안 체크리스트
  - [ ] 데이터 주권 체크리스트
  - [ ] 21개 보안 항목 통과

---

## 4. Phase 3 — 통합 최적화 (8주, $134.2K)

### M3 P3 완료 (Week 26) Go 기준: Multi-Model 라우팅 / Self-Healing 55%+ / Kill Switch

- [ ] **F11: Self-Healing 자가 복구**
  - [ ] 장애 자동 감지 및 복구
  - [ ] Self-Healing 성공률 55%+ 목표
  - [ ] Circuit Breaker 패턴 적용
  - [ ] Kill Switch (긴급 차단) 구현
- [ ] **F12: 시맨틱 DOM 시각화**
  - [ ] DOM 구조 시각적 표시
  - [ ] 추출 영역 하이라이트
  - [ ] 사용자 커스텀 선택 영역 지원
- [ ] **F13: 오프라인 큐**
  - [ ] 네트워크 단절 시 요청 큐잉
  - [ ] 복구 시 자동 재전송 (지수 백오프)
  - [ ] Dead Letter Queue 관리
- [ ] **Multi-tenant 완성**
  - [ ] 16개 계열사 격리 검증
  - [ ] Row-Level Security 완전 적용
  - [ ] 계열사별 OPA 정책 배포
  - [ ] 계열사별 LLM 비용 분리 대시보드
- [ ] **성능 최적화**
  - [ ] 번들 크기 < 5MB
  - [ ] Side Panel 로드 < 1,000ms
  - [ ] Popup 로드 < 300ms
  - [ ] Content Script 주입 < 100ms
  - [ ] 메모리 사용 < 100MB
  - [ ] DOM 읽기/쓰기 분리 (Reflow 최소화)
  - [ ] IntersectionObserver 활용 (Layout Thrashing 방지)
- [ ] **Edge Security**
  - [ ] WAF 통합
  - [ ] TLS 1.3 강제
  - [ ] CORS Allowlist
- [ ] **인증/인가 강화**
  - [ ] HMAC-SHA256 JWT
  - [ ] TOTP 2FA 이중 인증
  - [ ] OPA Policy Engine + RBAC
- [ ] **관측성**
  - [ ] OpenTelemetry 분산 추적
  - [ ] Sentry 에러 모니터링 연동
  - [ ] Web Vitals 실시간 대시보드

---

## 5. Phase 4 — GA 릴리스 (4주, $136.4K)

### M4 GA (Week 30) Go 기준: SLA 99.9% / 부하 테스트 / NPS 45+

- [ ] **Canary 배포**
  - [ ] 5% 배포 → 모니터링 (에러율, 응답시간, NPS)
  - [ ] 25% 확장 → 안정성 확인
  - [ ] 100% 전체 배포
  - [ ] 자동 롤백 4가지 조건 설정
- [ ] **부하 테스트**
  - [ ] 동시 RPS 500 sustained 테스트
  - [ ] WebSocket 10,000 동시 연결 테스트
  - [ ] 스트리밍 30 tokens/sec 검증
  - [ ] 피크 시나리오 (오전 9시, 월요일)
- [ ] **SLA 검증**
  - [ ] SLA 99.9% (연간 다운타임 < 8.76시간)
  - [ ] RTO < 15분 (복구 시간)
  - [ ] RPO < 5분 (복구 시점)
- [ ] **보안 최종 심사**
  - [ ] OWASP 최종 점검
  - [ ] 침투 테스트 수행
  - [ ] 데이터 주권 감사 완료
- [ ] **테스트 완료**
  - [ ] 9,350+ 테스트 (단위 70% + 통합 20% + E2E 10%)
  - [ ] 테스트 커버리지 85%+
  - [ ] 크로스 브라우저 호환성 (Chrome, Edge)
- [ ] **문서화**
  - [ ] 사용자 가이드 (Wiki)
  - [ ] Admin Console 가이드
  - [ ] API 문서 최종 업데이트
  - [ ] 장애 대응 런북 (Runbook)
- [ ] **GA 출시**
  - [ ] CWS 공개 (사내 비공개 → 사내 공개)
  - [ ] Forcelist 정책 적용 (오토에버 500명)
  - [ ] 챔피언 5명 선발 및 온보딩
  - [ ] NPS 45+ 달성 확인

---

## 6. GTM (Go-To-Market) 후속

### Stage 1: 파일럿 (0~6개월)

- [ ] 오토에버 500명 파일럿 운영
- [ ] DAU 55%+ 달성
- [ ] NPS 40+ 달성
- [ ] ARR $312K 달성
- [ ] 얼리 어답터 발굴 → 챔피언 5명 육성

### Stage 2: 그룹 확산 (6~18개월)

- [ ] Forcelist 일괄 배포 전환
- [ ] 16개 계열사 25,000석 확장
- [ ] 부서별 온보딩 프로그램 실행
- [ ] 성공 사례 5건+ 수집/전파
- [ ] DAU 60%+, NPS 45+, ARR $5.64M

### Stage 3: 외부 확장 (18~30개월)

- [ ] 외부 대기업 PoC 착수
- [ ] 산업 특화 에이전트 애드온 개발
- [ ] 엔터프라이즈 계약 체결
- [ ] NRR 120%+, ARR $10M+

---

## 7. 리스크 완화 체크리스트

### 기술 리스크

- [ ] SPA/Shadow DOM 호환성 — SAP Fiori PoC 완료
- [ ] DOM Race Condition — waitForDOMStable() + MutationObserver 구현
- [ ] API 키 Two-Phase 삭제 — onSuspend + 서버 24h TTL
- [ ] Reflow 최소화 — DOM 읽기/쓰기 분리 + IntersectionObserver
- [ ] SSE AbortController — 라이프사이클 관리 + 좀비 연결 방지
- [ ] AI 환각 — Citation 필수 + HITL + 정확도 92%+ KPI

### 비즈니스 리스크

- [ ] LLM API 비용 급등 — 멀티모델 라우팅 + 캐싱 60%↓ + 경량 모델 폴백
- [ ] 사용자 채택 저조 — Forcelist 강제 배포 + 챔피언 프로그램
- [ ] Chrome 정책 변경 — MV3 최신 준수 + Edge 호환 준비
- [ ] 경쟁사 진입 — 사내 딥통합(경쟁사 불가) + 데이터 주권 해자

### 보안 리스크

- [ ] 데이터 유출 — Zero Trust 6계층 + PII 11패턴 + 블록리스트
- [ ] MARS 비용 초과 — $0.27 세션 한도 + 동적 다운그레이드
- [ ] Multi-tenant 격리 — RLS + OPA + 계열사별 정책
- [ ] 핵심 인력 이탈 — Bus Factor 3+ + 지식 문서화 + RSU

---

## 8. KPI 추적 체크리스트

### 핵심 KPI

- [ ] DAU/MAU **65%+** 달성
- [ ] NPS **50+** 달성
- [ ] 자동화율 **50%+** 달성
- [ ] CWS 평점 **4.5+** 달성
- [ ] SLA **99.9%** 유지

### Extension 특화 KPI

- [ ] 설치 유지율 **95%+**
- [ ] 일일 Active Extension **5,200+**
- [ ] Side Panel 로드 **< 800ms**

### 기술 KPI

- [ ] 응답 정확도 **92%+**
- [ ] 에러율 **< 0.5%**
- [ ] 배포 빈도 **주 2회+**

### 재무 KPI

- [ ] 6개월: ARR **$312K** / 2,000 좌석
- [ ] 12개월: ARR **$1.54M** / 8,000 좌석 / Break-even
- [ ] 18개월: ARR **$5.64M** / 25,000 좌석
- [ ] 24개월: ARR **$12.1M** / 50,000 좌석

### 비용 절감 KPI

- [ ] 정보 탐색 23분 → 3분 (**87%** 단축)
- [ ] 보고서 작성 5h → 30분 (**85%** 단축)
- [ ] 데이터 수집 4h → 10분 (**95%** 단축)
- [ ] 티켓 분류 50분 → 5분 (**90%** 단축)
- [ ] 연간 비용 절감 **$550K** 달성

---

> **총 TODO 항목**: 150+ 체크포인트
> **크리티컬 패스**: 선행과제 4항 → Sprint 0 → Phase 1 (F01→F04→F06→F07) → Phase 2 → Phase 3 → GA
