---
name: service-layer-gen
description: 새로운 도메인/기능의 서비스 레이어를 일괄 생성합니다. API 인터페이스에서 types, mock/real 서비스, provider, hooks, index 6개 파일을 자동 생성합니다. Admin, User, LLM Router 등 10개 앱에서 동일 패턴 적용.
---

# Service Layer Generator

이 스킬은 H Chat 모노레포의 모든 앱에서 반복되는 Service Layer 패턴을 일괄 생성합니다.

## 활성화 시점

- 새 도메인/기능 추가 (예: "결제", "알림", "워크플로우")
- API 엔드포인트 신규 생성
- Mock에서 Real API로 전환 시 서비스 레이어 필요

## 생성 파일 6개

배치 위치: `packages/ui/src/{domain}/services/`

| # | 파일 | 역할 |
|---|------|------|
| 1 | `types.ts` | 인터페이스 + Zod 스키마 |
| 2 | `mock{Domain}Service.ts` | 페이커 데이터 + 지연 시뮬레이션 |
| 3 | `real{Domain}Service.ts` | fetch + 에러 처리 |
| 4 | `{Domain}ServiceProvider.tsx` | Context + Mock/Real 전환 |
| 5 | `use{Domain}.ts` | 커스텀 훅 (useQuery/useMutation) |
| 6 | `index.ts` | barrel export |

## 핵심 규칙

1. **불변성**: 항상 `{ ...obj, field: newValue }` spread 패턴, 직접 변경 금지
2. **Zod 검증**: 모든 외부 입력에 `.parse()` 적용
3. **Mock/Real 전환**: `NEXT_PUBLIC_API_MODE` 환경변수로 전환
4. **에러 처리**: `throw new Error('사용자 친화적 메시지')` 패턴
5. **지연 시뮬레이션**: Mock에 50-200ms 랜덤 지연 추가

## 코드 템플릿

### 1. types.ts

```typescript
import { z } from 'zod'

// Zod 스키마 정의
export const {Domain}Schema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  status: z.enum(['active', 'inactive', 'pending']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type {Domain} = z.infer<typeof {Domain}Schema>

// 생성/수정 DTO
export const Create{Domain}Schema = {Domain}Schema.omit({ id: true, createdAt: true, updatedAt: true })
export type Create{Domain} = z.infer<typeof Create{Domain}Schema>

// 서비스 인터페이스
export interface {Domain}Service {
  getAll(): Promise<{Domain}[]>
  getById(id: string): Promise<{Domain} | null>
  create(data: Create{Domain}): Promise<{Domain}>
  update(id: string, data: Partial<Create{Domain}>): Promise<{Domain}>
  delete(id: string): Promise<void>
}
```

### 2. mock{Domain}Service.ts

```typescript
import type { {Domain}, Create{Domain}, {Domain}Service } from './types'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
const randomDelay = () => delay(50 + Math.random() * 150)

const mockData: {Domain}[] = [
  // 3-5개 리얼리스틱 목 데이터
]

export const mock{Domain}Service: {Domain}Service = {
  async getAll() {
    await randomDelay()
    return [...mockData]
  },
  async getById(id) {
    await randomDelay()
    return mockData.find(item => item.id === id) ?? null
  },
  async create(data) {
    await randomDelay()
    const newItem: {Domain} = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return newItem
  },
  async update(id, data) {
    await randomDelay()
    const existing = mockData.find(item => item.id === id)
    if (!existing) throw new Error(`${id}를 찾을 수 없습니다`)
    return { ...existing, ...data, updatedAt: new Date().toISOString() }
  },
  async delete(id) {
    await randomDelay()
  },
}
```

### 3. real{Domain}Service.ts

```typescript
import type { {Domain}, Create{Domain}, {Domain}Service } from './types'
import { {Domain}Schema } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

export const real{Domain}Service: {Domain}Service = {
  async getAll() {
    const res = await fetch(`${BASE_URL}/{domain}s`)
    if (!res.ok) throw new Error('목록을 불러오는데 실패했습니다')
    const data = await res.json()
    return data.map((item: unknown) => {Domain}Schema.parse(item))
  },
  async getById(id) {
    const res = await fetch(`${BASE_URL}/{domain}s/${id}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다')
    return {Domain}Schema.parse(await res.json())
  },
  async create(data) {
    const res = await fetch(`${BASE_URL}/{domain}s`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('생성에 실패했습니다')
    return {Domain}Schema.parse(await res.json())
  },
  async update(id, data) {
    const res = await fetch(`${BASE_URL}/{domain}s/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('수정에 실패했습니다')
    return {Domain}Schema.parse(await res.json())
  },
  async delete(id) {
    const res = await fetch(`${BASE_URL}/{domain}s/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('삭제에 실패했습니다')
  },
}
```

### 4. {Domain}ServiceProvider.tsx

```typescript
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { {Domain}Service } from './types'
import { mock{Domain}Service } from './mock{Domain}Service'
import { real{Domain}Service } from './real{Domain}Service'

const {Domain}ServiceContext = createContext<{Domain}Service | null>(null)

const isMockMode = process.env.NEXT_PUBLIC_API_MODE !== 'real'

export function {Domain}ServiceProvider({ children }: { children: ReactNode }) {
  const service = isMockMode ? mock{Domain}Service : real{Domain}Service
  return (
    <{Domain}ServiceContext.Provider value={service}>
      {children}
    </{Domain}ServiceContext.Provider>
  )
}

export function use{Domain}Service(): {Domain}Service {
  const ctx = useContext({Domain}ServiceContext)
  if (!ctx) throw new Error('{Domain}ServiceProvider 내에서 사용해야 합니다')
  return ctx
}
```

### 5. use{Domain}.ts

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { use{Domain}Service } from './{Domain}ServiceProvider'
import type { {Domain}, Create{Domain} } from './types'

export function use{Domain}List() {
  const service = use{Domain}Service()
  const [items, setItems] = useState<{Domain}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await service.getAll()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, error, refetch: fetch }
}

export function use{Domain}Mutation() {
  const service = use{Domain}Service()
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (data: Create{Domain}) => {
    setLoading(true)
    try { return await service.create(data) }
    finally { setLoading(false) }
  }, [service])

  const update = useCallback(async (id: string, data: Partial<Create{Domain}>) => {
    setLoading(true)
    try { return await service.update(id, data) }
    finally { setLoading(false) }
  }, [service])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try { await service.delete(id) }
    finally { setLoading(false) }
  }, [service])

  return { create, update, remove, loading }
}
```

### 6. index.ts

```typescript
export * from './types'
export { mock{Domain}Service } from './mock{Domain}Service'
export { real{Domain}Service } from './real{Domain}Service'
export { {Domain}ServiceProvider, use{Domain}Service } from './{Domain}ServiceProvider'
export { use{Domain}List, use{Domain}Mutation } from './use{Domain}'
```

## 사용법

```
사용자: "Admin에 워크플로우 관리 서비스 레이어 추가해줘"
→ {Domain} = Workflow, {domain} = workflow 로 6개 파일 생성
→ 배치: packages/ui/src/admin/services/
```

## 참조 문서

- `docs/ADMIN_SERVICE_LAYER.md` — 패턴 원본
- `docs/API_SPEC.md` — 엔드포인트 사양
- `docs/HCHAT_WIKI_SKILL_DESIGN.md` — 스킬 설계방안
