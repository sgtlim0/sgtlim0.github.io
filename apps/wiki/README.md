# @hchat/wiki

H Chat 마크다운 위키. Notion 스타일의 사이드바 네비게이션과 마크다운 렌더링을 제공하는
문서 사이트.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4
- react-markdown, remark-gfm, rehype-highlight
- gray-matter (프론트매터 파싱)
- highlight.js (코드 구문 강조)

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:wiki         # http://localhost:3000
npm run build:wiki       # 정적 빌드 → apps/wiki/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 홈 (content/home.md) |
| `/[...slug]` | Catch-all 라우트 (content/ 디렉토리 기반) |

콘텐츠는 `apps/wiki/content/` 디렉토리에 마크다운 파일로 관리된다.
하위 디렉토리는 접이식 네비게이션 그룹이 된다.

- `content/home.md` -- 루트 페이지
- `content/guides/basics.md` -- `/guides/basics`로 매핑

## 핵심 모듈

- `lib/markdown.ts` -- getAllPages, getPageBySlug, getNavigation
- `components/Sidebar.tsx` -- 계층형 사이드바 네비게이션
- `components/MarkdownRenderer.tsx` -- 마크다운 렌더링 + 구문 강조

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)

## 배포

GitHub Actions -> GitHub Pages -- https://sgtlim0.github.io
