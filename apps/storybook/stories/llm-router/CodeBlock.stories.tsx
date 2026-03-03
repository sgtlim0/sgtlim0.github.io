import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from '@hchat/ui/llm-router/CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'LLM Router/Molecules/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const MultiLanguage: Story = {
  args: {
    examples: [
      {
        language: 'cURL',
        code: `curl -X POST https://api.hchat.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-..." \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`,
      },
      {
        language: 'Python',
        code: `import requests

response = requests.post(
    "https://api.hchat.ai/v1/chat/completions",
    headers={"Authorization": "Bearer sk-..."},
    json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}
)
print(response.json())`,
      },
      {
        language: 'JavaScript',
        code: `const response = await fetch("https://api.hchat.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk-...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }]
  })
});
const data = await response.json();`,
      },
    ],
  },
};

export const SingleLanguage: Story = {
  args: {
    examples: [
      {
        language: 'Python',
        code: `from hchat import Client

client = Client(api_key="sk-...")
response = client.chat("Hello, world!")
print(response.text)`,
      },
    ],
  },
};
