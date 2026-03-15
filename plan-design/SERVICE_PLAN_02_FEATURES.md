# H Chat Chrome Extension -- 서비스 기획서 Part 2: 핵심 기능 명세 + UX 시나리오

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.0 |
| 작성일 | 2026-03-14 |
| 작성자 | Worker B (기능 명세 + UX 시나리오) |
| 상위 문서 | SERVICE_PLAN_01 (비전/전략), SERVICE_PLAN_03 (기술 아키텍처) |

> **v2.0 변경 요약**: Chrome Extension이 유일한 클라이언트임을 전제로 전면 재작성. UI 서피스를 Side Panel / Popup / Context Menu / Omnibox 4종으로 한정하고, 모든 기능에 Extension 컴포넌트 매핑(Side Panel / Content Script / Background Service Worker)을 명시. Omnibox 통합(F16) 신규 추가. 오프라인 큐를 Background Service Worker 기반으로 재정의.

---

## 1. 기능 아키텍처 개요

### 1.1 Chrome Extension 유일 클라이언트 원칙

H Chat의 모든 사용자 인터랙션은 **Chrome Extension** 내에서 발생한다. 별도의 웹앱, 데스크톱 앱, 모바일 앱은 존재하지 않는다. Extension이 제공하는 4가지 UI 서피스는 다음과 같다.

| UI 서피스 | Chrome API | 역할 | 상시성 |
|-----------|-----------|------|--------|
| **Side Panel** | `chrome.sidePanel` | 주 인터페이스. 채팅, 리서치, 데이터, 감사로그 | 항상 열어둘 수 있음 |
| **Popup** | `chrome.action` | 퀵 액션 런처. 최근 활동 요약 | 클릭 시 열림 |
| **Context Menu** | `chrome.contextMenus` | 우클릭 분석 (요약/번역/설명/리서치/데이터 추출) | 우클릭 시 표시 |
| **Omnibox** | `chrome.omnibox` | 주소창에서 `hchat` 키워드로 즉시 AI 호출 | 키워드 입력 시 활성 |

### 1.2 Extension 컴포넌트 아키텍처

```
+------------------------------------------------------------------+
|                    Chrome Browser Process                         |
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------------+    +-----------------------------+      |
|  |   Background SW       |    |   Content Script            |      |
|  |   (Service Worker)    |    |   (각 탭에 주입)             |      |
|  |                       |    |                             |      |
|  |  - SSE 연결 관리      |<-->|  - DOM 추출 (Readability)   |      |
|  |  - Omnibox 핸들러     |    |  - RQFP 엔진               |      |
|  |  - 오프라인 큐        |    |  - 테이블 감지/변환         |      |
|  |  - PII 마스킹         |    |  - 에이전틱 브라우징 실행   |      |
|  |  - 모델 라우팅        |    |  - 봇 탐지 우회            |      |
|  |  - 알림 발송          |    |  - 페이지 하이라이트        |      |
|  |  - MARS 파이프라인    |    |                             |      |
|  |  - Self-Healing       |    +-----------------------------+      |
|  +-----------+-----------+                                         |
|              |                                                     |
|    +---------+---------+--------+-----------+                      |
|    |                   |        |           |                      |
|  +-v-----------+  +----v----+  +v--------+ +v---------+           |
|  | Side Panel  |  | Popup   |  | Context | | Omnibox  |           |
|  | (주 UI)     |  | (퀵)    |  | Menu    | | (주소창) |           |
|  +-------------+  +---------+  +---------+ +----------+           |
+------------------------------------------------------------------+
```

### 1.3 4-Layer + Cross-cutting 기능 맵

```mermaid
graph TB
    subgraph "Cross-cutting Concerns"
        CC1[Dynamic Multi-Model<br/>작업별 최적 모델 자동 선택]
        CC2[Human-in-the-Loop<br/>위험도별 승인 체계]
        CC3[Self-Healing<br/>진단-치유-검증-복원]
        CC4[Zero Trust Security<br/>에이전트 권한-PII-감사]
    end

    subgraph "L4 -- MARS Research Pipeline"
        L4A[Planner Agent]
        L4B[Search Agent]
        L4C[Web Agent]
        L4D[Data Agent]
        L4E[Analysis Agent]
        L4F[Report Agent]
        L4G["5종 전문 에이전트<br/>(Analyst-Researcher-Writer-Editor-AutoResearcher)"]
    end

    subgraph "L3 -- DataFrame Engine"
        L3A[HTML Table Parser]
        L3B[List-to-JSON Converter]
        L3C[CSV/Excel Export]
        L3D[Data Preview Panel]
    end

    subgraph "L2 -- Smart DOM"
        L2A["Readability.js<br/>(노이즈 60-70% 제거)"]
        L2B["RQFP Engine<br/>(관계형 데이터 추출)"]
        L2C[Semantic DOM Tree]
    end

    subgraph "L1 -- Hybrid Extension"
        L1A[Side Panel Agent UI]
        L1B[Background SW + Content Script]
        L1C[봇 탐지 우회]
        L1D[세션 충실도 관리]
        L1E[Omnibox 통합]
    end

    L1A --> L2A
    L2A --> L3A
    L3A --> L4A
    L4A --> L4B --> L4C --> L4D --> L4E --> L4F

    CC1 -.-> L4A
    CC2 -.-> L4C
    CC3 -.-> L1B
    CC4 -.-> L1A
    CC4 -.-> L2B
    CC4 -.-> L3C
    CC4 -.-> L4G
```

### 1.4 계층별 역할 요약

| Layer | 명칭 | 핵심 역할 | 주요 산출물 | Extension 컴포넌트 |
|-------|------|-----------|------------|-------------------|
| L1 | Hybrid Extension | 브라우저 런타임, UI 셸, 메시징, Omnibox | Side Panel, Popup, Context Menu, Omnibox, 알림 | Background SW + Side Panel + Popup |
| L2 | Smart DOM | 웹페이지 구조 분석, 노이즈 제거 | 정제된 텍스트, 시맨틱 트리 | Content Script |
| L3 | DataFrame | 정형 데이터 추출 및 변환 | JSON, CSV, Excel 파일 | Content Script + Background SW |
| L4 | MARS | 멀티 에이전트 리서치 파이프라인 | 분석 보고서, 액션 아이템 | Background SW |

---

## 2. 핵심 기능 명세 (Feature Specification)

### F01. Side Panel Agent UI

| 항목 | 내용 |
|------|------|
| **Layer** | L1 |
| **우선순위** | P0 |
| **Extension 컴포넌트** | **Side Panel** (렌더링) / **Background SW** (상태 관리, 세션 유지) |
| **설명** | Chrome Side Panel API(`chrome.sidePanel`) 기반 상시 에이전트 인터페이스. 채팅, 분석 결과, 작업 진행률을 브라우저 우측 패널에 표시한다. 사용자가 Chrome 브라우저에서 어떤 사이트를 탐색하든 Side Panel은 유지된다. |
| **사용자 스토리** | 사용자로서 Chrome 브라우저에서 웹 브라우징 중 화면 전환 없이 AI에게 질문하고 결과를 받고 싶다. |
| **수용 기준** | (1) Side Panel 열기/닫기 토글이 0.3초 이내 반응 (2) 채팅 히스토리가 `chrome.storage.local`에 세션 간 유지 (3) 현재 탭 URL/제목이 `chrome.tabs` API로 컨텍스트 자동 전달 (4) 다크/라이트 테마 지원 (`prefers-color-scheme` 연동) |

