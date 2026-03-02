import type { PageData } from '@/lib/markdown';

export const mockAIChatPage: PageData = {
  slug: 'chat/ai-chat',
  title: 'AI 채팅',
  description: '멀티 AI 프로바이더(Claude, GPT, Gemini) 기반 실시간 스트리밍 대화',
  badges: ['v3', '핵심 기능'],
  content: `## 주요 기능

### 실시간 스트리밍 응답

AWS Bedrock(Claude), OpenAI(GPT), Google(Gemini) 모든 프로바이더에서 실시간 스트리밍 응답을 지원합니다.

### 이미지 업로드 및 Vision 지원

Claude와 GPT 모델에서 이미지 업로드를 지원합니다. 이미지를 첨부하면 AI가 내용을 분석합니다.

## 페르소나 시스템

| 페르소나 | 설명 |
|---------|------|
| 기본 어시스턴트 | 균형 잡힌 대화 |
| 개발자 | 코드 작성 및 리뷰 |
| 번역가 | 다국어 번역 |

## 모델 선택

\`\`\`typescript
const models = {
  bedrock: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  gemini: ['gemini-2.0-flash'],
};
\`\`\`
`,
  path: 'chat/ai-chat.md',
};

export const mockFAQPage: PageData = {
  slug: 'faq',
  title: 'FAQ',
  description: '자주 묻는 질문과 답변',
  badges: undefined,
  content: `## 일반 질문

### H Chat이란?

Chrome Extension 기반 멀티 AI 프로바이더 어시스턴트입니다.

### 어떤 AI 모델을 지원하나요?

AWS Bedrock Claude, OpenAI GPT, Google Gemini를 지원합니다.
`,
  path: 'faq.md',
};

export const mockChangelogPage: PageData = {
  slug: 'changelog',
  title: '변경 이력',
  description: 'H Chat 버전별 업데이트 및 변경 사항',
  badges: undefined,
  content: `## v3.0.0 (2026년 3월)

### 신규 기능

#### 멀티 AI 프로바이더 지원

- **OpenAI GPT 프로바이더 추가**
- **Google Gemini 프로바이더 추가**
- **총 7개 AI 모델 지원**

### 개선 사항

- 스트리밍 응답 속도 30% 향상
- 다크 모드 디자인 개선
`,
  path: 'changelog.md',
};

export const mockShortPage: PageData = {
  slug: 'quickstart',
  title: '빠른 시작',
  description: '5분 안에 H Chat 시작하기',
  badges: ['초보자 가이드'],
  content: `Chrome 웹 스토어에서 H Chat을 설치하세요.`,
  path: 'quickstart.md',
};
