import type { Meta, StoryObj } from '@storybook/react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Molecules/MarkdownRenderer',
  component: MarkdownRenderer,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 700 }} className="bg-bg-page p-8"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

export const BasicMarkdown: Story = {
  args: {
    content: `## 주요 기능

### 실시간 스트리밍

모든 프로바이더에서 실시간 스트리밍 응답을 지원합니다.

- Claude Sonnet 4.6
- GPT-4o
- Gemini 2.0 Flash

### 이미지 업로드

이미지를 첨부하면 AI가 내용을 분석합니다.
`,
  },
};

export const CodeBlock: Story = {
  args: {
    content: `## 코드 예시

\`\`\`typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function sendMessage(msg: ChatMessage): Promise<void> {
  return chrome.runtime.sendMessage(msg);
}
\`\`\`

인라인 코드: \`const x = 42;\`
`,
  },
};

export const Table: Story = {
  args: {
    content: `## 모델 비교

| 모델 | Bedrock Model ID | 특장점 |
|------|------------------|--------|
| Claude Sonnet 4.6 | \`claude-sonnet-4-6\` | 가장 빠른 응답 |
| Claude Opus 4.6 | \`claude-opus-4-6\` | 최고 품질 |
| Claude Haiku 4.5 | \`claude-haiku-4-5\` | 경제적 |
`,
  },
};

export const Mixed: Story = {
  args: {
    content: `## 페르소나 시스템

> AI의 응답 스타일을 페르소나로 커스터마이즈할 수 있습니다.

### 기본 페르소나

1. **기본 어시스턴트** — 균형 잡힌 대화
2. **개발자** — 코드 작성 및 리뷰
3. **번역가** — 다국어 번역

### 커스텀 페르소나

\`\`\`json
{
  "name": "마케팅 전문가",
  "prompt": "마케팅 관점에서 답변해주세요",
  "icon": "megaphone"
}
\`\`\`

---

자세한 내용은 [설정 가이드](/settings/providers)를 참조하세요.
`,
  },
};
