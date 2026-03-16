---
name: hchat-security-layer
description: H Chat 6계층 보안 레이어를 자동 적용합니다. Zod 스키마, PII 11패턴 살균, CSP nonce, API 프록시, Rate Limiting, 블록리스트를 엔드포인트와 컴포넌트에 삽입합니다.
---

# H Chat Security Layer

H Chat 프로젝트 전용 6계층 보안 스킬. 일반적인 OWASP 보안 위에 PII 살균, Extension CSP, 블록리스트를 추가합니다.

## 활성화 시점

- API 엔드포인트 생성
- 사용자 입력 처리 코드 작성
- 민감한 데이터(PII) 작업
- Chrome Extension 콘텐츠 스크립트 작성
- 외부 API 연동

## 6계층 보안 체크리스트

### L1: Zod 입력 검증

모든 외부 입력에 Zod `.parse()` 적용:

```typescript
import { z } from 'zod'

const InputSchema = z.object({
  query: z.string().min(1).max(1000),
  page: z.number().int().min(1).max(100).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export function handler(rawInput: unknown) {
  const input = InputSchema.parse(rawInput)
  // input은 타입 안전
}
```

기존 스키마: `packages/ui/src/schemas/` (9개 파일, 40+ 타입)

### L2: PII 11패턴 살균

```typescript
const PII_PATTERNS = [
  { name: '주민등록번호', regex: /\d{6}-[1-4]\d{6}/g, mask: '******-*******' },
  { name: '카드번호', regex: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, mask: '****-****-****-****' },
  { name: '이메일', regex: /[\w.-]+@[\w.-]+\.\w+/g, mask: '***@***.***' },
  { name: '전화번호', regex: /01[016789]-?\d{3,4}-?\d{4}/g, mask: '***-****-****' },
  { name: '사업자등록번호', regex: /\d{3}-\d{2}-\d{5}/g, mask: '***-**-*****' },
  { name: '여권번호', regex: /[A-Z]{1,2}\d{7,8}/g, mask: '*********' },
  { name: '운전면허번호', regex: /\d{2}-\d{2}-\d{6}-\d{2}/g, mask: '**-**-******-**' },
  { name: '계좌번호', regex: /\d{3,6}-\d{2,6}-\d{4,6}/g, mask: '***-***-****' },
  { name: '건강보험번호', regex: /\d{10,14}/g, mask: '**************' },
  { name: 'IP 주소', regex: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, mask: '***.***.***.***' },
  { name: 'AWS 키', regex: /AKIA[0-9A-Z]{16}/g, mask: 'AKIA****************' },
]

export function sanitizePII(text: string): string {
  return PII_PATTERNS.reduce(
    (result, { regex, mask }) => result.replace(regex, mask),
    text
  )
}
```

기존 유틸리티: `packages/ui/src/utils/sanitize.ts`

### L3: CSP + Trusted Types

`middleware.ts` (SSR 앱에서):

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64')
  const response = NextResponse.next()

  response.headers.set('Content-Security-Policy', [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `connect-src 'self' https://*.anthropic.com https://*.openai.com`,
  ].join('; '))

  return response
}
```

### L4: API 프록시 (서버사이드 API Key 보호)

```typescript
// apps/{app}/app/api/v1/{resource}/route.ts
export async function GET() {
  const apiKey = process.env.API_SECRET_KEY // 서버에서만 접근
  if (!apiKey) throw new Error('API_SECRET_KEY가 설정되지 않았습니다')

  const res = await fetch('https://api.external.com/data', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  return Response.json(await res.json())
}
```

### L5: Rate Limiting

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 })
  return true
}
```

### L6: 블록리스트

20 도메인 + 6 패턴 차단 (Extension Content Script 실행 방지):

```typescript
const BLOCKED_DOMAINS = [
  'mail.google.com', 'outlook.office.com', 'banking.*',
  '*.gov.kr', 'myaccount.google.com', // ... 20개
]

const BLOCKED_PATTERNS = [
  /\/login/i, /\/signin/i, /\/auth/i,
  /\/payment/i, /\/checkout/i, /\/bank/i,
]

export function isBlockedSite(url: string): boolean {
  const hostname = new URL(url).hostname
  return BLOCKED_DOMAINS.some(d =>
    d.includes('*') ? new RegExp(d.replace('*', '.*')).test(hostname) : hostname === d
  ) || BLOCKED_PATTERNS.some(p => p.test(url))
}
```

## 보안 검증 명령어

```bash
npm run lint          # ESLint 보안 규칙
npm test              # 보안 관련 테스트
npx tsc --noEmit      # 타입 안전성
```

## 참조 문서

- `docs/IMPL_05_SECURITY_GOVERNANCE_FRAMEWORK.md`
- `docs/CHROME_EXTENSION_DESIGN.md`
- `packages/ui/src/utils/sanitize.ts`