### F02. Smart DOM 콘텐츠 추출

| 항목 | 내용 |
|------|------|
| **Layer** | L2 |
| **우선순위** | P0 |
| **Extension 컴포넌트** | **Content Script** (DOM 접근, Readability 실행) / **Background SW** (결과 캐싱) |
| **설명** | Content Script에서 Readability.js를 실행하여 광고/네비게이션/푸터 등 노이즈를 60-70% 제거하고, RQFP 엔진으로 엔티티 관계를 추출한다. 추출된 결과는 `chrome.runtime.sendMessage`로 Background SW에 전달된다. |
| **사용자 스토리** | 사용자로서 Chrome에서 보고 있는 복잡한 웹페이지에서 핵심 내용만 깔끔하게 추출하고 싶다. |
| **수용 기준** | (1) 뉴스/블로그 본문 추출 정확도 90% 이상 (2) 추출 소요 시간 2초 이내 (3) 이미지/표 포함 구조 보존 (4) 다국어(한/영/일/중) 지원 |

### F03. 컨텍스트 메뉴 분석

| 항목 | 내용 |
|------|------|
| **Layer** | L1 + L2 |
| **우선순위** | P0 |
| **Extension 컴포넌트** | **Context Menu** (진입점, `chrome.contextMenus`) / **Content Script** (선택 텍스트 수집) / **Background SW** (AI 호출) / **Side Panel** (결과 표시) |
| **설명** | 텍스트 선택 후 우클릭으로 요약/설명/번역/리서치 4가지 분석을 즉시 실행한다. Context Menu 클릭 이벤트는 Background SW에서 수신하고, 결과는 Side Panel에 스트리밍 표시된다. |
| **사용자 스토리** | 사용자로서 Chrome에서 영문 기술 문서를 읽다가 특정 단락을 선택해 한국어 요약을 즉시 보고 싶다. |
| **수용 기준** | (1) 선택 텍스트 10,000자까지 처리 (2) 결과가 Side Panel에 SSE 스트리밍 표시 (3) 결과 복사/공유 버튼 제공 (4) 분석 이력 최근 50건 `chrome.storage.local` 보관 |

### F04. SSE 스트리밍 응답

| 항목 | 내용 |
|------|------|
| **Layer** | L1 |
| **우선순위** | P0 |
| **Extension 컴포넌트** | **Background SW** (SSE 연결 수립, `fetch` + `ReadableStream`) / **Side Panel** (토큰 렌더링) |
| **설명** | Background Service Worker에서 AI Core 백엔드의 SSE 엔드포인트에 `fetch`로 연결하고, `ReadableStream`으로 토큰 단위 스트리밍을 수신한다. 수신된 토큰은 `chrome.runtime.sendMessage`로 Side Panel에 전달되어 실시간 타이핑 효과를 표시한다. |
| **사용자 스토리** | 사용자로서 Chrome Extension Side Panel에서 AI 응답이 실시간으로 출력되어 대기 시간을 체감적으로 줄이고 싶다. |
| **수용 기준** | (1) 첫 토큰 표시까지 TTFT 500ms 이내 (2) 스트리밍 중 중단(Stop) 버튼 동작 (3) 네트워크 끊김 시 Background SW에서 자동 재연결 (3회) (4) 마크다운 렌더링 실시간 반영 |

### F05. DataFrame 자동 변환

| 항목 | 내용 |
|------|------|
| **Layer** | L3 |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Content Script** (HTML 테이블 감지, DOM 파싱) / **Background SW** (JSON 변환, SheetJS XLSX 생성) / **Side Panel** (미리보기 렌더링) |
| **설명** | Content Script가 현재 페이지의 HTML 테이블과 리스트를 자동 감지하여 Background SW로 전달하고, JSON/CSV/XLSX로 변환한다. 미리보기는 Side Panel의 데이터 탭에 렌더링된다. |
| **사용자 스토리** | 사용자로서 Chrome에서 열린 사내 ERP 화면의 재고 테이블을 클릭 한 번으로 Excel 파일로 내려받고 싶다. |
| **수용 기준** | (1) 페이지 내 테이블 자동 감지율 95% (2) 1,000행 이하 테이블 변환 3초 이내 (3) JSON/CSV/XLSX 3종 내보내기 (`chrome.downloads` API) (4) Side Panel 미리보기에서 열 필터링/정렬 가능 |

### F06. Dynamic Multi-Model 선택

| 항목 | 내용 |
|------|------|
| **Layer** | Cross-cutting |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Background SW** (모델 라우팅 로직, AI Core 통신) / **Side Panel** (모델 표시, 수동 오버라이드 UI) |
| **설명** | Background SW에서 작업 유형(요약/번역/코드/리서치/분석)을 분류하고 5개 모델 풀에서 최적 모델을 자동 선택한다. Side Panel 헤더의 모델 드롭다운에서 사용자가 수동 오버라이드할 수 있다. |
| **사용자 스토리** | 사용자로서 모델을 수동 선택하지 않아도 작업에 맞는 최적의 AI가 자동 배정되길 원한다. |
| **수용 기준** | (1) 모델 선택 지연 100ms 이내 (2) Side Panel에서 수동 오버라이드 가능 (3) 선택 근거 툴팁 표시 (4) 비용/성능 통계를 Side Panel 설정 탭에서 확인 |

### F07. MARS 리서치 파이프라인

| 항목 | 내용 |
|------|------|
| **Layer** | L4 |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Background SW** (파이프라인 오케스트레이션, 에이전트 실행) / **Side Panel** (진행률 표시, 중간 결과 검토) / **Content Script** (Web Agent의 페이지 접근) |
| **설명** | Background SW에서 Planner->Search->Web->Data->Analysis->Report 6단계 파이프라인을 오케스트레이션한다. Web Agent는 Content Script를 통해 수집 대상 페이지에 접근하고, 진행률은 Side Panel 리서치 탭에 실시간 표시된다. |
| **사용자 스토리** | 사용자로서 Chrome Side Panel에서 "2025년 국내 생성형 AI 시장 동향"을 입력하면 10분 내에 구조화된 보고서를 받고 싶다. |
| **수용 기준** | (1) 파이프라인 각 단계 진행률이 Side Panel에 실시간 표시 (2) 중간 결과 검토 및 방향 수정 가능 (3) 최소 5개 출처 자동 인용 (4) 보고서 Markdown/PDF 내보내기 (`chrome.downloads`) |

### F08. 에이전틱 브라우징 (RPA)

