# @hchat/extension

H Chat 크롬 확장 프로그램. 웹 페이지 텍스트를 분석하고 요약하는 AI 비서.
Chrome Manifest V3 기반으로 Vite + React로 빌드한다.

## 기술 스택

- Chrome Extension Manifest V3
- Vite 6, React 19, TypeScript 5
- Tailwind CSS 4

## 시작하기

```bash
# 프로젝트 루트에서
cd apps/extension
npm run dev              # vite build --watch (개발 모드)
npm run build            # tsc && vite build → dist/
```

빌드 후 `chrome://extensions`에서 `dist/` 폴더를 로드한다.

## 구조

| 파일 | 설명 |
|------|------|
| `src/popup/App.tsx` | 팝업 UI (React) |
| `src/popup/Popup.tsx` | 팝업 컴포넌트 |
| `src/background.ts` | Service Worker (contextMenus, 메시지 처리) |
| `src/content.ts` | Content Script (페이지 텍스트 추출) |
| `src/utils/blocklist.ts` | URL 차단 목록 |
| `src/types.ts` | 타입 정의 |
| `public/manifest.json` | Manifest V3 설정 |

## 권한

- `contextMenus` -- 우클릭 메뉴
- `activeTab` -- 현재 탭 접근
- `storage` -- 로컬 저장소
- `optional_host_permissions` -- https 호스트 (선택적)

## 의존 패키지

이 앱은 모노레포 공유 패키지를 사용하지 않으며 독립적으로 빌드된다.

## 배포

Chrome Web Store (수동 업로드)
