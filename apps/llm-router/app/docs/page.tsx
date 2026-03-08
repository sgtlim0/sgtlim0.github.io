'use client';

import dynamic from 'next/dynamic';
import {
  LRNavbar,
  DocsSidebar,
  type DocsSidebarItem,
} from '@hchat/ui/llm-router';
import { SkeletonChart } from '@hchat/ui';
import { Book, Code, Rocket, ArrowRight } from 'lucide-react';

const CodeBlock = dynamic(
  () => import('@hchat/ui/llm-router').then((m) => ({ default: m.CodeBlock })),
  { loading: () => <SkeletonChart height={200} />, ssr: false },
);

const sidebarItems: DocsSidebarItem[] = [
  {
    title: '시작하기',
    href: '/docs',
    children: [
      { title: '소개', href: '/docs#intro' },
      { title: '빠른 시작', href: '/docs#quickstart' },
      { title: '인증', href: '/docs#auth' },
    ],
  },
  {
    title: 'API 레퍼런스',
    href: '/docs/api',
    children: [
      { title: 'Chat Completions', href: '/docs/api#chat' },
      { title: 'Embeddings', href: '/docs/api#embeddings' },
      { title: 'Images', href: '/docs/api#images' },
      { title: 'Audio', href: '/docs/api#audio' },
    ],
  },
  {
    title: '모델 가이드',
    href: '/docs/models',
    children: [
      { title: '모델 선택 가이드', href: '/docs/models#selection' },
      { title: '가격 정책', href: '/docs/models#pricing' },
      { title: '레이트 리밋', href: '/docs/models#rate-limits' },
    ],
  },
  {
    title: 'SDK',
    href: '/docs/sdk',
    children: [
      { title: 'Python', href: '/docs/sdk#python' },
      { title: 'Node.js', href: '/docs/sdk#nodejs' },
      { title: 'cURL 예제', href: '/docs/sdk#curl' },
    ],
  },
];

const pythonExample = `from hchat_llm import HChatLLM

client = HChatLLM(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "당신은 유능한 AI 비서입니다."},
        {"role": "user", "content": "현대자동차의 최신 전기차 모델을 알려주세요."}
    ]
)
print(response.choices[0].message.content)`;

const nodejsExample = `import HChatLLM from '@hchat/llm';

const client = new HChatLLM({ apiKey: 'your-api-key' });

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: '당신은 유능한 AI 비서입니다.' },
    { role: 'user', content: '현대자동차의 최신 전기차 모델을 알려주세요.' }
  ]
});
console.log(response.choices[0].message.content);`;

const curlExample = `curl -X POST https://api.hchat.ai/v1/chat/completions \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "당신은 유능한 AI 비서입니다."},
      {"role": "user", "content": "현대자동차의 최신 전기차 모델을 알려주세요."}
    ]
  }'`;

const codeExamples = [
  { language: 'Python', code: pythonExample },
  { language: 'Node.js', code: nodejsExample },
  { language: 'cURL', code: curlExample },
];