| 항목 | 내용 |
|------|------|
| **Layer** | L1 + L4 |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Content Script** (DOM 조작, 폼 입력, 클릭 실행) / **Background SW** (작업 계획, 단계 관리) / **Side Panel** (실행 로그, 승인 UI) |
| **설명** | Content Script가 웹 애플리케이션(Zendesk, Jira, SAP, Confluence 등)에서 폼 입력, 클릭, 데이터 추출을 수행한다. Background SW가 작업 계획을 수립하고, 각 단계를 Content Script에 지시한다. 실행 로그는 Side Panel에 실시간 표시된다. |
| **사용자 스토리** | 사용자로서 Chrome에서 Jira를 열어놓고 "미해결 P1 티켓을 팀별로 분류해줘"라고 Side Panel에 입력하면 자동으로 처리되길 원한다. |
| **수용 기준** | (1) 지원 SaaS 4종 이상 (2) 각 액션 전 Side Panel에서 사용자 확인 프롬프트 (3) 실행 로그 전체 기록 (4) 실패 시 자동 롤백 |

### F09. PII 마스킹 및 보안 게이트

| 항목 | 내용 |
|------|------|
| **Layer** | Cross-cutting (Zero Trust) |
| **우선순위** | P0 |
| **Extension 컴포넌트** | **Background SW** (PII 패턴 매칭, 블록리스트 판정) / **Content Script** (전송 전 데이터 스캔) / **Side Panel** (마스킹 토글, 감지 알림 표시) |
| **설명** | 주민번호, 전화번호, 이메일, 계좌번호 등 7가지 PII 패턴을 Background SW에서 실시간 감지/마스킹하고, 블록리스트 도메인(`chrome.declarativeNetRequest` 또는 탭 URL 체크) 접근을 차단한다. Side Panel 상태바에서 PII 마스킹 ON/OFF 토글을 제공한다. |
| **사용자 스토리** | 보안 담당자로서 직원이 Chrome Extension을 통해 AI에게 전송하는 데이터에서 개인정보가 자동으로 마스킹되길 원한다. |
| **수용 기준** | (1) 7종 PII 패턴 탐지율 99% (2) 마스킹 처리 50ms 이내 (3) 블록리스트 20도메인+6패턴 차단 (4) 마스킹 이벤트 감사 로그 기록 (`chrome.storage.local`) |

### F10. Human-in-the-Loop 승인 체계

| 항목 | 내용 |
|------|------|
| **Layer** | Cross-cutting |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Background SW** (위험도 분류, 승인 상태 관리) / **Side Panel** (승인 요청 UI, 상세 정보 표시) / **Popup** (승인 알림 배지) |
| **설명** | 에이전트 액션의 위험도를 Low/Medium/High로 분류하여 단계별 승인 프로세스를 적용한다. 승인 요청은 Side Panel에 인라인 표시되며, Popup 아이콘에 배지 카운터가 표시된다. `chrome.notifications` API로 시스템 알림도 발송한다. |
| **사용자 스토리** | 관리자로서 에이전트가 Chrome에서 외부 시스템에 데이터를 쓰기 전에 반드시 Side Panel에서 승인을 받도록 하고 싶다. |
| **수용 기준** | (1) Low=자동 실행, Medium=팀장 승인, High=부서장 승인 (2) 승인 요청 `chrome.notifications` 알림 30초 이내 도달 (3) 72시간 미승인 시 자동 만료 (4) 승인 이력 감사 추적 |

### F11. Self-Healing 자가 복구

| 항목 | 내용 |
|------|------|
| **Layer** | Cross-cutting |
| **우선순위** | P2 |
| **Extension 컴포넌트** | **Background SW** (오류 진단, 캐시 초기화, SW 재등록) / **Side Panel** (복구 상태 표시, 가이드 UI) |
| **설명** | Background Service Worker에서 Extension 오류를 자동 진단하고, `chrome.storage.local` 캐시 초기화, Content Script 재주입, 설정 복원 등으로 자가 치유한다. Service Worker 비활성화 시 `chrome.alarms` API로 주기적 헬스체크를 수행한다. |
| **사용자 스토리** | 사용자로서 Chrome Extension 오류 시 수동 재설치 없이 자동으로 복구되길 원한다. |
| **수용 기준** | (1) 진단->치유->검증->복원 4단계 루프 (2) 복구 성공률 80% 이상 (3) 복구 실패 시 Side Panel에 가이드 표시 (4) 진단 로그 `chrome.storage.local` 자동 수집 |

### F12. 시맨틱 DOM 트리 시각화

| 항목 | 내용 |
|------|------|
| **Layer** | L2 |
| **우선순위** | P2 |
| **Extension 컴포넌트** | **Content Script** (DOM 트리 구축, 페이지 하이라이트 오버레이) / **Side Panel** (트리 뷰 렌더링, 노드 선택 UI) |
| **설명** | Content Script가 추출한 DOM 구조를 Side Panel의 데이터 탭에서 트리 형태로 시각화한다. 트리 노드 클릭 시 Content Script가 해당 페이지 영역에 하이라이트 오버레이를 표시하여 데이터 추출 범위를 직관적으로 설정할 수 있다. |
| **사용자 스토리** | 파워 유저로서 Chrome에서 보고 있는 페이지의 추출 대상 DOM 영역을 Side Panel 트리에서 선택하여 정밀하게 데이터를 가져오고 싶다. |
| **수용 기준** | (1) 트리 노드 클릭 시 Content Script가 페이지 해당 영역 하이라이트 (2) 다중 노드 선택 지원 (3) 선택 영역 템플릿 `chrome.storage.sync`에 저장 (4) 1,000노드 이하 렌더링 1초 이내 |

### F13. Background Service Worker 기반 오프라인 큐

| 항목 | 내용 |
|------|------|
| **Layer** | L1 |
| **우선순위** | P2 |
| **Extension 컴포넌트** | **Background SW** (큐 관리, 네트워크 감지, 순차 처리) / **Side Panel** (큐 상태 표시) |
| **설명** | 네트워크 단절 시 Background Service Worker가 사용자 요청을 IndexedDB에 큐잉한다. `navigator.onLine` 이벤트와 `chrome.alarms`를 조합하여 연결 복구를 감지하고, 큐에 쌓인 요청을 FIFO 순서로 자동 처리한다. Service Worker 비활성화 후 재활성화 시에도 IndexedDB에서 큐를 복원한다. |
| **사용자 스토리** | 사용자로서 Chrome에서 네트워크가 불안정한 환경에서도 Extension에 보낸 요청이 유실되지 않고 나중에 처리되길 원한다. |
| **수용 기준** | (1) 오프라인 큐 최대 100건 IndexedDB 저장 (2) 연결 복구 후 10초 이내 동기화 시작 (3) 처리 결과 `chrome.notifications` 알림 표시 (4) Side Panel 상태바에 큐 카운터 시각적 표시 |

### F14. 감사 로그 대시보드

