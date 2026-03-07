# H Chat 다음 단계 계획 (Phase 55+)

> 작성일: 2026-03-07
> 현재 상태: Phase 54 완료, 모노레포 8개 앱 + 별도 레포 2개
> 완료 현황: 516파일, 48,025줄, 132 컴포넌트, 33 서비스, 707 테스트

---

## Phase 1~54 완료 요약

| 구간 | Phase | 핵심 |
|------|-------|------|
| 기반 | 1-10 | Wiki 28p + HMG 4p + 모노레포 |
| 확장 | 11-20 | Admin 24p + ROI 9p + User 5p + LLM 10p |
| 품질 | 21-27 | Storybook 103 + 서비스 레이어 + CI/CD |
| 고도화 | 28-35 | 테스트 284 + 실시간 + SSE + Desktop + Mobile |
| 테스트 | 36-38 | 707 테스트 + Interaction 28 + exports 16경로 |
| 엔터프라이즈 | 39-44 | 멀티테넌트, 마켓, 분석, RAG, 프롬프트, SSO |
| 지능화 | 45-50 | 채팅분석, RBAC, 벤치마크, 피드백, 알림, 팀채팅 |
| AI 고도화 | 51-54 | 파인튜닝, D3 시각화, 지식그래프, 음성 |

---

## Phase 55: Phase 39-54 UI 컴포넌트 구현 [ ]

**목표**: 서비스만 있고 UI가 없는 16개 서비스에 페이지/컴포넌트 추가

### 55-1. Admin 페이지 추가
- [ ] `/tenants` — 테넌트 관리 페이지 (TenantManagement + TenantSelector)
- [ ] `/marketplace` — 에이전트 마켓플레이스 (AgentMarketGrid + 상세)
- [ ] `/analytics` — 분석 엔진 대시보드 (이상 탐지, 예측, 인사이트)
- [ ] `/rag` — RAG 문서 검색 (검색 UI + 문서 관리)
- [ ] `/prompt-versions` — 프롬프트 버전 관리 (diff 뷰어 + A/B 대시보드)
- [ ] `/chat-analytics` — 채팅 히스토리 분석 (클러스터, 시간대)
- [ ] `/rbac` — 역할/권한 관리 (매트릭스 UI + 위임)
- [ ] `/benchmarks` — AI 벤치마크 (레이더 차트 + 추천)
- [ ] `/feedback` — 피드백 대시보드 (트렌드, 모델별)
- [ ] `/alert-rules` — 알림 규칙 빌더 (조건 UI)
- [ ] `/team-chat` — 팀 채팅 (채팅방, 멘션, 스레드)
- [ ] `/finetune` — 파인튜닝 대시보드 (학습 진행, loss 차트)
- [ ] `/knowledge-graph` — 지식 그래프 시각화 (D3 force)
- [ ] `/voice` — 음성 인터페이스 (녹음, 요약)

### 55-2. Storybook 추가
- [ ] 14개 신규 페이지 스토리

**산출물**: ~14 Admin 페이지, ~30 UI 컴포넌트, ~14 스토리

---

## Phase 56: @hchat/ui 패키지 분리 [ ]

**목표**: 28,327줄 단일 패키지 → 도메인별 분리

- [ ] `@hchat/ui-core` (Badge, Theme, Toast, Skeleton, ErrorBoundary)
- [ ] `@hchat/ui-admin` (admin/ 107파일 → 독립 패키지)
- [ ] `@hchat/ui-user` (user/ 34파일)
- [ ] `@hchat/ui-llm-router` (llm-router/ 22파일)
- [ ] `@hchat/ui-mobile` (mobile/ 12파일)
- [ ] `@hchat/ui-desktop` (desktop/ 8파일)
- [ ] Turborepo 의존성 그래프 업데이트
- [ ] import 경로 자동 변환 (codemod)

---

## Phase 57: MSW + Real API 전환 준비 [ ]

**목표**: Mock Service Worker 도입, API 스펙 검증

- [ ] MSW 설치 및 핸들러 설정
- [ ] 33개 서비스의 Mock → MSW 핸들러 마이그레이션
- [ ] API 스펙 기반 타입 자동 생성 (OpenAPI → TypeScript)
- [ ] E2E에서 MSW 통합 테스트
- [ ] 실제 백엔드 연동 가이드 문서

---

## Phase 58: 테스트 커버리지 80% [ ]

**목표**: 35% → 80%

- [ ] Admin 대형 페이지 테스트 (Context Provider 모킹)
- [ ] Phase 55 신규 UI 컴포넌트 테스트
- [ ] MSW 기반 통합 테스트
- [ ] CI 커버리지 임계값 80% 강화

---

## Phase 59: 성능 최적화 v2 [ ]

- [ ] React Server Components 활용 (Next.js 16)
- [ ] Streaming SSR 적용
- [ ] 이미지 최적화 (next/image)
- [ ] 번들 사이즈 50% 감소 목표

---

## Phase 60: 프로덕션 준비 [ ]

- [ ] 실제 API 연동 (OpenAI, Anthropic, Google)
- [ ] 데이터베이스 연동 (PostgreSQL + Prisma)
- [ ] Redis 캐싱 레이어
- [ ] Docker Compose 프로덕션 설정
- [ ] 모니터링 (Sentry, Datadog)
- [ ] 로드 테스트 (k6)

---

## 우선순위 및 의존성

```
Phase 55 (UI 구현)           ──┐
Phase 56 (패키지 분리)        ──┼── 병렬 가능 (별도 워크트리)
Phase 57 (MSW)               ──┘
                               ↓
Phase 58 (커버리지 80%)       ── Phase 55+57 이후
                               ↓
Phase 59 (성능 최적화)        ──┐
Phase 60 (프로덕션)           ──┘── 순차
```

---

## 성공 지표

| 지표 | Phase 54 현재 | Phase 60 목표 |
|------|--------------|---------------|
| 테스트 커버리지 | 35% | 80%+ |
| UI 패키지 | 1 (28K줄) | 6 (분리) |
| Admin 페이지 | 24 | 38+ |
| Mock API | 33/33 | 0/33 (Real) |
| 프로덕션 준비 | 0% | 100% |
