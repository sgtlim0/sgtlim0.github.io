'use client'

import Link from 'next/link'
import { LRNavbar, CodeBlock } from '@hchat/ui/llm-router'
import { Zap, Shield, BarChart3, ArrowRight } from 'lucide-react'

const codeExamples = [
  {
    language: 'Python',
    code: `import requests

response = requests.post(
  "https://api.hchat-llm-router.io/v1/chat/completions",
  headers={
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  json={
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "안녕하세요!"}
    ]
  }
)
print(response.json())`,
  },
  {
    language: 'Node.js',
    code: `const response = await fetch(
  'https://api.hchat-llm-router.io/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: '안녕하세요!' }
      ],
    }),
  }
);
const data = await response.json();
console.log(data);`,
  },
  {
    language: 'cURL',
    code: `curl -X POST https://api.hchat-llm-router.io/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "안녕하세요!"}
    ]
  }'`,
  },
]

const features = [
  {
    icon: Zap,
    title: '통합 API',
    description: '하나의 엔드포인트로 86개 모델 접근',
  },
  {
    icon: Shield,
    title: '최적 비용',
    description: '모델별 가격 비교, 자동 라우팅으로 최대 40% 절감',
  },
  {
    icon: BarChart3,
    title: '실시간 모니터링',
    description: '사용량, 비용, 레이턴시 실시간 추적',
  },
]

const topModels = [
  { name: 'GPT-4o', provider: 'OpenAI', inputPrice: 29.9, outputPrice: 89.7 },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 35.9, outputPrice: 179.5 },
  { name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 15.5, outputPrice: 46.5 },
  { name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 1.8, outputPrice: 7.2 },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPrice: 11.9, outputPrice: 59.7 },
]

const stats = [
  { label: '86개 모델', value: '86' },
  { label: '7개 제공사', value: '7' },
  { label: '99.9% 가용성', value: '99.9%' },
  { label: '평균 0.8초 레이턴시', value: '0.8s' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LRNavbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-lr-bg-section">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-lr-text-primary">
            86개 AI 모델, 하나의 API
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-lr-text-secondary max-w-3xl mx-auto">
            최적의 가격으로 GPT-4o, Claude, Gemini 등 모든 모델을 통합 API로 사용하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/signup"
              className="px-8 py-4 bg-lr-primary hover:bg-lr-primary-hover text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 border-2 border-lr-border hover:border-lr-primary text-lr-text-primary rounded-lg font-semibold text-lg transition-colors"
            >
              문서 보기
            </Link>
          </div>

          {/* Code Example */}
          <div className="max-w-4xl mx-auto">
            <CodeBlock examples={codeExamples} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-8 border border-lr-border rounded-lg hover:border-lr-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-lr-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-lr-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-lr-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-lr-text-secondary">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 bg-lr-bg-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-lr-text-primary">
            인기 모델 가격
          </h2>
          <p className="text-lg text-center mb-12 text-lr-text-secondary">
            주요 AI 모델의 실시간 가격을 확인하세요
          </p>
          <div className="bg-lr-bg border border-lr-border rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-lr-bg-section">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-lr-text-primary">
                    모델
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-lr-text-primary">
                    제공사
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-lr-text-primary">
                    입력 가격
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-lr-text-primary">
                    출력 가격
                  </th>
                </tr>
              </thead>
              <tbody>
                {topModels.map((model, index) => (
                  <tr
                    key={model.name}
                    className={index !== topModels.length - 1 ? 'border-b border-lr-border' : ''}
                  >
                    <td className="px-6 py-4 text-lr-text-primary font-medium">
                      {model.name}
                    </td>
                    <td className="px-6 py-4 text-lr-text-secondary">{model.provider}</td>
                    <td className="px-6 py-4 text-right text-lr-text-primary">
                      ₩{model.inputPrice.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-right text-lr-text-primary">
                      ₩{model.outputPrice.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center">
            <Link
              href="/models"
              className="inline-flex items-center gap-2 text-lr-primary hover:text-lr-primary-hover font-semibold text-lg"
            >
              전체 모델 보기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 border-t border-b border-lr-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-lr-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-lr-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-lr-bg-section">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-lr-text-secondary">
              © 2026 H Chat LLM Router. All rights reserved.
            </div>
            <div className="flex gap-8">
              <Link
                href="/docs"
                className="text-lr-text-secondary hover:text-lr-primary transition-colors"
              >
                문서
              </Link>
              <Link
                href="/models"
                className="text-lr-text-secondary hover:text-lr-primary transition-colors"
              >
                모델
              </Link>
              <Link
                href="/playground"
                className="text-lr-text-secondary hover:text-lr-primary transition-colors"
              >
                플레이그라운드
              </Link>
            </div>
            <div className="text-lr-text-muted text-sm">Powered by Hyundai Motor Group</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