| 항목 | 내용 |
|------|------|
| **Layer** | Cross-cutting (Zero Trust) |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Background SW** (로그 수집, `chrome.storage.local` 저장, 서버 전송) / **Side Panel** (감사로그 탭 -- 타임라인, 필터, 검색) |
| **설명** | Background SW가 모든 에이전트 액션, PII 탐지, 승인 이벤트, API 호출을 `chrome.storage.local`에 타임라인으로 기록한다. Side Panel의 감사로그 탭에서 검색/필터링하고, 7일 이후 데이터는 서버로 자동 전송한다. |
| **사용자 스토리** | 보안 감사자로서 Chrome Extension의 Side Panel에서 특정 기간의 에이전트 활동을 검색하고 이상 행위를 탐지하고 싶다. |
| **수용 기준** | (1) 로그 항목당 타임스탬프/사용자/액션/대상/결과 기록 (2) 7일간 `chrome.storage.local` 보관, 이후 서버 전송 (3) 키워드/날짜/유형별 필터링 (4) CSV 내보내기 (`chrome.downloads`) |

### F15. 봇 탐지 우회 및 세션 관리

| 항목 | 내용 |
|------|------|
| **Layer** | L1 |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Content Script** (인간 행동 에뮬레이션, 쿠키/세션 유지) / **Background SW** (세션 토큰 갱신 스케줄링, `chrome.cookies` API) |
| **설명** | 에이전틱 브라우징(F08) 시 Content Script가 봇 탐지 시스템(Cloudflare, reCAPTCHA 등)을 회피하기 위해 인간 행동 패턴을 에뮬레이션한다. Background SW가 `chrome.cookies` API로 세션 토큰을 모니터링하고 만료 전 갱신한다. |
| **사용자 스토리** | 사용자로서 Chrome에서 에이전트가 사내 시스템을 자동 조작할 때 봇 차단 없이 원활히 동작하길 원한다. |
| **수용 기준** | (1) 인간 행동 패턴 에뮬레이션 (타이핑 딜레이, 마우스 궤적) (2) `chrome.cookies` 기반 세션 토큰 자동 갱신 (3) CAPTCHA 발생 시 Side Panel에서 사용자에게 위임 (4) 세션 만료 30초 전 `chrome.notifications` 경고 |

### F16. Omnibox 통합 (신규)

| 항목 | 내용 |
|------|------|
| **Layer** | L1 |
| **우선순위** | P1 |
| **Extension 컴포넌트** | **Omnibox** (입력 진입점, `chrome.omnibox`) / **Background SW** (쿼리 처리, AI Core 호출) / **Side Panel** (결과 표시) |
| **설명** | Chrome 주소창에서 `hchat` 키워드 입력 후 스페이스를 누르면 Omnibox 모드가 활성화된다. 이후 입력한 텍스트가 Background SW를 통해 AI Core에 전달되고, 결과는 Side Panel이 자동으로 열리며 표시된다. 입력 중 `chrome.omnibox.onInputChanged`로 실시간 제안(최근 질문, 추천 프롬프트)을 드롭다운에 표시한다. |
| **사용자 스토리** | 사용자로서 Chrome 주소창에 `hchat 이 페이지 요약해줘`라고 입력하면 Side Panel이 열리며 즉시 AI 응답을 받고 싶다. |
| **수용 기준** | (1) `hchat` 키워드 등록 및 활성화 (`chrome.omnibox.setDefaultSuggestion`) (2) 입력 중 최근 질문 5건 + 추천 프롬프트 3건 실시간 제안 (3) Enter 시 Side Panel 자동 오픈 + AI 응답 스트리밍 시작 (4) `hchat !` 접두사로 현재 페이지 컨텍스트 포함 모드 지원 (5) 응답까지 TTFT 1초 이내 |

---

## 3. UX 시나리오

> 모든 시나리오는 **"사용자가 Chrome 브라우저에서 작업 중"** 컨텍스트를 전제로 한다. UI 인터랙션은 Side Panel, Popup, Context Menu, Omnibox 중 하나를 통해 발생한다.

### 시나리오 1: Omnibox로 웹페이지 즉석 요약

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 |
| **관련 기능** | F01, F02, F04, F06, F16 |
| **페르소나** | 기획팀 김 과장 -- 하루 30개 이상 기사를 모니터링하는 업무 |
| **Chrome 컨텍스트** | Chrome에서 뉴스 기사 탭을 열어두고 브라우징 중 |

**트리거**: Chrome 주소창에 `hchat 이 기사 3줄로 요약해줘` 입력 후 Enter (또는 `Ctrl+Shift+S` 단축키)

**단계**:
1. **Omnibox** 이벤트를 **Background SW**가 수신한다.
2. Background SW가 `chrome.sidePanel.open()`으로 Side Panel을 자동 오픈한다.
3. **Content Script**가 현재 탭에서 Readability.js로 기사 본문을 추출한다 (광고/사이드바/댓글 제거).
4. Background SW의 Dynamic Multi-Model이 "요약" 작업에 적합한 모델(예: Haiku)을 선택한다.
5. AI가 3문장 요약을 SSE 스트리밍으로 **Side Panel**에 실시간 출력한다.
6. 요약 하단에 "핵심 키워드 3개"와 "원문 링크"가 표시된다.
7. 사용자가 "더 자세히" 버튼을 누르면 5문단 상세 요약으로 확장된다.

**결과**: 3문장 요약 + 핵심 키워드 3개 + 상세 요약 옵션 (Side Panel에 표시)
**소요시간**: 3~5초 (첫 토큰 0.5초 이내)

---

### 시나리오 2: 경쟁사 조사 자동화

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L2 + L3 + L4 |
| **관련 기능** | F02, F05, F07, F16 |
| **페르소나** | 전략기획부 박 차장 -- 분기별 경쟁사 동향 보고서 작성 담당 |
| **Chrome 컨텍스트** | Chrome에서 업계 리포트 페이지를 검토하며 Side Panel을 열어둔 상태 |

**트리거**: Side Panel 채팅에 "현대차 vs 토요타 2025년 전기차 판매량 비교 보고서 작성해줘" 입력 (또는 Omnibox에서 `hchat 현대차 vs 토요타 전기차 비교`)

**단계**:
1. **Background SW**의 **Planner Agent**가 리서치 계획을 수립한다: 검색 쿼리 5개, 데이터 소스 3개, 보고서 구조 제안.
2. 사용자가 **Side Panel**에서 계획을 검토하고 "진행" 승인한다.
3. **Search Agent**가 5개 쿼리로 관련 웹페이지 20개를 수집한다.
4. **Web Agent**가 새 탭에서 각 페이지를 열고 **Content Script** + Smart DOM으로 정제한다.
5. **Data Agent**가 판매량 테이블을 DataFrame으로 변환한다.
6. **Analysis Agent**가 데이터를 비교 분석하고 인사이트를 도출한다.
7. **Report Agent**가 구조화된 보고서(목차/요약/본문/출처)를 생성한다.
8. 진행률 바가 **Side Panel** 리서치 탭에 각 단계를 실시간 표시한다 (예: "3/6 데이터 수집 중...").

**결과**: Markdown 보고서 (표/차트 포함, 출처 5개 이상 인용) + PDF 내보내기 (Side Panel에서 `chrome.downloads`로 다운로드)
**소요시간**: 8~12분

---

### 시나리오 3: Jira 티켓 자동 분류

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L4 |
| **관련 기능** | F08, F10, F15 |
| **페르소나** | 개발팀 리드 이 팀장 -- 주간 50개 이상의 Jira 티켓을 분류/배정 |
| **Chrome 컨텍스트** | Chrome에서 Jira 보드 페이지를 열어놓은 상태 |

