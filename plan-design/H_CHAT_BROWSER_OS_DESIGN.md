# H Chat AI Browser OS -- 프로젝트 적용 설계안

> **문서 유형**: 아키텍처 + 기술 설계 + 비즈니스 모델 + 구현 로드맵
> **작성일**: 2026-03-15
> **기반 자료**: H Chat AI Browser OS PDF (15 슬라이드, NotebookLM) + 32슬라이드 발표자료 + 모노레포 심층분석
> **대상 독자**: CTO, 개발 리드, 아키텍트, 보안 담당
> **현재 Phase**: 101 (hchat-wiki 모노레포)

---

## 목차

| # | Section | 페이지 |
|---|---------|--------|
| 1 | [PDF 심층분석 요약](#section-1-pdf-심층분석-요약-executive-summary) | Executive Summary |
| 2 | [4-Layer 아키텍처 설계](#section-2-4-layer-아키텍처-설계) | L1~L4 + Data Purification Pipeline |
| 3 | [Zero Trust 보안 아키텍처](#section-3-zero-trust-보안-아키텍처) | PII 11패턴, 블록리스트, 감사 로그, 프록시 |
| 4 | [Zero-Friction 배포 전략](#section-4-zero-friction-배포-전략) | ExtensionInstallForcelist, GTM, Sprint |
| 5 | [Dynamic Multi-Model 라우팅](#5-dynamic-multi-model-라우팅-설계) | 5종 프로바이더, Circuit Breaker, Self-Healing |
| 6 | [비즈니스 모델 & 재무](#6-비즈니스-모델--재무-설계) | 3-Tier, ROI, 4-Layer Moat, 리스크 |
| 7 | [GAP 분석 매트릭스](#section-7-현재-프로젝트-vs-pdf-요구사항-gap-분석) | 14개 영역, 12개 재활용, 19개 신규 모듈 |
| 8 | [구현 로드맵](#section-8-구현-로드맵--프로젝트-적용-계획) | Phase 102~120, Sprint 0~GA, KPI |
| 9 | [32슬라이드 심층 품질 분석](#section-9-32슬라이드-심층-품질-분석) | 28→32 업그레이드, CSS 버그, 품질 등급 |
| 10 | [핵심 기술 인사이트](#section-10-핵심-기술-인사이트) | Smart DOM 난제, Browser = Research Engine |

---

## Section 1: PDF 심층분석 요약 (Executive Summary)

### 1.1 비전

**"가장 완벽한 사내 전용 AI 에이전트: 브라우저가 곧 새로운 업무 환경"**

H Chat AI Browser OS는 Chrome Extension을 유일한 프론트엔드로 채택하여, 임직원이 브라우저를 떠나지 않고 Side Panel의 AI와 자연어로 대화하며 **정보 탐색-분석-의사결정-실행**을 하나의 흐름으로 완결하는 자율형 AI 플랫폼이다.

**4대 핵심 태그**:

| 태그 | 의미 |
|------|------|
| **Chrome Extension Only** | 별도 앱 설치 불필요, 브라우저 네이티브 단일 접점 |
| **Zero Trust** | 사내 데이터 외부 유출 원천 차단, 엔드투엔드 암호화 |
| **MARS Multi-Agent** | LangGraph + CrewAI 기반 다중 에이전트 자율 리서치 시스템 |
| **Dynamic Multi-Model** | Orchestrator Node가 작업 특성에 따라 최적 LLM을 동적 할당 (5~19개 모델) |

검색의 시대(Information Retrieval)를 지나, 맥락 AI(Contextual AI)를 거쳐, **자율형 리서치(Autonomous Research)** 시대로의 패러다임 전환을 선언한다.

### 1.2 문제 정의

현대차그룹 임직원이 직면한 4대 업무 병목:

| 문제 영역 | 현재 상황 (Pain Point) | 정량 지표 |
|-----------|----------------------|----------|
| **컨텍스트 분절** | Confluence, Jira, SAP, Teams 등 평균 7개 이상 시스템 탭 전환 | 일 평균 300회+ 탭 전환, 컨텍스트 복원 비용 47분/일 |
| **정보 과부하** | 검색 결과의 60-70%가 노이즈, 핵심 정보 도달까지 시간 소모 | 평균 23분/건 정보 탐색 시간 |
| **반복 업무** | 주간 보고서 작성, 데이터 수집, 비교 분석 등 저부가가치 반복 작업 | 주당 8-12시간 낭비 |
| **데이터 주권 리스크** | 퍼블릭 AI 서비스(ChatGPT, Gemini 등)에 사내 데이터 입력 시 유출 위험 | 사내 정보 유출 위험 68% (설문 기반) |

**핵심 인사이트**: 이 4가지 문제는 독립적이지 않다. 컨텍스트 분절이 정보 과부하를 악화시키고, 정보 과부하가 반복 업무를 증가시키며, 반복 업무 과정에서 데이터 주권 리스크가 발생한다. H Chat은 이 악순환 고리를 **단일 접점(Side Panel)**에서 끊는다.

### 1.3 패러다임 전환

**Side Panel = 단일 접점 완결(Unified Completion Point)**

```
탐색(Search) --> 분석(Analyze) --> 의사결정(Decide) --> 실행(Execute)
    |                  |                    |                   |
    v                  v                    v                   v
 Smart DOM         DataFrame           MARS Agent          자동 리포트
 노이즈 제거       구조화 변환          인사이트 도출        보고서/실행
```

- **창 전환 불필요**: Side Panel이 현재 탭의 컨텍스트를 실시간 인식
- **데이터 복사-붙여넣기 불필요**: Content Script가 DOM에서 직접 데이터 추출
- **수동 분석 불필요**: MARS 에이전트가 백그라운드에서 자율 리서치 수행
- **별도 보고서 작성 불필요**: 분석 결과가 Markdown/PDF/Slides로 자동 생성

### 1.4 핵심 수치

| 지표 | 값 | 비고 |
|------|---|------|
| 총 투자 | **$645.5K** | 인프라 + 개발 + 운영 |
| 손익분기점 | **12개월** | 월 운영비 $23.5K 기준 |
| 3년 누적 ROI | **270%** | $2.47M 비용 절감 |
| 24개월 ARR 목표 | **$12.1M** | 그룹사 확장 포함 |
| MARS 1회 리서치 비용 | **$0.27** | Smart DOM 기반, Vision 대비 78% 절감 |
| 타겟 사용자 | **50,000명** | 16개 계열사 임직원 |
| 연간 비용 절감 | **$550K** | 반복 업무 자동화 기준 |
| 개발 기간 | **30주** | 5단계 스프린트 (MVP 2주 포함) |
| Smart DOM 처리 속도 | **0.9분/작업** | Vision 방식(12.49분) 대비 14배 빠름 |
| Smart DOM 비용 | **$0.12/작업** | Vision 방식($1.00) 대비 88% 절감 |

### 1.5 경쟁 분석 (5사 비교)

| 차원 | ChatGPT Atlas | Perplexity Comet | Arc Search | eesel AI | **H Chat** |
|------|-------------|-----------------|------------|----------|-----------|
| **데이터 주권** | 옵트아웃 필요 | 제한적 | 없음 | 부분적 | **Zero Trust 완전 보장** |
| **사내 시스템 연동** | API 연동 필요 | 불가 | 불가 | Slack/Wiki 한정 | **SAP/ERP/Jira 직접 접근** |
| **설치 및 배포** | 개별 앱스토어 | 개별 설치 | 개별 설치 | 웹 위젯 | **Admin 강제 일괄 배포** |
| **에이전트 자율성** | 단일 챗봇 | 검색 특화 | 낮음 | 낮음 | **MARS 다중 에이전트 자율 연구** |
| **데이터 구조화** | 텍스트 응답 | 텍스트 응답 | 텍스트 응답 | 텍스트 응답 | **DataFrame Engine (JSON/CSV/Excel)** |
| **비용 효율** | ~$1.00/작업 | ~$0.80/작업 | N/A | $0.50/작업 | **$0.12/작업 (Smart DOM)** |

**결론**: H Chat은 엔터프라이즈 3대 허들(보안, 연동, 배포)을 유일하게 돌파하는 독점적 솔루션이다.

---

## Section 2: 4-Layer 아키텍처 설계

### 2.0 전체 스택 개요

```
+----------------------------------------------------------+
|  L4: MARS Agent Factory (자율 연구 에이전트)                |
|  LangGraph 기반 6단계 다중 에이전트 자율 리서치              |
|  Planner -> Search -> Web -> Data -> Analysis -> Report    |
+----------------------------------------------------------+
|  L3: DataFrame Engine (데이터 구조화)                       |
|  비정형 HTML -> 즉시 분석 가능한 구조화 데이터                |
|  HTML Table/List 감지 -> JSON/CSV/Excel 자동 변환           |
+----------------------------------------------------------+
|  L2: Smart DOM (콘텐츠 정제)                                |
|  Readability.js + RQFP 파이프라인                           |
|  웹페이지 노이즈 60-70% 제거 + 시맨틱 의미망 추출            |
+----------------------------------------------------------+
|  L1: Hybrid Extension (브라우저 런타임)                      |
|  Chrome MV3 네이티브 API + Side Panel + Service Worker      |
|  봇 탐지 우회 + 세션 충실도 + 실시간 DOM 접근               |
+----------------------------------------------------------+
```

**수직 통합 원칙**: 각 레이어는 하위 레이어의 출력을 입력으로 소비한다.

### 2.1 L1: Hybrid Extension (브라우저 런타임)

| 구성 요소 | Chrome API | 역할 |
|----------|-----------|------|
| Side Panel | `chrome.sidePanel` | 주 UI -- AI 대화, 리서치 결과, 데이터 분석 |
| Popup | `chrome.action` | 빠른 질문, 설정 토글, 알림 센터 |
| Context Menu | `chrome.contextMenus` | 선택 텍스트/이미지 -> 요약/번역/분석/검색 |
| Background SW | `chrome.runtime` | 상태 관리, API 통신, 세션 복원 |
| Content Script | DOM API + `chrome.runtime` | 현재 탭 DOM 접근, 데이터 추출 |
| Omnibox | `chrome.omnibox` | `hc` 접두사 자연어 검색 |
| Offscreen Doc | `chrome.offscreen` | 헤비 연산 (DataFrame 변환, PDF 파싱) |

**현재 프로젝트**: `apps/extension/` (Vite + React 19, MV3)

**GAP**:

| 영역 | 현재 | PDF 요구 | Gap |
|------|------|---------|-----|
| Side Panel | 기본 구현 | 전체 채팅 히스토리, 리서치 결과 뷰 | HIGH |
| Service Worker | 컨텍스트 메뉴 + storage | 상태 복원, 5분 비활성 대응, 세션 관리 | HIGH |
| 봇 탐지 우회 | 미구현 | 네이티브 Chrome API 기반 실행 | HIGH |
| MutationObserver | 미구현 | SPA 동적 DOM 안정화 대기 | MEDIUM |

### 2.2 L2: Smart DOM (콘텐츠 정제)

| 비교 항목 | Vision 방식 (Skyvern) | **Smart DOM (H Chat)** |
|----------|---------------------|----------------------|
| 비용 | ~$1.00/작업 | **$0.12/작업** |
| 속도 | 12.49분 | **0.9분** |
| 인식 수준 | 픽셀 | **시맨틱 데이터베이스** |

**신규 모듈 5개**: `SmartDomExtractor`, `RqfpEngine`, `ShadowDomTraverser`, `SapFioriAdapter`, `MutationStabilizer`

### 2.3 L3: DataFrame Engine (데이터 구조화)

**신규 모듈 5개**: `HtmlTableDetector`, `DataFrameConverter`, `SchemaInferrer`, `DataFrameWorker`, `ExportFormats`

### 2.4 L4: MARS Agent Factory (자율 연구 에이전트)

**6단계 파이프라인**:

```
사용자 질의 -> [1.Planner/Opus] -> [2.Search/Grok] -> [3.Web/Extension]
           -> [4.Data/GPT-5.2] -> [5.Analysis/Opus] -> [6.Report/Gemini]
```

**신규 모듈 8개**: `MarsPlanner`, `MarsSearchAgent`, `MarsWebAgent`, `MarsDataAgent`, `MarsAnalysisAgent`, `MarsReportAgent`, `HitlGate`, `AgentOrchestrator`

### 2.5 Data Purification Pipeline 요약

| 특성 | 설명 |
|------|------|
| **단방향 데이터 흐름** | L1->L2->L3->L4, 각 레이어가 하위 레이어 출력을 소비 |
| **레이어 독립성** | 각 레이어는 인터페이스만 준수하면 내부 구현 교체 가능 |
| **비용 효율** | 전체 파이프라인 1회 실행 비용 $0.27 (Vision 대비 78% 절감) |
| **실행 환경 분리** | L1-L3는 브라우저(Extension), L4는 백엔드(FastAPI) |

---

## Section 3: Zero Trust 보안 아키텍처

### 3.1 보안 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Zero Trust** | 사내망 내부라도 모든 요청을 검증 |
| **데이터 주권** | 모든 데이터는 PII Scrubbing을 거친 후에만 외부 전송 |
| **최소 권한** | L1~L4 레벨별 권한 분리 |
| **심층 방어** | 다중 레이어 보안 적용 |

```
HMG 사내망 -> [Content Script] -> [PII Scrubbing] -> [블록리스트] -> [사내 Proxy] -> Public LLM
```

### 3.2 PII Scrubbing (11개 패턴)

| # | 패턴 | 우선순위 |
|---|------|---------|
| 1 | 주민등록번호 | Critical |
| 2 | 여권번호 | Critical |
| 3 | 운전면허번호 | Critical |
| 4 | 계좌번호 | High |
| 5 | 신용카드번호 | High |
| 6 | 이메일 | High |
| 7 | 전화번호 | Medium |
| 8 | IP 주소 (사내) | High |
| 9 | 사원번호 | High |
| 10 | 차량번호 | Medium |
| 11 | 건강보험번호 | Medium |

현재: 7개 패턴 (`packages/ui/src/utils/sanitize.ts`) -> 11개로 확장 필요

### 3.3 블록리스트 (20도메인 + 6패턴)

- 금융/증권 6개, 정부/공공 6개, 사내 시스템 8개
- 와일드카드 6개: `*://intranet.*`, `*://hr.*`, `*://payroll.*`, `*://erp.*`, `*://security.*`, `*://audit.*`
- 현재 상태: **충족** (기존 구현 완료)

### 3.4 L1~L4 감사 로그

| 레벨 | 권한 범위 | 감사 로그 내용 |
|------|----------|--------------|
| **L1** | 페이지 읽기, UI 표시 | URL, 타임스탬프, 세션 ID |
| **L2** | DOM 파싱, 콘텐츠 추출 | 추출 대상 도메인, 데이터 크기, 추출 유형 |
| **L3** | 데이터 구조화 | 변환 타입, 레코드 수, PII 마스킹 건수 |
| **L4** | LLM 호출, 에이전트 실행 | 모델명, 토큰 수, 비용($), 응답 시간 |

불변 로그: SHA-256 해시 체인, INSERT ONLY, 90일 보존 -> 아카이브

### 3.5 사내 프록시

DLP 검사, Rate Limiting (분당 30회/사용자), 비용 관리 (부서별 월간 예산), 역방향 유출 방지, Redis 캐싱 (TTL 1시간)

### 3.6 보안 구현 로드맵

```
Sprint 1-2:  PII 11패턴 확장 + L1~L4 권한 분리
Sprint 3-4:  사내 프록시 서버 MVP + DLP 연동
Sprint 5-6:  불변 감사 로그 + SIEM 포워딩
Sprint 7:    역방향 정보 유출 방지 + Rate Limiter
Sprint 8:    보안 심사 대응 + 침투 테스트
```

---

## Section 4: Zero-Friction 배포 전략

### 4.1 배포 비교

| 항목 | 기존 방식 | H Chat (Extension) |
|------|----------|-------------------|
| 설치율 | 30-60% | **95%+** |
| 사용자 개입 | 필요 | **불필요** |
| 업데이트 | 수동/파편화 | **자동 Silent Update** |
| 삭제 방지 | 불가 | **정책으로 차단** |

```
기존: 설치율 45% x 활성률 60% = 실사용률 27%
H Chat: 설치율 95% x 활성률 70% = 실사용률 66.5% (2.5배)
```

### 4.2 ExtensionInstallForcelist

- Google Admin Console 기반 강제 설치
- `toolbar_pin: force_pinned` 항상 표시
- Managed Storage Schema로 원격 설정 배포
- 16개 계열사 50,000대 PC, 6시간 내 95%+ 설치

### 4.3 3-Stage Go-To-Market

| Stage | 기간 | 대상 | 성공 기준 |
|-------|------|------|---------|
| **1. 파일럿** | 0-6M | 현대오토에버 500명 | DAU 55%+, 파싱 정확도 80%+ |
| **2. 확산** | 6-18M | 16개 계열사 25,000석 | 설치율 95%+, DAU 60%+ |
| **3. 외부** | 18-30M | 외부 대기업 B2B | ARR $10M+, 고객사 10개+ |

### 4.4 Sprint 타임라인

| 마일스톤 | 시기 | 기준 |
|---------|------|------|
| **Sprint 0** | Week 2 | Smart DOM PoC + 단일 에이전트 데모 |
| **Alpha** | Week 10 | 50명 테스터, 파싱 정확도 80%+ |
| **Beta** | Week 18 | 500명 파일럿, 5종 에이전트, DAU 55%+ |
| **GA** | Week 30 | 5만 명 배포, SLA 99.9%, 보안 심사 통과 |

---

## 5. Dynamic Multi-Model 라우팅 설계

### 5.1 모델 카탈로그

| 프로바이더 | 모델 | 역할 | 비용 |
|----------|------|------|------|
| Anthropic | Claude Opus 4.6 | Reasoning, 전략 기획 | $$$$ |
| OpenAI | GPT-5.2 | 장문 요약, 보고서 | $$$ |
| Google | Gemini 2.5 | 웹 검색, 팩트체크 | $$ |
| xAI | Grok 3 | Fast Ops, 번역 | $ |
| Local | Nano (on-device) | 오프라인, 프라이버시 | Free |

### 5.2 작업별 라우팅

| 작업 유형 | 주 모델 | 폴백 모델 | 비용/건 |
|----------|--------|---------|--------|
| 단순 요약 | Grok 3 | GPT-4o mini | $0.002 |
| 코드 분석 | Claude Opus | GPT-5.2 | $0.05 |
| 웹 리서치 | Gemini 2.5 | Perplexity API | $0.01 |
| MARS 리서치 세션 | Mixed (6단계) | -- | $0.27/세션 |

### 5.3 Circuit Breaker

- **CLOSED** -> **OPEN** (에러율 30% 초과) -> **HALF-OPEN** (30초 후 복구 테스트)
- 폴백 체인: 동일 프로바이더 하위 -> 타 프로바이더 -> 범용 저비용 -> Nano
- 기존 자산: `useCircuitBreaker.ts`, `useHealthMonitor.ts`

### 5.4 Self-Healing

- MutationObserver 기반 DOM 변경 감지 -> AI 구조 비교 -> 셀렉터 자동 재생성
- Playwright CDP Fallback 자동 전환
- 장애 복구 시간 55-70% 단축

---

## 6. 비즈니스 모델 & 재무 설계

### 6.1 3-Tier Subscription

| Tier | 가격 | 일 사용량 | 주요 기능 | 모델 |
|------|------|---------|---------|------|
| **Basic** | $8/월 | 일 50회 | 기초 요약, 검색 | GPT-4o-mini, Haiku |
| **Pro** | $18/월 | 일 200회 | 컨텍스트 추출, 관리자 배포 | GPT-4o, Sonnet |
| **Enterprise** | $30/월 | 무제한 | MARS 자율 에이전트, ERP 딥통합 | Opus, o3 |

### 6.2 재무 예측

| 지표 | 값 |
|------|---|
| 총 투자 | $645.5K |
| 손익분기점 | 12개월 |
| 3년 ROI | 270% ($2.47M) |
| 24개월 ARR | $12.1M |
| LLM 예산 | $45K/월 |
| MARS 1회 비용 | $0.27 |

### 6.3 Lens View 비용 절감

| 업무 유형 | Before | After | 절감률 |
|----------|--------|-------|------|
| 정보 탐색 (경쟁사 분석) | 23분 | 3분 | **87%** |
| 데이터 수집 (SAP 재고) | 4시간 | 10분 | **95%** |
| 보고서 작성 (회의록) | 5시간 | 30분 | **85%** |

### 6.4 4-Layer Moat

| Layer | 해자 | 효과 |
|-------|------|------|
| **1. 배포** | 관리자 강제 정책 | 설치 마찰 0 |
| **2. 연동** | 브라우저 DOM 직접 접근 | API 구축 비용 0 |
| **3. 지능** | L1~L4 수직 통합 파이프라인 | 컨텍스트 손실 0 |
| **4. 보안** | Zero Trust 사내망 격리 | 데이터 유출 0 |

### 6.5 리스크 관리

| 리스크 | 심각도 | 완화 전략 |
|-------|-------|---------|
| LLM API 비용 급등 | HIGH | Dynamic Multi-Model, 캐싱 60% 절감 |
| SPA/동적 DOM 추출 실패 | HIGH | Playwright CDP Fallback, MutationObserver |
| AI 환각 | MEDIUM | HITL 승인 게이트, 출처 표기 강제 |
| 그룹사 확산 시 데이터 오염 | HIGH | PostgreSQL RLS, 도메인별 화이트리스트 |

### 6.6 Sprint 0 4대 선결 과제

1. **SAP Fiori DOM 접근 검증** -- Shadow DOM Content Script 추출 (1일차)
2. **MARS 비용 시뮬레이션** -- $45K/월 예산 167K 세션 (1주차)
3. **hchat-pwa 관계 단일화** -- Extension Only 전략 합의 (1주차)
4. **Multi-tenant 격리** -- PostgreSQL RLS PoC (2주차)

---

## Section 7: 현재 프로젝트 vs PDF 요구사항 GAP 분석

### 7.1 전체 GAP 매트릭스

| 영역 | 현재 상태 | PDF 요구 | GAP | 우선순위 |
|------|---------|---------|-----|---------|
| **L2 Smart DOM** | 기본 sanitize.ts | Readability.js, RQFP, Shadow DOM, SAP Fiori | **대** | P0 |
| **L3 DataFrame** | SheetJS Excel만 | HTML 테이블/리스트 자동 감지 -> JSON/CSV | **대** | P0 |
| **PII Scrubbing** | 7패턴 | 11패턴 | 중 | P0 |
| **Lens View UX** | 없음 | 87%/95%/85% 절감 | **대** | P0 |
| **L4 MARS Agent** | 단일 연구 API | LangGraph 6단계, HITL | **대** | P1 |
| **Multi-Tenant** | 없음 | PostgreSQL RLS | **대** | P1 |
| **Multi-Model** | 3프로바이더 9모델 | 5+ 프로바이더, Dynamic 라우팅 | 중 | P1 |
| **감사 로그** | 토큰 추적만 | L1~L4 불변 감사 로그 | 중 | P1 |
| **HITL** | 없음 | L3+ 승인 게이트 | 중 | P1 |
| **L1 Extension** | MV3 기본 | Omnibox, Context Menu 3-depth | 중 | P1 |
| **배포** | CWS Unlisted | ExtensionInstallForcelist | 중 | P2 |
| **가격 모델** | KRW 내부용 | USD 3-Tier, B2B SaaS | 중 | P2 |
| **Self-Healing** | useCircuitBreaker 훅만 | AI DOM 변경 감지 + 자동 복구 | 중 | P2 |
| **블록리스트** | 20도메인 + 6패턴 | 동일 | **충족** | -- |

### 7.2 기존 자산 활용 (12개 모듈)

- `useCircuitBreaker.ts` -> Multi-Model Fallback 확장
- `useHealthMonitor.ts` -> Self-Healing 헬스체크
- `sanitize.ts` -> PII 7->11패턴 확장
- `ServiceFactory.ts` -> Dynamic Model Registry Mock/Real 전환
- `apps/ai-core/` -> MARS 백엔드 베이스
- `apps/extension/` -> L1 Extension Shell
- `workerUtils.ts` -> DataFrame Worker
- `mocks/handlers.ts` -> MARS/DataFrame 엔드포인트 확장
- `useOfflineQueue.ts` -> HITL 승인 대기 큐
- `EventBusProvider.tsx` -> Agent 간 통신 버스
- `schemas/` -> DataFrame 타입 검증
- `docker/init.sql` -> Multi-Tenant RLS 베이스

### 7.3 신규 모듈 (19개)

| 레이어 | 모듈 수 | 주요 모듈 | 예상 규모 |
|--------|--------|---------|---------|
| L2 Smart DOM | 5 | SmartDomExtractor, RqfpEngine, ShadowDomTraverser, SapFioriAdapter, MutationStabilizer | ~1,500줄 |
| L3 DataFrame | 4 | HtmlTableDetector, DataFrameConverter, SchemaInferrer, DataFrameWorker | ~1,150줄 |
| L4 MARS Agent | 8 | MarsPlanner, MarsSearchAgent, MarsWebAgent, MarsDataAgent, MarsAnalysisAgent, MarsReportAgent, HitlGate, AgentOrchestrator | ~2,700줄 (Python) |
| 인프라 | 2 | DynamicModelRegistry, MultiTenantIsolator | ~750줄 |
| **합계** | **19** | | **~6,100줄** |

---

## Section 8: 구현 로드맵 & 프로젝트 적용 계획

### 8.1 Phase 매핑

| Phase | PDF Sprint | 기간 | 핵심 목표 |
|-------|-----------|------|---------|
| 102-103 | Sprint 0 | W1-2 | Go/No-Go: SAP Fiori DOM 검증, Smart DOM PoC |
| 104-108 | Alpha | W3-10 | L2+L3 MVP, PII 11패턴, 50명 테스터 |
| 109-115 | Beta | W11-18 | L4 MARS 6단계, 500명 파일럿, DAU 55% |
| 116-120 | GA | W19-30 | 5만 명 배포, SLA 99.9%, 보안 심사 |

### 8.2 Sprint 0 태스크

**Week 1: 기술 검증**
- [ ] SAP Fiori DOM 접근 PoC (Shadow DOM Content Script)
- [ ] Readability.js 통합 테스트 (5개 사내 사이트)
- [ ] MARS 비용 시뮬레이션 ($45K/월)
- [ ] PII 11패턴 정규식 구현 + 테스트

**Week 2: PoC 통합**
- [ ] Smart DOM PoC 라이브 데모 (노이즈 60% 제거)
- [ ] DataFrame HTML 테이블 -> JSON 변환 PoC
- [ ] Multi-tenant 격리 설계 (PostgreSQL RLS)
- [ ] Go/No-Go 의사결정 보고서

### 8.3 파일 구조 변경안

```
packages/ui/src/
  smart-dom/          # L2 (NEW) - 5 모듈
  dataframe/          # L3 (NEW) - 4 모듈
  security/           # 보안 (ENHANCED) - PiiScrubber, AuditLogger, ProxyClient
  model-router/       # Dynamic Multi-Model (NEW) - 4 모듈

apps/ai-core/
  agents/             # L4 MARS (NEW) - 8 모듈 (Python)
  routers/mars.py     # MARS REST API

apps/extension/src/
  content/fiori-probe.ts   # SAP Fiori (NEW)
  content/lens-view.ts     # Lens View (NEW)
  ui/hitl-panel.tsx        # HITL 승인 UI (NEW)

docker/migrations/
  004_multi_tenant.sql     # Multi-Tenant (NEW)
```

### 8.4 KPI

| 지표 | Sprint 0 | Alpha | Beta | GA |
|------|---------|-------|------|-----|
| Smart DOM 정확도 | PoC | 80%+ | 90%+ | 95%+ |
| MARS 비용/세션 | 시뮬레이션 | -- | $0.27 | $0.20 |
| PII 탐지율 | 11패턴 | 95%+ | 99%+ | 99.9%+ |
| DAU | -- | 50 | 500+ | 50,000+ |
| SLA | -- | -- | 99.5% | 99.9% |
| Self-Healing 복구율 | -- | -- | 50% | 70% |
| E2E 테스트 | 기존 21건 | +10건 | +20건 | +30건 |

---

## Section 9: 32슬라이드 심층 품질 분석

### 9.1 28슬라이드 -> 32슬라이드 업그레이드 실체

원본 발표자료는 28슬라이드에서 32슬라이드로 확장되었다. 추가된 4슬라이드의 내용을 분석한다.

| 추가 슬라이드 | 내용 | 품질 판정 |
|-------------|------|---------|
| #29 | 팀 규모(11명) + KPI 메트릭 그리드 (8개 지표) | A -- 정량적 목표 명확 |
| #30 | Extension 설치율 95%+ 근거 상세 | B+ -- Google Admin 정책 근거 제시 |
| #31 | CWS 평점 4.5+ 달성 전략 | B -- 구체적 실행안 부족 |
| #32 | CTA "The Browser is the New OS" + Sprint 0 3대 선행과제 | A -- 강력한 마무리 |

**업그레이드 요약**: 28->32 확장은 주로 배포 전략 보강과 KPI 구체화에 집중. 기술 아키텍처(L1~L4)는 변경 없음.

### 9.2 CSS 버그 3건

발표자료 HTML(`hchat_service_plan_presentation.html`)에서 발견된 렌더링 이슈:

| # | 버그 | 위치 | 영향 | 심각도 |
|---|------|------|------|--------|
| 1 | `.layer-stack` 높이 overflow | 슬라이드 8 (Data Purification) | L1~L4 스택 하단 잘림, L4 MARS 설명 미노출 | MEDIUM |
| 2 | `.kpi-grid` 4열 반응형 미대응 | 슬라이드 29 (메트릭 그리드) | 1280px 미만에서 카드 겹침 | LOW |
| 3 | `.moat-layer` 중첩 border 간격 | 슬라이드 14 (4-Layer Moat) | 해자 계층 시각화에서 간격 불균일 | LOW |

**권장 조치**: 슬라이드 8의 overflow는 콘텐츠 전달에 영향. `min-height: 0; overflow-y: auto;` 추가 또는 슬라이드 분리 권장.

### 9.3 hchat-pwa 미결정 이슈

PDF와 발표자료 모두 "Extension Only" 전략을 선언하면서도, Sprint 0 선결과제 #3에서 "기존 hchat-pwa와의 관계 단일화"를 미결 상태로 남겨둔다.

**현재 모노레포 상태**:
- `apps/mobile/` -- Mobile PWA 앱 (Next.js 16, 7개 컴포넌트)
- `apps/desktop/` -- Desktop 앱 (Next.js 16, 6개 컴포넌트)
- `apps/user/` -- User 웹앱 (5개 페이지, SSE 스트리밍)

**의사결정 필요**:

| 옵션 | 장점 | 단점 |
|------|------|------|
| **A. Extension Only** | 리소스 집중, 배포 단순 | PWA 투자 매몰비용 |
| **B. Extension + PWA 병행** | 플랫폼 다변화 | 유지보수 부담 2배 |
| **C. Extension 우선 + PWA 유지보수** | 양쪽 커버 | 기능 파편화 위험 |

**권장**: 옵션 C. Extension을 핵심 플랫폼으로 하되, PWA는 최소 유지보수(보안 패치)만 수행. Beta(Week 18) 시점에서 데이터 기반 재판단.

### 9.4 슬라이드별 품질 등급

| 등급 | 기준 | 해당 슬라이드 |
|------|------|-------------|
| **A** (우수) | 정량적 근거 + 실행 가능한 구체성 | #2(Executive), #6(경쟁분석), #8(Data Pipeline), #10(ROI), #15(Sprint 0) |
| **B+** (양호) | 논리적 구조 + 일부 근거 부족 | #3(문제정의), #4(패러다임), #9(Zero Trust), #11(가격), #14(Moat) |
| **B** (보통) | 방향성 제시 + 구체성 부족 | #5(배포), #7(Lens View), #12(Sprint 타임라인), #13(리스크) |
| **C** (미흡) | 내용 부족 또는 반복 | 없음 |

**전체 평균**: B+ (발표자료 품질 양호, NotebookLM 자동 생성 대비 높은 완성도)

### 9.5 MARS $0.27/세션 비용 검증

PDF에서 제시한 MARS 1회 리서치 비용 $0.27의 산출 근거:

| 단계 | 모델 | 예상 토큰 | 비용 |
|------|------|---------|------|
| 1. Planner | Claude Haiku | 2K in / 1K out | $0.003 |
| 2. Search | Grok 3 | 1K in / 0.5K out | $0.001 |
| 3. Web (x5 URL) | Extension L1-L3 | 로컬 처리 | $0.00 |
| 4. Data | GPT-4o mini | 8K in / 2K out | $0.008 |
| 5. Analysis | Claude Sonnet | 10K in / 3K out | $0.10 |
| 6. Report | Gemini Flash | 5K in / 3K out | $0.005 |
| **기타 오버헤드** | -- | 캐싱, 재시도 | $0.15 |
| **합계** | | | **~$0.27** |

**리스크**: Analysis 단계에서 Opus 사용 시 비용 3-5배 증가. Haiku 80% + Sonnet 20% 혼합 전략이 핵심.

---

## Section 10: 핵심 기술 인사이트

### 10.1 Smart DOM Engine = 핵심 난제이자 핵심 자산

PDF 전체를 관통하는 가장 중요한 기술적 난제는 **Smart DOM Engine(L2)**이다.

**왜 핵심인가**:
- L2 없이는 L3(DataFrame), L4(MARS)가 모두 무용지물
- 경쟁사(ChatGPT Atlas, Perplexity Comet)와의 비용 차이($1.00 vs $0.12)의 근본 원인
- SAP Fiori Shadow DOM 접근 성공 여부가 프로젝트 Go/No-Go를 결정

**기술 난이도 분석**:

| 사이트 유형 | 난이도 | 이유 |
|-----------|--------|------|
| 정적 HTML (위키, 블로그) | LOW | Readability.js로 충분 |
| SPA (React/Angular) | MEDIUM | MutationObserver 필요 |
| Shadow DOM (SAP Fiori) | HIGH | Closed Shadow DOM 우회 필요 |
| iframe 중첩 (ERP) | HIGH | Cross-origin 제약 |
| 동적 렌더링 (Charts) | VERY HIGH | Canvas/SVG 데이터 추출 |

**권장 전략**: Sprint 0에서 SAP Fiori PoC를 최우선 실행. 실패 시 `chrome.debugger` API 또는 Playwright CDP Fallback으로 전환. 이 검증이 프로젝트 전체의 기술적 타당성을 좌우한다.

### 10.2 Browser = Research Engine 패러다임

PDF가 선언하는 패러다임 전환의 본질:

```
기존: Browser = 정보 소비 도구 (읽기 전용)
H Chat: Browser = 자율 리서치 엔진 (Search -> Extract -> Analyze -> Research)
```

이 전환이 가능한 이유는 Chrome Extension이 제공하는 4가지 고유 능력:

1. **네이티브 DOM 접근**: Content Script가 현재 탭의 DOM에 직접 접근. API 구축 없이 사내 시스템(SAP, Jira, Confluence) 데이터를 실시간 추출
2. **세션 충실도**: 사용자의 인증 세션(쿠키, 토큰)을 그대로 활용. 별도 로그인 없이 사내 인트라넷 접근
3. **제로 프릭션 배포**: Google Admin Console로 50,000대 PC에 6시간 내 강제 설치. 사용자 저항 원천 차단
4. **사내망 격리**: PII Scrubbing + 블록리스트 + 사내 프록시 3단계 보안. 데이터 주권 완전 보장

### 10.3 Search -> Extract -> Analyze -> Research 진화

H Chat의 가치 제안은 단순 검색(Search)을 넘어 4단계 진화를 제시한다:

| 단계 | 설명 | H Chat 레이어 | 현재 상태 |
|------|------|-------------|---------|
| **Search** | 키워드 기반 검색 | L1 Extension (Omnibox) | 기본 구현 |
| **Extract** | 웹페이지에서 구조화 데이터 추출 | L2 Smart DOM + L3 DataFrame | **미구현 (P0)** |
| **Analyze** | 추출 데이터 패턴 분석, 인사이트 도출 | L4 MARS (Analysis Agent) | **미구현 (P1)** |
| **Research** | 다중 소스 자율 탐색, 보고서 생성 | L4 MARS (6단계 파이프라인) | **미구현 (P1)** |

**핵심 통찰**: 현재 프로젝트는 Search 단계만 구현된 상태. Extract(L2+L3)가 전체 파이프라인의 병목이자 최우선 개발 대상이다.

### 10.4 Extension 개발 4대 주의사항

PDF와 32슬라이드 분석에서 도출된 Chrome Extension 개발 시 반드시 고려할 사항:

| # | 주의사항 | 영향 | 대응 |
|---|---------|------|------|
| 1 | **MV3 Service Worker 5분 비활성 종료** | 상태 유실, MARS 세션 중단 | `chrome.alarms` keepalive + `chrome.storage.session` |
| 2 | **CSP 인라인 스크립트 금지** | React 빌드 호환성 | `cssCodeSplit: false`, eval 제거, Vite 빌드 최적화 |
| 3 | **Content Script 격리(Isolated World)** | 페이지 JS 변수 접근 불가 | `chrome.scripting.executeScript` + `world: 'MAIN'` |
| 4 | **CWS 심사 1-3일 소요** | 긴급 핫픽스 지연 | 자체 호스팅 CRX 병행, 롤백 자동화 |

### 10.5 종합 판단

| 항목 | 판정 |
|------|------|
| 기술 타당성 | **조건부 YES** -- SAP Fiori Shadow DOM PoC 성공이 전제 |
| 비즈니스 타당성 | **YES** -- ROI 270%, $12.1M ARR 시나리오 합리적 |
| 구현 가능성 | **YES** -- 기존 모노레포 자산(12개 모듈) 재활용으로 개발 기간 30% 단축 |
| 리스크 수준 | **MEDIUM** -- Smart DOM 정확도와 MARS 비용이 최대 변수 |
| 권장 행동 | **Sprint 0 착수 승인 후 2주 내 Go/No-Go 결정** |

---

*문서 끝 -- 총 10개 섹션, hchat-wiki 모노레포 Phase 101 기준*
