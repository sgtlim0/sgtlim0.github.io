# H Chat 포트폴리오 데모 시나리오

> 발표 예상 시간: 25-30분
> 대상: 기술 면접, 포트폴리오 발표
> 최종 업데이트: 2026-03-07 | Phase 54 완료 기준

---

## 1. 프로젝트 소개 (2분)

### 오프닝
- "H Chat은 현대차그룹 생성형 AI 서비스 플랫폼입니다"
- "npm workspaces 모노레포로 8개 앱을 관리합니다"
- 기술 스택: Next.js 16, TypeScript, Tailwind CSS 4, Turborepo

### 수치 하이라이트
| 항목 | 수량 |
|------|------|
| 배포된 앱 | 8개 |
| UI 컴포넌트 | 132개 |
| 서비스 파일 | 33개 |
| 페이지 | 55개 |
| 총 코드 | 48,025줄 |
| Storybook | 135 파일 |
| 단위 테스트 | 707개 |
| E2E 테스트 | 18개 |
| Interaction Tests | 28개 |
| AI 모델 카탈로그 | 86개 |
| 완료 Phase | 54개 |

---

## 2. Wiki 포트폴리오 허브 (2분)

**URL**: https://sgtlim0.github.io

### 시연 순서
1. 랜딩 페이지 -- 프로젝트 포트폴리오 카드
2. 사이드바 네비게이션 -- 자동 생성, 접기/펼치기
3. 마크다운 렌더링 -- 코드 하이라이팅, 테이블
4. 다크 모드 토글
5. 반응형 -- 모바일 뷰 전환

### 핵심 포인트
- 28개 정적 페이지, 5개 섹션
- GitHub Pages 자동 배포
- SEO + 접근성 (WCAG 2.1 AA)

---

## 3. HMG 공식사이트 (1분)

**URL**: https://hchat-hmg.vercel.app

### 시연 순서
1. 홈페이지 -- Hero Banner, 기능 카드
2. 자료실 -- 탭 필터링, 다운로드
3. 다국어 전환 (한/영)

### 핵심 포인트
- 현대차그룹 브랜딩, i18n 다국어 (49키)

---

## 4. Admin 관리자 패널 (5분) ⭐

**URL**: https://hchat-admin.vercel.app
**로그인**: admin@hchat.ai / Admin123!

### 시연 순서
1. 로그인 → 대시보드
2. **실시간 모니터링** -- 라이브 메트릭, 차트, 활동 피드 (Phase 29)
3. **ROI 분석** -- 사이드바 네비게이션
   - Overview: KPI 카드, 시간 절약 차트
   - Analysis: ROI 추이, 시뮬레이터 (인터랙티브)
   - Organization: 부서별 히트맵
4. **데이터 업로드** -- Excel 파일 브라우저 파싱 (SheetJS)
5. **알림 시스템** -- 벨 아이콘, 패널, 읽음 처리 (Phase 32)
6. **대시보드 커스터마이징** -- 위젯 추가/제거, 레이아웃 편집 (Phase 33)
7. **AI 워크플로우 빌더** -- 노드 추가, 엣지 연결, 템플릿 로드 (Phase 34)
8. 부서 관리 / 감사 로그 / SSO 설정
9. 다크 모드 전환

### 핵심 포인트
- 24개 라우트, Enterprise 수준
- 5종 순수 SVG 차트 (라이브러리 없음)
- Provider Pattern 서비스 레이어
- 10종 위젯 시스템 (CSS Grid + localStorage)
- 8종 노드 워크플로우 (SVG 베지어 엣지)
- 인증/인가 (AuthProvider + ProtectedRoute)

---

## 5. User 사용자 앱 (3분)

**URL**: https://hchat-user.vercel.app

### 시연 순서
1. 채팅 -- 메시지 입력, SSE 스트리밍 응답
2. 비서 전환 -- 번역, 문서 작성, OCR 선택
3. 커스텀 비서 생성 -- 이름, 이모지, 시스템 프롬프트
4. 번역 페이지 -- 언어 선택, 번역 실행
5. 마이페이지 -- 사용 통계
6. 반응형 -- 모바일 네비게이션

### 핵심 포인트
- SSE 스트리밍 채팅 (카테고리별 응답)
- 19개 공식 + 사용자 커스텀 비서
- localStorage 대화 영속성