**트리거**: Jira 보드 페이지에서 우클릭 -> Context Menu "H Chat > 티켓 자동 분류"

**단계**:
1. **Content Script**가 Jira 보드의 미분류 티켓 목록을 DOM에서 추출한다.
2. **Background SW**의 **Analyst Agent**가 각 티켓의 제목/설명을 분석하여 카테고리(Bug/Feature/Task/Improvement)를 판별한다.
3. 우선순위(Critical/High/Medium/Low)를 기존 패턴 기반으로 추천한다.
4. 담당자를 팀원 스킬셋과 현재 워크로드 기준으로 제안한다.
5. 분류 결과가 **Side Panel**에 테이블로 표시된다.
6. 사용자가 검토 후 "일괄 적용" 클릭 시 **Side Panel**에서 Human-in-the-Loop 승인 요청 발생 (Medium 위험도 -> 팀장 승인).
7. 승인 후 **Content Script**의 에이전트가 Jira API를 통해 라벨/우선순위/담당자를 자동 업데이트한다.

**결과**: 50개 티켓 분류/배정 완료 + 변경 로그 기록 (Side Panel 감사로그 탭)
**소요시간**: 3~5분 (수동 대비 90% 시간 절감)

---

### 시나리오 4: 회의록에서 액션 아이템 추출

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 + L4 |
| **관련 기능** | F02, F03, F07 |
| **페르소나** | PM 정 대리 -- 주 3회 회의 후 액션 아이템 정리 |
| **Chrome 컨텍스트** | Chrome에서 Confluence 회의록 페이지를 열어놓은 상태 |

**트리거**: Confluence 회의록 페이지에서 Extension 아이콘(**Popup**) 클릭 -> "액션 아이템 추출" 퀵 액션

**단계**:
1. **Popup**에서 버튼 클릭 시 **Background SW**가 **Content Script**에 추출 명령을 전달한다.
2. **Content Script**의 Smart DOM이 회의록 페이지에서 본문 텍스트를 추출한다.
3. **Background SW**에서 AI가 텍스트를 분석하여 의사결정 사항, 액션 아이템, 마감일, 담당자를 식별한다.
4. 결과가 구조화된 테이블로 **Side Panel**에 표시된다: | 액션 | 담당자 | 마감일 | 우선순위 |
5. 사용자가 **Side Panel**에서 항목을 수정/추가/삭제한다.
6. "Jira 티켓 생성" 버튼으로 **Content Script**가 각 액션 아이템을 Jira 티켓으로 일괄 변환한다.
7. "Slack 공유" 버튼으로 정리된 액션 아이템을 Slack 웹훅에 전송한다.

**결과**: 구조화된 액션 아이템 목록 + Jira 연동 + Slack 알림 (모두 Chrome Extension 내에서 완결)
**소요시간**: 1~2분

---

### 시나리오 5: SAP 재고 데이터를 Excel 보고서로 변환

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 + L3 |
| **관련 기능** | F05, F08, F15 |
| **페르소나** | 구매팀 최 과장 -- 일간 재고 현황 보고서 작성 |
| **Chrome 컨텍스트** | Chrome에서 SAP 재고 조회 웹 화면을 열어놓은 상태 |

**트리거**: SAP 재고 조회 화면에서 우클릭 -> Context Menu "H Chat > 데이터 추출"

**단계**:
1. **Content Script**가 SAP 화면의 재고 테이블을 감지한다.
2. **Background SW**의 DataFrame Engine이 HTML 테이블을 JSON으로 변환한다 (열 헤더 자동 인식).
3. **Side Panel** 데이터 탭에서 미리보기 패널로 데이터를 검증한다 (행 수, 열 이름, 샘플 값).
4. 사용자가 **Side Panel**에서 필요한 열만 선택하고 필터 조건을 설정한다.
5. "Excel 내보내기" 클릭 시 **Background SW**에서 SheetJS가 XLSX 파일을 생성하고 `chrome.downloads`로 다운로드한다.
6. AI가 재고 부족 품목, 이상치, 전주 대비 변동을 자동 분석하여 요약 시트를 추가한다.

**결과**: 필터링된 재고 데이터 XLSX + AI 분석 요약 시트 (Chrome 다운로드 폴더에 저장)
**소요시간**: 1~3분

---

### 시나리오 6: IT 헬프데스크 티켓 자동 처리 (Zendesk)

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 + L4 |
| **관련 기능** | F08, F09, F10, F15 |
| **페르소나** | IT 지원팀 한 사원 -- 일 100건 이상의 헬프데스크 티켓 처리 |
| **Chrome 컨텍스트** | Chrome에서 Zendesk 대시보드를 열어놓은 상태 |

**트리거**: Zendesk 대시보드에서 우클릭 -> Context Menu "H Chat > 티켓 일괄 처리"

**단계**:
1. **Content Script**가 Zendesk 대시보드에서 미처리 티켓 목록을 추출한다.
2. **Background SW**에서 각 티켓의 제목/본문을 분석하여 카테고리(비밀번호 초기화/VPN/소프트웨어 설치/하드웨어)를 분류한다.
3. 유형별 표준 응답 템플릿을 매칭한다.
4. **Background SW**의 PII 마스킹이 응답 초안에서 개인정보를 자동 제거한다.
5. 분류 결과 + 응답 초안이 **Side Panel**에 표시된다.
6. 사용자가 **Side Panel**에서 검토 후 "일괄 발송" 승인 (Medium 위험도).
7. **Content Script**의 에이전트가 Zendesk에서 각 티켓에 응답을 작성하고 상태를 변경한다.

**결과**: 100건 티켓 분류 + 응답 초안 + 일괄 발송 (Chrome Extension 내 Side Panel에서 전체 워크플로우 완결)
**소요시간**: 15~20분 (수동 대비 80% 절감)

---

### 시나리오 7: HR 연차 신청 자동 입력

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L4 |
| **관련 기능** | F08, F10, F15, F16 |
| **페르소나** | 인사팀 윤 대리 -- 팀원 20명의 연차 신청을 대리 입력 |
| **Chrome 컨텍스트** | Chrome에서 사내 HR 시스템(워크데이)을 열어놓은 상태 |

**트리거**: Omnibox에 `hchat 다음 주 월~수 연차 신청해줘` 입력 후 Enter (또는 Side Panel 채팅에 직접 입력)

**단계**:
1. **Background SW**가 **Content Script**에 명령을 전달하고, 에이전트가 사내 HR 시스템 연차 신청 페이지로 이동한다.
2. **Content Script**에서 봇 탐지 우회를 위해 인간 행동 패턴(타이핑 딜레이, 클릭 궤적)을 에뮬레이션한다.
3. 날짜 필드에 다음 주 월~수 날짜를 입력한다.
4. 연차 유형(연차/반차/특별휴가)을 선택한다.
5. 실행 전 **Side Panel**에 미리보기를 표시한다: "2026-03-16(월) ~ 2026-03-18(수), 연차 3일".
6. 사용자가 **Side Panel**에서 확인하면 **Content Script**가 폼을 제출한다.
7. 결과(신청 번호, 승인 대기 상태)를 `chrome.notifications` 알림으로 표시한다.

