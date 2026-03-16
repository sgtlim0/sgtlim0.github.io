---
name: ext-scaffold
description: Chrome Extension Manifest V3 프로젝트를 스캐폴딩합니다. manifest.json, Service Worker, Content Script, Side Panel, Popup, 서비스, 타입을 MV3 제약에 맞게 생성합니다.
---

# Extension Scaffold

Chrome Extension MV3 프로젝트 스캐폴딩 스킬. H Chat Extension 패턴을 따릅니다.

## 활성화 시점

- Extension 새 기능/페이지 추가
- Extension 프로젝트 초기화
- Content Script 추가
- Side Panel 화면 추가

## 생성 파일 7개

| # | 파일 | 역할 |
|---|------|------|
| 1 | `manifest.json` | MV3, 최소 권한 |
| 2 | `src/background.ts` | Service Worker |
| 3 | `src/content.ts` | Content Script |
| 4 | `src/sidepanel/` | Side Panel UI |
| 5 | `src/popup/` | Popup (400x600) |
| 6 | `src/services/` | Mock/Real 서비스 |
| 7 | `src/types/` | 메시지/설정 타입 |

## MV3 제약 체크리스트

반드시 확인:
- [ ] Service Worker **5분 비활성 종료** 대응 (`chrome.alarms`)
- [ ] **CSP**: 인라인 스크립트 금지 (외부 파일만)
- [ ] Content Script: **Isolated World** (메인 페이지 변수 접근 불가)
- [ ] `chrome.storage.local` 사용 (localStorage X)
- [ ] **Host Permissions** 최소 범위 (optional_host_permissions 활용)
- [ ] 번들 크기 **<5MB**
- [ ] Side Panel 로드 **<1s**

## 코드 템플릿

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "H Chat",
  "version": "1.0.0",
  "permissions": ["storage", "sidePanel", "alarms", "contextMenus"],
  "optional_host_permissions": ["https://*/*"],
  "background": { "service_worker": "background.js", "type": "module" },
  "side_panel": { "default_path": "sidepanel.html" },
  "action": { "default_popup": "popup.html" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### background.ts (Service Worker)

```typescript
// 5분 비활성 종료 대응: alarm으로 keepalive
chrome.alarms.create('keepalive', { periodInMinutes: 4 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepalive') { /* heartbeat */ }
})

// 메시지 라우터
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'ANALYZE_PAGE':
      handleAnalyzePage(message.payload, sendResponse)
      return true // async response
    case 'CHAT_SEND':
      handleChatSend(message.payload, sendResponse)
      return true
  }
})
```

### content.ts (Content Script)

```typescript
import { sanitizePII } from './utils/sanitize'

// DOM 접근 (Isolated World)
function extractPageContent(): string {
  const content = document.body.innerText
  return sanitizePII(content) // PII 살균 후 전송
}

// Background와 통신
chrome.runtime.sendMessage({
  type: 'PAGE_CONTENT',
  payload: extractPageContent()
})
```

### 메시지 타입

```typescript
export type MessageType =
  | { type: 'ANALYZE_PAGE'; payload: { url: string; content: string } }
  | { type: 'CHAT_SEND'; payload: { message: string; model: string } }
  | { type: 'PAGE_CONTENT'; payload: string }

export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'system'
  defaultModel: string
  enablePIISanitization: boolean
}
```

## Vite 빌드

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: 'src/background.ts',
        content: 'src/content.ts',
        popup: 'src/popup/index.html',
        sidepanel: 'src/sidepanel/index.html',
      },
      output: { entryFileNames: '[name].js' },
    },
  },
})
```

## 참조 문서

- `docs/CHROME_EXTENSION_DESIGN.md`
- `docs/CHROME_EXTENSION_IMPLEMENTATION.md`
- `docs/SERVICE_PLAN_03_ARCHITECTURE.md` — Extension 아키텍처
- `apps/extension/` — 기존 Extension 코드
