# H Chat 포트폴리오 데모 시나리오

> 발표 예상 시간: 15-20분
> 대상: 기술 면접, 포트폴리오 발표

---

## 1. 프로젝트 소개 (2분)

### 오프닝
- "H Chat은 현대차그룹 생성형 AI 서비스 플랫폼입니다"
- "npm workspaces 모노레포로 7개 앱을 관리합니다"
- 기술 스택: Next.js 16, TypeScript, Tailwind CSS 4, Turborepo

### 수치 하이라이트
| 항목 | 수량 |
|------|------|
| 배포된 앱 | 7개 |
| UI 컴포넌트 | 100개+ |
| 페이지 | 60개+ |
| Storybook 스토리 | 73개+ |
| E2E 테스트 | 18개+ |
| Dynamic Import | 22개 페이지 |
| 디자인 토큰 | 80개+ |

---

## 2. Wiki 포트폴리오 허브 (2분)

**URL**: https://sgtlim0.github.io

### 시연 순서
1. 랜딩 페이지 — 프로젝트 포트폴리오 카드
2. 사이드바 네비게이션 — 자동 생성, 접기/펼치기
3. 마크다운 렌더링 — 코드 하이라이팅, 테이블
4. 다크 모드 토글
5. 반응형 — 모바일 뷰 전환

### 핵심 포인트
- 31개 정적 페이지, 5개 섹션
- GitHub Pages 자동 배포
- SEO + 접근성 (WCAG 2.1 AA)

---

## 3. HMG 공식사이트 (2분)

**URL**: https://hchat-hmg.vercel.app

### 시연 순서
1. 홈페이지 — Hero Banner, 기능 카드
2. 사용 가이드 — 단계별 안내
3. 자료실 — 탭 필터링, 다운로드
4. 대시보드 — 통계 카드
5. 다국어 전환 (한/영)
6. 반응형 — GNB 햄버거 메뉴

### 핵심 포인트
- 현대차그룹 브랜딩
- i18n 다국어 지원
- 반응형 GNB + Footer

---

## 4. Admin 관리자 패널 (4분) ⭐

**URL**: https://hchat-admin.vercel.app
**로그인**: admin@hchat.ai / Admin123!

### 시연 순서
1. 로그인 페이지 → 대시보드
2. 대시보드 — 핵심 메트릭 카드
3. ROI 분석 — 사이드바 네비게이션
   - Overview: KPI 카드, 시간 절약 차트
   - Adoption: 사용자 트렌드, 기능 채택률
   - Productivity: 주간 AI 활용, 비용 절약
   - Analysis: ROI 추이, 시뮬레이터 (인터랙티브)
   - Organization: 부서별 히트맵
   - Sentiment: NPS, 레이더 차트
4. 데이터 업로드 — Excel 파일 브라우저 파싱 (SheetJS)
5. 부서 관리 — CRUD
6. 감사 로그 — 필터링, 페이지네이션
7. SSO 설정 — SAML/OAuth 설정 폼
8. 다크 모드 전환

### 핵심 포인트
- 17개 라우트, Enterprise 수준
- 5종 순수 SVG 차트 (라이브러리 없음)
- Provider Pattern 서비스 레이어
- 인증/인가 (AuthProvider + ProtectedRoute)
- Dynamic Import 16개 페이지 (코드 스플리팅)

---

## 5. User 사용자 앱 (3분)

**URL**: https://hchat-user.vercel.app

### 시연 순서
1. 채팅 — 메시지 입력, SSE 스트리밍 응답
2. 비서 전환 — 번역, 문서 작성, OCR 선택
3. 커스텀 비서 생성 — 이름, 시스템 프롬프트 설정
4. 번역 페이지 — 언어 선택, 번역 실행
5. 마이페이지 — 사용 통계, 설정
6. 반응형 — 모바일 네비게이션

### 핵심 포인트
- SSE 스트리밍 채팅 (mock)
- 8종 AI 비서
- localStorage 대화 영속성
- 5개 페이지 Dynamic Import

---

## 6. LLM Router (2분)

**URL**: https://hchat-llm-router.vercel.app

### 시연 순서
1. 랜딩 페이지 — 서비스 소개
2. 모델 가격표 — 86개 모델, 정렬/필터
3. Playground — 모델 선택, 파라미터 조절, 실행
4. 대시보드 — 사용량 통계

### 핵심 포인트
- 86개 AI 모델 (OpenAI, Anthropic, Google, Mistral, Ollama)
- 인터랙티브 Playground
- 10개 페이지

---

## 7. 기술 인프라 (2분)

### Storybook
**URL**: https://hchat-storybook.vercel.app
- 73개+ 스토리
- 다크 모드 테마 전환
- 접근성 검사 addon

### 모노레포 아키텍처
- npm workspaces + Turborepo
- @hchat/tokens → @hchat/ui → 7개 앱
- 공유 컴포넌트 100개+

### 성능 최적화
- Bundle Analyzer (`npm run analyze:admin`)
- Dynamic Import 22개 페이지
- Turbo 빌드 캐시 (inputs 필드)

### CI/CD
- GitHub Actions: type-check → lint → build → Lighthouse CI
- E2E: Playwright 18개+ 테스트
- Vercel 자동 배포

### 접근성
- WCAG 2.1 AA 준수
- Skip Navigation, ARIA labels
- 키보드 네비게이션
- 색상 대비 4.5:1+

---

## 8. 별도 레포 프로젝트 (1분)

### Chrome Extension
- **레포**: github.com/sgtlim0/hchat-v2-extension
- 107 소스파일, 21,500+ LOC, 649 테스트
- 16개 AI 도구, 에이전트, 토론 엔진

### Desktop PWA
- **레포**: github.com/sgtlim0/hchat-desktop
- **URL**: https://hchat-desktop.vercel.app
- 15 페이지, 667 테스트, 83% 커버리지
- Zustand 16 스토어, Dexie IndexedDB

---

## 9. 마무리 (1분)

### 기술적 강점 요약
1. **모노레포 설계**: 7개 앱의 코드 공유 및 일관성
2. **컴포넌트 시스템**: 100+ 재사용 가능한 컴포넌트
3. **성능**: Dynamic Import, Bundle Analyzer, Turbo Cache
4. **품질**: E2E 테스트, Lighthouse CI, WCAG 접근성
5. **자동화**: CI/CD, Prettier, Husky, lint-staged

### Q&A 준비
- "왜 모노레포를 선택했나요?" → 코드 공유, 일관성, 빌드 효율
- "차트 라이브러리 없이 어떻게?" → 순수 SVG/CSS로 5종 구현
- "실제 API 연동은?" → Provider Pattern으로 Mock ↔ API 전환 가능
- "테스트 전략은?" → E2E (Playwright) + Lighthouse CI + axe-core 접근성