**결과**: 연차 신청 완료 + 신청 번호 확인 (Side Panel + Chrome 알림)
**소요시간**: 30초~1분

---

### 시나리오 8: Confluence 문서 자동 업데이트

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 + L4 |
| **관련 기능** | F02, F08, F10 |
| **페르소나** | 기술문서팀 강 선임 -- 분기별 API 문서 업데이트 |
| **Chrome 컨텍스트** | Chrome에서 Confluence 문서 페이지를 열어놓은 상태 |

**트리거**: Confluence 문서 페이지에서 우클릭 -> Context Menu "H Chat > 문서 업데이트 제안"

**단계**:
1. **Content Script**의 Smart DOM이 현재 Confluence 문서의 전체 내용을 추출한다.
2. **Background SW**의 **Writer Agent**가 문서를 분석하여 오래된 정보, 누락된 섹션, 불일치를 식별한다.
3. 외부 소스(GitHub README, API Swagger 문서)와 비교하여 변경 사항을 목록화한다.
4. 수정 제안을 diff 형태로 **Side Panel**에 표시한다 (삭제: 빨강, 추가: 초록).
5. 사용자가 **Side Panel**에서 항목별로 수락/거부한다.
6. 승인된 변경 사항이 **Content Script**를 통해 Confluence 편집 모드에서 자동 적용된다.
7. 변경 이력이 **Background SW**의 감사 로그에 기록된다.

**결과**: 문서 업데이트 diff + 선택적 자동 적용 (Side Panel에서 리뷰, Content Script로 적용)
**소요시간**: 5~10분 (수동 대비 70% 절감)

---

### 시나리오 9: 다국어 이메일 번역 및 회신 초안

| 항목 | 내용 |
|------|------|
| **관련 Layer** | L1 + L2 |
| **관련 기능** | F02, F03, F04, F06 |
| **페르소나** | 해외영업팀 송 과장 -- 일 20건 이상의 영문/일문 이메일 처리 |
| **Chrome 컨텍스트** | Chrome에서 Gmail 웹 화면을 열어 이메일을 읽고 있는 상태 |

**트리거**: Gmail 이메일 본문에서 텍스트 선택 -> 우클릭 -> Context Menu "H Chat > 번역 + 회신"

**단계**:
1. **Content Script**의 Smart DOM이 Gmail 이메일 본문을 추출한다 (서명, 이전 스레드 분리).
2. **Background SW**에서 언어를 자동 감지하고 한국어로 번역한다.
3. 번역 결과와 함께 이메일 요약(요청 사항, 마감일, 핵심 포인트)을 **Side Panel**에 표시한다.
4. 사용자가 **Side Panel**에서 "회신 초안" 버튼을 클릭한다.
5. AI가 원문 언어(영어/일본어)로 회신 초안을 **Side Panel**에 스트리밍 생성한다.
6. 사용자가 초안을 수정하고 "이메일에 붙여넣기" 클릭 시 **Content Script**가 Gmail 회신 창에 자동 삽입한다.

**결과**: 번역 + 요약 + 회신 초안 (Side Panel에서 작성, Content Script로 Gmail에 삽입)
**소요시간**: 1~2분

---

### 시나리오 10: 보안 감사 -- 에이전트 활동 리뷰

| 항목 | 내용 |
|------|------|
| **관련 Layer** | Cross-cutting |
| **관련 기능** | F09, F10, F14 |
| **페르소나** | 정보보안팀 오 팀장 -- 월간 AI 에이전트 활동 감사 |
| **Chrome 컨텍스트** | Chrome에서 Side Panel을 열어 감사로그 탭으로 전환한 상태 |

**트리거**: Side Panel -> 감사로그 탭 -> 기간 필터 설정

**단계**:
1. **Side Panel** 감사로그 탭에서 지난 30일간의 에이전트 활동을 조회한다 (`chrome.storage.local` + 서버 API).
2. 타임라인 뷰에서 PII 탐지 이벤트를 필터링한다.
3. 이상 패턴(비정상 시간대 활동, 과다 API 호출, 블록리스트 접근 시도)을 확인한다.
4. 특정 이벤트 클릭 시 **Side Panel**에 상세 정보(사용자, 액션, 입력 데이터 해시, 결과)를 확인한다.
5. 이상 행위 건에 대해 "조사 보고서 생성" 클릭한다.
6. **Background SW**에서 AI가 해당 이벤트의 전후 맥락을 분석하여 위험도 평가 보고서를 생성한다.
7. 보고서를 CSV/PDF로 내보내어 (`chrome.downloads`) 보안 위원회에 제출한다.

**결과**: 감사 보고서 (이상 행위 목록 + 위험도 평가 + 권고 사항) -- Side Panel에서 전체 워크플로우 완결
**소요시간**: 20~30분 (수동 대비 60% 절감)

---

## 4. UI/UX 화면 구성

> Chrome Extension의 4가지 UI 서피스만 사용한다. 별도 웹앱이나 네이티브 앱은 없다.

### 4.1 Side Panel (주 인터페이스)

```
+------------------------------------------+
|  [H Chat Logo]  [모델 선택 v]  [설정]    |
+------------------------------------------+
|  [채팅] [데이터] [리서치] [감사로그]  탭  |
+------------------------------------------+
|                                          |
|  채팅 영역                               |
|  +------------------------------------+  |
|  | 현재 페이지: news.example.com      |  |
|  |                                    |  |
|  | [User] 이 기사 3줄로 요약해줘      |  |
|  |                                    |  |
|  | [AI] 요약 결과...                  |  |
|  |      | (스트리밍 커서)             |  |
|  |                                    |  |
|  | [복사] [공유] [더 자세히]          |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
|  [+ 파일첨부]  [메시지 입력...]  [전송 >]|
+------------------------------------------+
|  [큐: 0건]  [PII ON]  [네트워크: 정상]   |
+------------------------------------------+
```

**구성요소**:
- **헤더**: 로고, 모델 선택 드롭다운 (자동/수동), 설정 버튼
- **탭 바**: 채팅 / 데이터(DataFrame) / 리서치(MARS) / 감사로그
- **채팅 영역**: 메시지 버블, 컨텍스트 배지(현재 탭 URL), 스트리밍 인디케이터
- **액션 바**: 복사, 공유, 상세 보기, Jira 연동 등 컨텍스트별 버튼
- **입력 바**: 텍스트 입력, 파일 첨부, 전송 버튼
- **상태 바**: Background SW 오프라인 큐 카운터, PII 마스킹 토글, 네트워크 상태

### 4.2 Popup (퀵 액션)

```
+------------------------------+
|  H Chat Extension     v2.0  |
+------------------------------+
|  [요약]  [번역]  [분석]     |
|  [데이터 추출]  [리서치]     |
+------------------------------+
|  최근 활동                   |
|  - 기사 요약 (2분 전)       |
|  - 재고 데이터 추출 (1시간) |
+------------------------------+
|  [Side Panel 열기]           |
|  [설정]  [도움말]           |
+------------------------------+
```