---

## 6. LLM Router (2분)

**URL**: https://hchat-llm-router.vercel.app

### 시연 순서
1. 랜딩 페이지 -- 서비스 소개
2. 모델 가격표 -- 86개 모델, 정렬/필터
3. **Playground** -- 모델 선택, Temperature/TopP 조절, SSE 스트리밍 (Phase 30)
4. **모델 비교** -- 2-3개 모델 나란히, 가격/성능 차트 (Phase 30)
5. 대시보드 -- 사용량 통계

### 핵심 포인트
- 86개 AI 모델 (20+ 프로바이더)
- 7개 프로바이더 레이턴시 프로파일
- API 키 유틸리티 (마스킹, 검증, 생성, 비용 추정)

---

## 7. Desktop & Mobile (2분)

### Desktop
**URL**: https://hchat-desktop.vercel.app
- 5페이지: Chat, Agents, Swarm, Debate, Tools
- 접이식 사이드바, 에이전트 카드, 도구 그리드
- 24개 전용 디자인 토큰

### Mobile
**URL**: https://hchat-mobile.vercel.app
- 4탭: Chat, Assistants, History, Settings
- PWA (480px), 스와이프 제스처
- 터치 최적화 반응형

### 핵심 포인트
- 모노레포 통합 (Phase 31, 35)
- 공유 @hchat/ui 패키지 재사용

---

## 8. 기술 인프라 (3분)

### Storybook
**URL**: https://hchat-storybook.vercel.app
- 126 스토리 파일 (Admin 31, ROI 24, User 21, HMG 12 등)
- 다크 모드 테마 전환
- 접근성 검사 addon

### 코드 품질
- TypeScript strict mode, `any` 타입 0개
- 평균 파일 91.8줄, 800줄+ 파일 1개만
- Prettier + Husky + lint-staged (pre-commit)

### 테스트 전략
- **단위**: Vitest 4 (20파일, ~284 테스트)
- **E2E**: Playwright (18파일, 다크모드/반응형/a11y)
- **성능**: Lighthouse CI (perf>=80, a11y>=85)

### 모노레포 아키텍처
- npm workspaces + Turborepo
- @hchat/tokens → @hchat/ui → 8개 앱
- 공유 컴포넌트 128개, 커스텀 훅 60개

### CI/CD
- GitHub Actions: type-check → lint → test → build → Lighthouse
- Playwright E2E: 배포 URL 대상 테스트
- Vercel 자동 배포 (7개), GitHub Pages (1개)

---

## 9. 별도 레포 프로젝트 (1분)

### Chrome Extension
- **레포**: github.com/sgtlim0/hchat-v2-extension
- 107 소스파일, 21,500+ LOC, 649 테스트
- 16개 AI 도구, 에이전트, 토론 엔진

### Desktop PWA
- **레포**: github.com/sgtlim0/hchat-desktop
- 15 페이지, 667 테스트, 83% 커버리지
- Zustand 16 스토어, Dexie IndexedDB

---

## 10. 마무리 (1분)

### 기술적 강점 요약
1. **모노레포 설계**: 8개 앱의 코드 공유 및 일관성
2. **컴포넌트 시스템**: 128개 재사용 가능한 컴포넌트, 60개 훅
3. **성능**: Dynamic Import, Bundle Analyzer, Turbo Cache
4. **품질**: 284 단위 테스트, 18 E2E 테스트, Lighthouse CI
5. **자동화**: CI/CD, Prettier, Husky, lint-staged
6. **확장성**: Provider Pattern으로 Mock ↔ Real API 즉시 전환

### Q&A 준비
- "왜 모노레포를 선택했나요?" → 코드 공유, 일관성, 빌드 효율. @hchat/ui 하나로 128개 컴포넌트 공유
- "차트 라이브러리 없이 어떻게?" → 순수 SVG/CSS로 5종 구현 (MiniLine, MiniBar, Donut, Area, Radar)
- "실제 API 연동은?" → Provider Pattern으로 Mock ↔ API 전환 가능. Interface만 교체
- "테스트 전략은?" → 단위 (Vitest 284개) + E2E (Playwright 18개) + Lighthouse CI + axe-core 접근성
- "48,000줄을 혼자?" → Claude Code + TDD + 모노레포. 57일간 109커밋, 54 Phase. 707 테스트
