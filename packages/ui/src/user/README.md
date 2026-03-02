# H Chat 사용자 기능 컴포넌트

H Chat 사용자 인터페이스를 구성하는 컴포넌트 및 페이지 패키지입니다.

## 사용 앱

- H Chat 웹 서비스 (향후 구현)

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { ChatPage, ChatSidebar, AssistantGrid } from '@hchat/ui/user';

export default function App() {
  return (
    <>
      <ChatSidebar />
      <ChatPage />
    </>
  );
}
```

## 컴포넌트 분류

### UI 컴포넌트 (12개)

| 컴포넌트 | 설명 |
|---------|------|
| **UserGNB** | 사용자 상단 네비게이션 바 |
| **ChatSidebar** | 채팅 목록 사이드바 |
| **ChatSearchBar** | 채팅/어시스턴트 검색 바 |
| **AssistantCard** | 어시스턴트 정보 카드 |
| **AssistantGrid** | 어시스턴트 그리드 목록 |
| **CategoryFilter** | 카테고리 필터 |
| **FileUploadZone** | 파일 업로드 영역 |
| **StepProgress** | 단계 진행률 표시 |
| **EngineSelector** | AI 엔진 선택기 |
| **ProjectTable** | 프로젝트 테이블 |
| **SubscriptionCard** | 구독 정보 카드 |
| **UsageTable** | 사용량 통계 테이블 |

### 페이지 (5개)

| 페이지 | 설명 |
|-------|------|
| **ChatPage** | 업무 비서 채팅 페이지 |
| **TranslationPage** | 문서 번역 서비스 |
| **DocsPage** | 문서 작성 도구 |
| **OCRPage** | 이미지/PDF 텍스트 추출 |
| **MyPage** | 마이페이지 (설정, 구독, 사용량) |

### 서비스 레이어

- **types.ts** — TypeScript 타입 정의
- **mockData.ts** — Mock 데이터 샘플

## 특징

- 모듈식 설계
- Mock 데이터 포함
- 다크모드 지원
- TypeScript 완전 지원
- 반응형 레이아웃

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰
- **@hchat/ui** — 기본 컴포넌트