**구성요소**:
- **퀵 액션 그리드**: 5가지 주요 기능 원클릭 실행 (클릭 시 Background SW에 명령 전달 -> Side Panel 자동 오픈)
- **최근 활동**: `chrome.storage.local`에서 최근 5건의 작업 이력 표시
- **내비게이션**: Side Panel 전환(`chrome.sidePanel.open()`), 설정, 도움말

### 4.3 Context Menu (우클릭)

```
+----------------------------------+
|  H Chat                    >    |
|  +-- 선택 텍스트 요약            |
|  +-- 선택 텍스트 번역       >   |
|  |   +-- 한국어                  |
|  |   +-- 영어                    |
|  |   +-- 일본어                  |
|  +-- 선택 텍스트 설명            |
|  +-- 리서치 시작                 |
|  +-- ----------------------      |
|  +-- 페이지 데이터 추출          |
|  +-- 테이블 -> Excel             |
|  +-- 에이전트 작업 시작     >   |
|      +-- 티켓 분류               |
|      +-- 문서 업데이트           |
|      +-- 폼 자동 입력           |
+----------------------------------+
```

**구성요소** (`chrome.contextMenus.create`로 등록):
- **텍스트 분석**: 요약, 번역(하위 메뉴), 설명, 리서치
- **데이터 추출**: 페이지 데이터, 테이블 변환
- **에이전트 작업**: 사전 정의된 자동화 시나리오
- 모든 메뉴 항목은 Background SW에서 처리하고 결과를 Side Panel에 표시

### 4.4 Omnibox (주소창 통합)

```
Chrome 주소창:
+----------------------------------------------------+
| hchat 이 페이지 요약해줘                      [>]  |
+----------------------------------------------------+
| [최근] 경쟁사 분석 보고서 작성해줘                  |
| [최근] SAP 재고 데이터 추출                         |
| [최근] 이메일 번역해줘                              |
| [추천] ! 현재 페이지 핵심 키워드 추출               |
| [추천] ! 이 페이지의 테이블 Excel로 변환            |
| [추천] 오늘의 뉴스 브리핑 만들어줘                  |
+----------------------------------------------------+
```

**구성요소** (`chrome.omnibox` API):
- **키워드**: `hchat` 입력 후 스페이스로 활성화
- **실시간 제안**: `onInputChanged`로 최근 질문 5건 + 추천 프롬프트 3건 표시
- **`!` 접두사 모드**: `hchat ! 요약해줘` 입력 시 현재 탭 컨텍스트(URL + 추출 텍스트) 자동 포함
- **실행**: Enter 시 Background SW가 처리 -> Side Panel 자동 오픈 -> 결과 스트리밍

### 4.5 Notification (알림)

```
+------------------------------------------+
|  [v] 리서치 완료                  [닫기] |
|  "경쟁사 분석 보고서"가 생성되었습니다.  |
|  [보고서 열기]  [PDF 다운로드]           |
+------------------------------------------+

+------------------------------------------+
|  [!] 승인 요청                    [닫기] |
|  Jira 티켓 50건 일괄 업데이트 승인 필요  |
|  요청자: 이 팀장 | 위험도: Medium        |
|  [승인]  [거부]  [상세 보기]             |
+------------------------------------------+

+------------------------------------------+
|  [*] PII 감지                     [닫기] |
|  주민번호 1건이 마스킹 처리되었습니다.   |
|  [감사 로그 보기]                        |
+------------------------------------------+
```

**알림 채널** (`chrome.notifications` API):
- **완료 알림**: 리서치, 데이터 추출, 에이전트 작업 완료
- **승인 요청**: Human-in-the-Loop 승인 필요 시 (버튼 포함 알림)
- **보안 알림**: PII 감지, 블록리스트 접근 시도
- **시스템 알림**: 오프라인/온라인 전환, Self-Healing 이벤트
- Side Panel 내 인라인 알림도 병행 표시

---

## 5. 기능 우선순위 매트릭스

### 5.1 Impact vs Effort 2x2 매트릭스

```
                        Impact (사업 가치)
                    Low                High
              +------------------+------------------+
              |                  |                  |
         Low  |   P2: Nice      |   P0: Quick      |
              |   to Have       |   Wins           |
   Effort     |                  |                  |
  (구현       |  F11 Self-Heal   |  F01 Side Panel  |
   비용)      |  F12 DOM 시각화  |  F03 컨텍스트    |
              |  F13 오프라인큐  |  F04 SSE 스트림  |
              |                  |  F09 PII 마스킹  |
              +------------------+------------------+
              |                  |                  |
         High |   Deprioritize   |   P1: Strategic  |
              |   (검토 후       |   Investment     |
              |    결정)         |                  |
              |                  |  F02 Smart DOM   |
              |                  |  F05 DataFrame   |
              |                  |  F06 Multi-Model |
              |                  |  F07 MARS        |
              |                  |  F08 에이전틱RPA |
              |                  |  F10 HITL 승인   |
              |                  |  F14 감사로그    |
              |                  |  F15 봇탐지우회  |
              |                  |  F16 Omnibox     |
              +------------------+------------------+
```

### 5.2 우선순위 분류 요약

| 우선순위 | 기능 | 목표 릴리스 | 근거 |
|----------|------|-------------|------|
| **P0** | F01 Side Panel, F03 컨텍스트 메뉴, F04 SSE 스트리밍, F09 PII 마스킹 | Phase 1 (4주) | 핵심 UX 셸 + 보안 기반. 모든 상위 기능의 전제 조건. |
| **P0** | F02 Smart DOM | Phase 1 (4주) | L2 전체의 기반. DataFrame과 MARS 모두 의존. |
| **P1** | F05 DataFrame, F06 Multi-Model, F07 MARS, F08 에이전틱 RPA | Phase 2 (6주) | 차별화 가치. 엔터프라이즈 핵심 유스케이스. |
| **P1** | F10 HITL 승인, F14 감사로그, F15 봇 탐지 우회, F16 Omnibox | Phase 2 (6주) | 엔터프라이즈 거버넌스 + UX 편의성. Omnibox는 낮은 구현 비용 대비 높은 접근성. |
| **P2** | F11 Self-Healing, F12 DOM 시각화, F13 오프라인 큐 | Phase 3 (4주) | 안정성/사용성 향상. P0/P1 안정화 후 진행. |

---

## 6. 기능 간 의존성 그래프