const providers = [
  { name: 'OpenAI', count: 20 },
  { name: 'Anthropic', count: 19 },
  { name: 'Google', count: 8 },
  { name: 'xAI', count: 6 },
  { name: 'Perplexity', count: 4 },
  { name: 'Others', count: 29 },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-lr-bg">
      <LRNavbar />

      <div className="flex">
        <DocsSidebar items={sidebarItems} />

        <main className="flex-1 px-8 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-lr-text-primary mb-4">
            H Chat LLM Router 문서
          </h1>
          <p className="text-lg text-lr-text-secondary mb-12">
            86개 AI 모델을 하나의 API로 통합한 기업용 LLM 라우터입니다.
          </p>

          {/* 빠른 시작 */}
          <section id="quickstart" className="mb-16">
            <h2 className="text-2xl font-bold text-lr-text-primary mb-6 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-lr-primary" />
              빠른 시작
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="p-6 bg-lr-bg-section border border-lr-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-lr-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-lr-text-primary">
                    API 키 발급
                  </h3>
                </div>
                <p className="text-lr-text-secondary ml-11">
                  대시보드에서 API 키를 생성하세요. 생성된 키는 한 번만 표시되므로
                  안전하게 보관하세요.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 bg-lr-bg-section border border-lr-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-lr-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-lr-text-primary">
                    SDK 설치
                  </h3>
                </div>
                <div className="ml-11 space-y-2">
                  <p className="text-lr-text-secondary mb-4">
                    선호하는 언어의 SDK를 설치하세요.
                  </p>
                  <div className="bg-lr-bg-code p-4 rounded-lg">
                    <pre className="text-sm text-gray-300">
                      <code># Python</code>
                      {'\n'}
                      <code>pip install hchat-llm</code>
                      {'\n\n'}
                      <code># Node.js</code>
                      {'\n'}
                      <code>npm install @hchat/llm</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 bg-lr-bg-section border border-lr-border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-lr-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-lr-text-primary">
                    첫 번째 요청
                  </h3>
                </div>
                <div className="ml-11">
                  <p className="text-lr-text-secondary mb-4">
                    아래 예제 코드를 사용하여 첫 번째 API 요청을 보내세요.
                  </p>
                  <CodeBlock examples={codeExamples} />
                </div>
              </div>
            </div>
          </section>

          {/* 지원 모델 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-lr-text-primary mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-lr-primary" />
              지원 모델
            </h2>
            <p className="text-lr-text-secondary mb-6">
              총 86개의 LLM 모델을 지원합니다. 주요 제공업체별 모델 수는 다음과
              같습니다.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.name}
                  className="p-4 bg-lr-bg-section border border-lr-border rounded-lg"
                >
                  <div className="font-semibold text-lr-text-primary">
                    {provider.name}
                  </div>
                  <div className="text-2xl font-bold text-lr-primary mt-1">
                    {provider.count}
                    <span className="text-sm text-lr-text-muted ml-1">
                      models
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-lr-bg-section border-l-4 border-lr-primary rounded-r-lg">
              <p className="text-lr-text-secondary">
                모든 모델의 상세 가격과 사양은{' '}
                <a
                  href="/models"
                  className="text-lr-primary hover:underline font-medium"
                >
                  모델 가격표
                </a>
                에서 확인하실 수 있습니다.
              </p>
            </div>
          </section>

          {/* 다음 단계 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-lr-text-primary mb-6 flex items-center gap-2">
              <Book className="w-6 h-6 text-lr-primary" />
              다음 단계
            </h2>

            <div className="grid gap-4">
              <a
                href="/docs/api"
                className="p-6 bg-lr-bg-section border border-lr-border rounded-lg hover:border-lr-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-lr-text-primary mb-2">
                      API 레퍼런스
                    </h3>
                    <p className="text-lr-text-secondary">
                      모든 API 엔드포인트와 파라미터를 확인하세요
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-lr-text-muted group-hover:text-lr-primary transition-colors" />
                </div>
              </a>

              <a
                href="/docs/models"
                className="p-6 bg-lr-bg-section border border-lr-border rounded-lg hover:border-lr-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-lr-text-primary mb-2">
                      모델 가이드
                    </h3>
                    <p className="text-lr-text-secondary">
                      프로젝트에 맞는 최적의 모델을 선택하세요
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-lr-text-muted group-hover:text-lr-primary transition-colors" />
                </div>
              </a>

              <a
                href="/playground"
                className="p-6 bg-lr-bg-section border border-lr-border rounded-lg hover:border-lr-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-lr-text-primary mb-2">
                      Playground
                    </h3>
                    <p className="text-lr-text-secondary">
                      브라우저에서 바로 모델을 테스트해보세요
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-lr-text-muted group-hover:text-lr-primary transition-colors" />
                </div>
              </a>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-lr-primary/10 border border-lr-primary/20 rounded-lg">
            <p className="text-sm text-lr-text-secondary">
              문제가 있거나 질문이 있으신가요?{' '}
              <a
                href="mailto:support@hchat.ai"
                className="text-lr-primary hover:underline font-medium"
              >
                support@hchat.ai
              </a>
              로 문의해주세요.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
