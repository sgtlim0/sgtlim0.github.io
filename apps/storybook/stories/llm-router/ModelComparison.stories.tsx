import type { Meta, StoryObj } from '@storybook/react'
import ModelComparison from '@hchat/ui/llm-router/ModelComparison'
import type { LLMModel } from '@hchat/ui/llm-router'

const sampleModels: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerIcon: '🤖',
    category: 'chat',
    inputPrice: 3300,
    outputPrice: 13200,
    contextWindow: 128000,
    maxOutput: 16384,
    latency: '0.8초',
    isPopular: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    providerIcon: '🧠',
    category: 'chat',
    inputPrice: 3960,
    outputPrice: 19800,
    contextWindow: 200000,
    maxOutput: 16384,
    latency: '1.1초',
    isPopular: true,
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerIcon: '💎',
    category: 'chat',
    inputPrice: 1650,
    outputPrice: 6600,
    contextWindow: 1000000,
    maxOutput: 8192,
    latency: '1.5초',
    isPopular: true,
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    providerIcon: '🦙',
    category: 'chat',
    inputPrice: 528,
    outputPrice: 792,
    contextWindow: 128000,
    maxOutput: 32768,
    latency: '1.2초',
    isPopular: true,
  },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    providerIcon: '🧠',
    category: 'chat',
    inputPrice: 19800,
    outputPrice: 79200,
    contextWindow: 200000,
    maxOutput: 16384,
    latency: '2.1초',
    isPopular: true,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerIcon: '🔍',
    category: 'chat',
    inputPrice: 364,
    outputPrice: 1452,
    contextWindow: 64000,
    maxOutput: 8192,
    latency: '1.0초',
  },
  {
    id: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    providerIcon: '🌬️',
    category: 'code',
    inputPrice: 1320,
    outputPrice: 3960,
    contextWindow: 32000,
    maxOutput: 8192,
    latency: '0.9초',
    isPopular: true,
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    providerIcon: '🔮',
    category: 'chat',
    inputPrice: 3960,
    outputPrice: 19800,
    contextWindow: 128000,
    maxOutput: 4096,
    latency: '1.6초',
  },
  {
    id: 'gpt-4-1-mini',
    name: 'GPT-4.1 mini',
    provider: 'OpenAI',
    providerIcon: '🤖',
    category: 'chat',
    inputPrice: 200,
    outputPrice: 800,
    contextWindow: 128000,
    maxOutput: 16384,
    latency: '0.5초',
    isPopular: true,
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    providerIcon: '💎',
    category: 'chat',
    inputPrice: 105,
    outputPrice: 420,
    contextWindow: 1000000,
    maxOutput: 8192,
    latency: '0.4초',
  },
]

const meta: Meta<typeof ModelComparison> = {
  title: 'LLM Router/Organisms/ModelComparison',
  component: ModelComparison,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1200 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ModelComparison>

export const Default: Story = {
  args: { models: sampleModels },
}

export const SingleModel: Story = {
  args: { models: [sampleModels[0]] },
}