```mermaid
flowchart TD
    subgraph "P0 -- Foundation (Phase 1)"
        F01[F01 Side Panel<br/>Agent UI]
        F02[F02 Smart DOM<br/>콘텐츠 추출]
        F03[F03 컨텍스트 메뉴<br/>분석]
        F04[F04 SSE<br/>스트리밍]
        F09[F09 PII 마스킹<br/>보안 게이트]
    end

    subgraph "P1 -- Core Value (Phase 2)"
        F05[F05 DataFrame<br/>자동 변환]
        F06[F06 Dynamic<br/>Multi-Model]
        F07[F07 MARS<br/>리서치]
        F08[F08 에이전틱<br/>브라우징 RPA]
        F10[F10 HITL<br/>승인 체계]
        F14[F14 감사 로그<br/>대시보드]
        F15[F15 봇 탐지 우회<br/>세션 관리]
        F16[F16 Omnibox<br/>통합]
    end

    subgraph "P2 -- Enhancement (Phase 3)"
        F11[F11 Self-Healing<br/>자가 복구]
        F12[F12 시맨틱 DOM<br/>트리 시각화]
        F13[F13 오프라인 큐<br/>Background SW 기반]
    end

    %% P0 내부 의존성
    F03 --> F01
    F03 --> F02
    F04 --> F01

    %% P0 -> P1 의존성
    F05 --> F02
    F06 --> F04
    F07 --> F02
    F07 --> F05
    F07 --> F06
    F08 --> F01
    F08 --> F15
    F10 --> F08
    F14 --> F09
    F14 --> F10
    F16 --> F01
    F16 --> F04

    %% P1 -> P2 의존성
    F11 --> F01
    F12 --> F02
    F13 --> F01
    F13 --> F04

    %% Cross-cutting 영향
    F09 -.->|모든 데이터 흐름 검사| F02
    F09 -.->|전송 전 마스킹| F04
    F09 -.->|RPA 입력 검증| F08

    style F01 fill:#e74c3c,color:#fff
    style F02 fill:#e74c3c,color:#fff
    style F03 fill:#e74c3c,color:#fff
    style F04 fill:#e74c3c,color:#fff
    style F09 fill:#e74c3c,color:#fff
    style F05 fill:#f39c12,color:#fff
    style F06 fill:#f39c12,color:#fff
    style F07 fill:#f39c12,color:#fff
    style F08 fill:#f39c12,color:#fff
    style F10 fill:#f39c12,color:#fff
    style F14 fill:#f39c12,color:#fff
    style F15 fill:#f39c12,color:#fff
    style F16 fill:#f39c12,color:#fff
    style F11 fill:#3498db,color:#fff
    style F12 fill:#3498db,color:#fff
    style F13 fill:#3498db,color:#fff
```

### 6.1 의존성 요약

| 기능 | Extension 컴포넌트 | 선행 의존성 | 후행 영향 |
|------|-------------------|-------------|-----------|
| F01 Side Panel | Side Panel + Background SW | 없음 (최우선) | F03, F04, F08, F11, F13, F16 |
| F02 Smart DOM | Content Script + Background SW | 없음 (최우선) | F03, F05, F07, F12 |
| F03 컨텍스트 메뉴 | Context Menu + Content Script + Background SW + Side Panel | F01, F02 | 없음 (리프 노드) |
| F04 SSE 스트리밍 | Background SW + Side Panel | F01 | F06, F13, F16 |
| F05 DataFrame | Content Script + Background SW + Side Panel | F02 | F07 |
| F06 Multi-Model | Background SW + Side Panel | F04 | F07 |
| F07 MARS | Background SW + Content Script + Side Panel | F02, F05, F06 | 없음 (리프 노드) |
| F08 에이전틱 RPA | Content Script + Background SW + Side Panel | F01, F15 | F10 |
| F09 PII 마스킹 | Background SW + Content Script + Side Panel | 없음 (최우선) | F14, 모든 데이터 흐름 |
| F10 HITL 승인 | Background SW + Side Panel + Popup | F08 | F14 |
| F11 Self-Healing | Background SW + Side Panel | F01 | 없음 (리프 노드) |
| F12 DOM 시각화 | Content Script + Side Panel | F02 | 없음 (리프 노드) |
| F13 오프라인 큐 | Background SW + Side Panel | F01, F04 | 없음 (리프 노드) |
| F14 감사 로그 | Background SW + Side Panel | F09, F10 | 없음 (리프 노드) |
| F15 봇 탐지 우회 | Content Script + Background SW | 없음 | F08 |
| F16 Omnibox | Omnibox + Background SW + Side Panel | F01, F04 | 없음 (리프 노드) |

### 6.2 크리티컬 패스

Phase 1 최소 구현 경로 (MVP):

```
F01 (Side Panel) -> F04 (SSE) -> F06 (Multi-Model) -> F07 (MARS)
       |                  |
       v                  +-> F16 (Omnibox)
F02 (Smart DOM) -> F05 (DataFrame) --^
       |
       v
F03 (컨텍스트 메뉴)

F09 (PII) -- 병렬 진행, 모든 데이터 흐름에 통합
```

**병렬 진행 가능 그룹** (Extension 컴포넌트 기준):
- Group A: F01 + F04 (Side Panel UI 셸 + Background SW SSE 스트리밍)
- Group B: F02 + F09 (Content Script DOM 추출 + Background SW PII 보안)
- Group C: F15 (Content Script 봇 탐지 -- F08의 선행 조건이므로 Phase 1 말미에 착수)
- Group D: F16 (Omnibox -- F01+F04 완료 후 빠르게 구현 가능, Background SW 이벤트 핸들러 추가)

---

## 7. Extension 컴포넌트 매핑 총괄표

| 기능 | Side Panel | Popup | Context Menu | Omnibox | Content Script | Background SW |
|------|:----------:|:-----:|:------------:|:-------:|:--------------:|:-------------:|
| F01 Side Panel Agent UI | **주** | - | - | - | - | 상태 관리 |
| F02 Smart DOM | 결과 표시 | - | - | - | **주** | 캐싱 |
| F03 컨텍스트 메뉴 | 결과 표시 | - | **진입** | - | 텍스트 수집 | AI 호출 |
| F04 SSE 스트리밍 | 토큰 렌더링 | - | - | - | - | **주** (연결) |
| F05 DataFrame | 미리보기 | - | - | - | 테이블 감지 | **주** (변환) |
| F06 Multi-Model | 모델 표시 | - | - | - | - | **주** (라우팅) |
| F07 MARS 리서치 | 진행률/결과 | - | - | - | 페이지 접근 | **주** (오케스트레이션) |
| F08 에이전틱 RPA | 로그/승인 | - | - | - | **주** (DOM 조작) | 계획 관리 |
| F09 PII 마스킹 | 토글/알림 | - | - | - | 데이터 스캔 | **주** (마스킹) |
| F10 HITL 승인 | 승인 UI | 배지 | - | - | - | **주** (상태 관리) |
| F11 Self-Healing | 상태 표시 | - | - | - | - | **주** (진단/복구) |
| F12 DOM 시각화 | 트리 뷰 | - | - | - | **주** (하이라이트) | - |
| F13 오프라인 큐 | 큐 카운터 | - | - | - | - | **주** (큐 관리) |
| F14 감사 로그 | **주** (대시보드) | - | - | - | - | 로그 수집 |
| F15 봇 탐지 우회 | CAPTCHA 위임 | - | - | - | **주** (에뮬레이션) | 세션 갱신 |
| F16 Omnibox | 결과 표시 | - | - | **진입** | - | **주** (쿼리 처리) |

---

> **다음 문서**: SERVICE_PLAN_03 -- 기술 아키텍처 상세 설계 (Layer별 모듈, API 스펙, 데이터 모델)
