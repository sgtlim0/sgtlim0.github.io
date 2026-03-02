# H Chat 기업 사용자용 API 연동 — 심층분석 및 구현 설계 방안

> 원본: H Chat 기업 사용자용 API 이용가이드 v260226
> 작성일: 2026-03-03
> 대상: Admin 앱 (`apps/admin`) + 공통 서비스 레이어 (`packages/ui/src/admin/services`)

---

## 1. 원본 문서 심층분석

### 1.1 API 인프라

| 구분 | URL | 비고 |
|------|-----|------|
| 상용 | `https://gateway-api.wrks.ai/` | 일반 기업 |
| 공공 | `https://gov-api.wrks.ai/` | 공공기관 전용 |

- **인증**: `API-KEY` 헤더 (관리자 발급)
- **응답 형식**: JSON `{ "result": "ok" | "error", "data": {...} }`
- **에러 코드**: 401 (인증 실패), 425 (유효하지 않은 API Key), E1027 (사용자 없음), E1032 (부서에 사용자 존재)

### 1.2 API 엔드포인트 분석

#### A. 부서 관리 API

| 메서드 | 경로 | 용도 | 제한 |
|--------|------|------|------|
| GET | `/admin/departments` | 부서 목록 조회 | limit(1000), page(1) |
| POST | `/admin/departments/bulk` | 부서 일괄 추가/수정/삭제 | **일 100회** |

**부서 데이터 모델**:
```typescript
interface Department {
  id: number;
  name: string;
  code: string;           // 고유 부서 코드 (예: "D001")
  parentCode: string;     // 상위 부서 코드 (빈 문자열 = 최상위)
  memo: string | null;
  createdAt: string;      // ISO 8601
  updatedAt: string;
}
```

**계층 구조 예시**:
```
A 회사 (code_A)
├── B 부서 (code_B, parent: code_A)
│   └── C 팀 (code_C, parent: code_B)
D 회사 (code_D, parent: null)
├── E 부서 (code_E, parent: code_D)
│   └── F 팀 (code_F, parent: code_E)
```

**Bulk 요청 형식**:
```typescript
interface DepartmentBulkItem {
  id: { code: string };
  delete?: boolean;           // true면 삭제
  meta?: {
    parentCode: string;       // 상위 부서 코드
    name: string;
  };
}
```

**implicitDeletion 모드**:
- `false` (기본): 명시적 `delete: true`만 삭제
- `true`: 요청에 포함되지 않은 부서 자동 삭제 (위험!)

#### B. 사용자 관리 API

| 메서드 | 경로 | 용도 | 제한 |
|--------|------|------|------|
| GET | `/admin/users` | 사용자 목록 조회 | limit(10), page(1) |
| POST | `/admin/users/bulk` | 사용자 일괄 수정/삭제 | **일 100회** |

**사용자 데이터 모델**:
```typescript
interface User {
  id: number;
  userName: string;
  workspaceId: number;
  workspaceName: string;
  email: string;
  createdAt: string;
  role: 'ENTERPRISE_MANAGER' | 'WORKSPACE_MANAGER' | 'WORKSPACE_USER';
  roleId: number;
  usageLimit: number;         // 0 = 무제한
  enabled: boolean;
  wsUserUsageLimit: number;
  departmentId: number;
  departmentCode: string;
  departmentFullName: string; // "본사/재무/펀딩팀"
  employeeId: number;
}
```

**역할(Role) 체계**:

| 역할 | 설명 | 권한 |
|------|------|------|
| ENTERPRISE_MANAGER | 기업 최고 관리자 | 전체 설정, 사용자/부서 관리 |
| WORKSPACE_MANAGER | 워크스페이스 관리자 | 소속 부서 사용자 관리 |
| WORKSPACE_USER | 일반 사용자 | H Chat 사용만 가능 |

**Bulk 요청 형식**:
```typescript
interface UserBulkItem {
  id: { userId: number } | { email: string }; // idType에 따라
  delete?: boolean;
  meta?: {
    departmentCode?: string;
    name?: string;
    enabled?: boolean;
    role?: string;
    usageLimit?: number;    // 0 = 무제한
    employeeId?: string;
  };
}
```

> **중요**: 사용자 **생성(create)은 불가** — API로는 수정/삭제만 가능. 사용자 생성은 SSO 또는 웹 회원가입을 통해서만 가능.

#### C. 사용자 활동 로그 API

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | `/admin/userActionLogs` | 감사 로그 조회 |

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 조회 시작일 |
| to | string | 조회 종료일 |
| workspaceId | number | 워크스페이스 필터 |
| name | string | 사용자명 검색 (부분 일치) |
| email | string | 이메일 검색 (부분 일치) |
| eventDetail | string | 이벤트 종류 (login/upload/download) |
| isXlsx | boolean | Excel 다운로드 |
| sort | 'asc' \| 'desc' | 정렬 |
| page | number | 페이지 |
| limit | number | 건수 |

**로그 데이터 모델**:
```typescript
interface UserActionLog {
  id: string;              // MongoDB ObjectId
  createdAt: string;
  workspaceName: string;
  userName: string;
  email: string;
  event: string;           // "Upload/Download", "Login" 등
  eventDetail: string;     // 상세 내용
  ipAddress: string;
  device: string;          // "Macintosh", "Windows" 등
  browser: string;         // "Chrome", "Firefox" 등
}
```

#### D. SSO 암호화 인증

**평문 형식**: `{사번}|{타임스탬프}|{성명}`
- 예: `293201|20250401170630|홍길동`
- 타임스탬프: `YYYYMMDDHHmmss`

**인증 URL**: `https://wrks.ai/ko/signin/company/{회사코드}?code={암호화코드}`
- 예: `https://wrks.ai/ko/signin/company/ai3?code=wJOGVsXpNd8Yq3a...`

**암호화 키**: H Chat 운영팀에서 별도 발급

### 1.3 주요 제약사항 및 위험 요소

| 항목 | 설명 | 대응 방안 |
|------|------|-----------|
| Bulk API 일 100회 제한 | 대규모 조직은 100회 이내 동기화 필요 | 배치 크기 최대화, 변경분만 전송 |
| 사용자 생성 불가 | API로 create 미지원 | SSO 연동 또는 초대 링크 안내 |
| implicitDeletion 위험 | true 설정 시 누락 데이터 자동 삭제 | 기본 false, 관리자 확인 후만 true |
| 페이지네이션 제한 | 부서 max 1000, 사용자 max 불명 | 전체 조회 시 반복 호출 |
| API Key 단일 인증 | 키 노출 시 전체 접근 가능 | 서버사이드 프록시, 키 로테이션 |

---

## 2. 구현 설계 방안

### 2.1 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                 Admin App (Next.js)                  │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │ 부서관리  │ 사용자   │ 감사로그  │ SSO설정  │      │
│  │  페이지   │ 관리     │  페이지   │  페이지  │      │
│  └─────┬────┴────┬─────┴────┬─────┴────┬─────┘      │
│        │         │          │          │             │
│  ┌─────▼─────────▼──────────▼──────────▼─────┐      │
│  │         Enterprise API Service Layer       │      │
│  │  (packages/ui/src/admin/services/          │      │
│  │   enterpriseApi.ts)                        │      │
│  └─────────────────┬─────────────────────────┘      │
│                    │                                 │
│  ┌─────────────────▼─────────────────────────┐      │
│  │         API Proxy (Next.js API Route)      │      │
│  │  (apps/admin/app/api/enterprise/           │      │
│  │   [...path]/route.ts)                      │      │
│  └─────────────────┬─────────────────────────┘      │
└────────────────────┼────────────────────────────────┘
                     │ HTTPS
     ┌───────────────▼───────────────┐
     │   gateway-api.wrks.ai         │
     │   (또는 gov-api.wrks.ai)      │
     └───────────────────────────────┘
```

### 2.2 디렉토리 구조

```
packages/ui/src/admin/
├── services/
│   ├── enterpriseApi.ts          # API 클라이언트 (부서/사용자/로그)
│   └── types/
│       └── enterprise.ts         # 타입 정의
├── DepartmentManagement.tsx      # 부서 관리 UI
├── UserSyncPanel.tsx             # 사용자 동기화 패널
├── AuditLogViewer.tsx            # 감사 로그 뷰어
└── SSOConfigPanel.tsx            # SSO 설정 패널

apps/admin/app/
├── api/enterprise/
│   └── [...path]/route.ts        # API 프록시 (API Key 서버사이드 보관)
├── departments/page.tsx          # 부서 관리 라우트
├── audit-logs/page.tsx           # 감사 로그 라우트
└── sso/page.tsx                  # SSO 설정 라우트
```

### 2.3 Phase별 구현 계획

---

## Phase 1: 타입 & API 서비스 레이어

### 1-1. 타입 정의 (`packages/ui/src/admin/services/types/enterprise.ts`)

```typescript
// --- 공통 ---
export interface ApiResponse<T> {
  result: 'ok' | 'error';
  data: T;
}

export interface ErrorResponse {
  status: 'error';
  code: number;
  message: string;
}

export interface BulkSummary {
  total: number;
  success: number;
  fail: number;
}

// --- 부서 ---
export interface Department {
  id: number;
  name: string;
  code: string;
  parentCode: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentBulkItem {
  id: { code: string };
  delete?: boolean;
  meta?: {
    parentCode: string;
    name: string;
  };
}

export interface DepartmentBulkResult {
  result: Array<{
    code: string;
    action: 'update' | 'insert' | 'delete' | 'skip';
    success: boolean;
    error?: { code: string; message: string };
  }>;
  summary: BulkSummary;
}

// --- 사용자 ---
export type UserRole = 'ENTERPRISE_MANAGER' | 'WORKSPACE_MANAGER' | 'WORKSPACE_USER';

export interface User {
  id: number;
  userName: string;
  workspaceId: number;
  workspaceName: string;
  email: string;
  createdAt: string;
  role: UserRole;
  roleId: number;
  usageLimit: number;
  enabled: boolean;
  wsUserUsageLimit: number;
  departmentId: number;
  departmentCode: string;
  departmentFullName: string;
  employeeId: number;
}

export interface UserBulkItem {
  id: { userId: number } | { email: string };
  delete?: boolean;
  meta?: {
    departmentCode?: string;
    name?: string;
    enabled?: boolean;
    role?: UserRole;
    usageLimit?: number;
    employeeId?: string;
  };
}

export interface UserBulkResult {
  result: Array<{
    id: string;
    action: 'update' | 'delete' | 'skip';
    success: boolean;
    error?: { code: string; message: string };
  }>;
  summary: BulkSummary;
}

// --- 감사 로그 ---
export interface UserActionLog {
  id: string;
  createdAt: string;
  workspaceName: string;
  userName: string;
  email: string;
  event: string;
  eventDetail: string;
  ipAddress: string;
  device: string;
  browser: string;
}

export interface AuditLogQuery {
  from?: string;
  to?: string;
  workspaceId?: number;
  name?: string;
  email?: string;
  eventDetail?: 'login' | 'upload' | 'download';
  isXlsx?: boolean;
  sort?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// --- SSO ---
export interface SSOConfig {
  companyCode: string;
  encryptionKey: string;
  baseUrl: string;      // wrks.ai 또는 커스텀
  enabled: boolean;
}
```

### 1-2. API 클라이언트 (`packages/ui/src/admin/services/enterpriseApi.ts`)

```typescript
const API_PROXY_BASE = '/api/enterprise';

export const enterpriseApi = {
  // 부서
  getDepartments: (page = 1, limit = 1000) =>
    fetch(`${API_PROXY_BASE}/admin/departments?page=${page}&limit=${limit}`)
      .then(handleResponse<{ departments: Department[] }>),

  bulkUpdateDepartments: (items: DepartmentBulkItem[], implicitDeletion = false) =>
    fetch(`${API_PROXY_BASE}/admin/departments/bulk?implicitDeletion=${implicitDeletion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).then(handleResponse<DepartmentBulkResult>),

  // 사용자
  getUsers: (params: { workspaceId?: number; name?: string; email?: string; page?: number; limit?: number }) =>
    fetch(`${API_PROXY_BASE}/admin/users?${new URLSearchParams(toStringRecord(params))}`)
      .then(handleResponse<{ users: User[]; totalUserCount: number }>),

  bulkUpdateUsers: (items: UserBulkItem[], idType: 'userId' | 'email' = 'userId', implicitDeletion = false) =>
    fetch(`${API_PROXY_BASE}/admin/users/bulk?idType=${idType}&implicitDeletion=${implicitDeletion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).then(handleResponse<UserBulkResult>),

  // 감사 로그
  getAuditLogs: (query: AuditLogQuery) =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord(query))}`)
      .then(handleResponse<{ userActionLogs: UserActionLog[] }>),

  downloadAuditLogsExcel: (query: Omit<AuditLogQuery, 'isXlsx'>) =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord({ ...query, isXlsx: true }))}`)
      .then(res => res.blob()),
};
```

### 1-3. API 프록시 (`apps/admin/app/api/enterprise/[...path]/route.ts`)

```typescript
// API Key를 서버사이드에서만 주입 — 클라이언트 노출 방지
const API_KEY = process.env.HCHAT_ENTERPRISE_API_KEY;
const API_BASE = process.env.HCHAT_ENTERPRISE_API_BASE || 'https://gateway-api.wrks.ai';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = new URL(`/${path}`, API_BASE);
  url.search = req.nextUrl.search;

  const res = await fetch(url.toString(), {
    headers: { 'API-KEY': API_KEY! },
  });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = new URL(`/${path}`, API_BASE);
  url.search = req.nextUrl.search;
  const body = await req.text();

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'API-KEY': API_KEY!, 'Content-Type': 'application/json' },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
```

---

## Phase 2: 부서 관리 UI

### 2-1. `DepartmentManagement.tsx` — 주요 기능

| 기능 | 설명 |
|------|------|
| 부서 트리 뷰 | parentCode 기반 계층 구조 렌더링 |
| 부서 검색 | 이름/코드 필터링 |
| 부서 추가 | 코드, 이름, 상위 부서 선택 |
| 부서 수정 | 인라인 편집 (이름, 상위 부서 이동) |
| 부서 삭제 | 사용자 배정 여부 확인 후 삭제 |
| 일괄 동기화 | CSV/Excel 업로드 → bulk API 호출 |
| 동기화 결과 | 성공/실패 건수 + 상세 결과 테이블 |

**부서 트리 빌드 알고리즘**:
```typescript
function buildDeptTree(departments: Department[]): DeptTreeNode[] {
  const map = new Map<string, DeptTreeNode>();
  const roots: DeptTreeNode[] = [];

  for (const dept of departments) {
    map.set(dept.code, { ...dept, children: [] });
  }

  for (const dept of departments) {
    const node = map.get(dept.code)!;
    if (dept.parentCode && map.has(dept.parentCode)) {
      map.get(dept.parentCode)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
```

**UI 와이어프레임**:
```
┌────────────────────────────────────────────────────────┐
│ 부서 관리                          [+ 부서 추가] [동기화] │
├────────────────────────────────────────────────────────┤
│ 🔍 부서 검색...                                         │
├──────────────────────┬─────────────────────────────────┤
│ 부서 트리             │ 부서 상세                        │
│                      │                                 │
│ ▼ A 회사 (code_A)    │ 이름: B 부서                     │
│   ▼ B 부서 (code_B)  │ 코드: code_B                    │
│     ● C 팀 (code_C)  │ 상위: A 회사                     │
│ ▼ D 회사 (code_D)    │ 생성일: 2025-01-30              │
│   ▼ E 부서 (code_E)  │ 소속 사용자: 12명                │
│     ● F 팀 (code_F)  │                                 │
│                      │ [수정] [삭제]                     │
└──────────────────────┴─────────────────────────────────┘
```

### 2-2. 라우트 (`apps/admin/app/departments/page.tsx`)

```typescript
'use client';
import { DepartmentManagement } from '@hchat/ui/admin';

export default function DepartmentsPage() {
  return <DepartmentManagement />;
}
```

---

## Phase 3: 사용자 관리 확장

### 3-1. 기존 `AdminUserManagement.tsx` 확장

현재 mock 데이터 기반 → 실데이터 API 연동

| 추가 기능 | 설명 |
|-----------|------|
| 실시간 사용자 검색 | name, email 파라미터로 서버 검색 |
| 역할 변경 | 드롭다운 → bulk API로 role 업데이트 |
| 사용량 제한 설정 | usageLimit 인라인 편집 |
| 사용자 비활성화 | enabled 토글 → bulk API |
| 부서 배정 | 부서 트리 선택 → departmentCode 업데이트 |
| 일괄 작업 | 체크박스 선택 → 일괄 역할변경/비활성화/삭제 |
| 페이지네이션 | 서버사이드 page/limit |

**일괄 작업 확인 다이얼로그**:
```
┌─────────────────────────────────┐
│ ⚠ 일괄 작업 확인                  │
│                                 │
│ 선택된 사용자 5명에 대해          │
│ 다음 작업을 수행합니다:           │
│                                 │
│ • 역할 변경: WORKSPACE_USER      │
│                                 │
│ 영향받는 사용자:                  │
│ - 홍길동 (hong@ai3.kr)          │
│ - 김철수 (kim@ai3.kr)           │
│ - ...외 3명                     │
│                                 │
│         [취소]  [확인]            │
└─────────────────────────────────┘
```

---

## Phase 4: 감사 로그 뷰어

### 4-1. `AuditLogViewer.tsx` — 주요 기능

| 기능 | 설명 |
|------|------|
| 날짜 범위 필터 | from/to DatePicker |
| 이벤트 유형 필터 | login, upload, download 탭 |
| 사용자 검색 | 이름/이메일 검색 |
| 정렬 | 최신순/오래된순 토글 |
| 페이지네이션 | 서버사이드 |
| Excel 다운로드 | isXlsx=true 호출 → Blob 다운로드 |
| 상세 보기 | 로그 행 클릭 → IP, 기기, 브라우저 정보 |

**UI 와이어프레임**:
```
┌──────────────────────────────────────────────────────────┐
│ 감사 로그                                    [Excel 다운로드] │
├──────────────────────────────────────────────────────────┤
│ 📅 2026-02-01 ~ 2026-03-03  │ 🔍 사용자 검색...            │
│ [전체] [로그인] [업로드] [다운로드]  │ 정렬: [최신순 ▼]         │
├──────────────────────────────────────────────────────────┤
│ 시각              │ 사용자      │ 이벤트        │ IP 주소     │
│ 2026-03-03 10:28 │ 홍길동      │ 다운로드       │ 10.0.1.23  │
│ 2026-03-03 09:15 │ 김철수      │ 로그인         │ 10.0.1.45  │
│ 2026-03-02 18:30 │ 이영희      │ 업로드         │ 10.0.2.12  │
│ ...              │ ...        │ ...           │ ...        │
├──────────────────────────────────────────────────────────┤
│                        < 1 2 3 4 5 >                     │
└──────────────────────────────────────────────────────────┘
```

### 4-2. 라우트 (`apps/admin/app/audit-logs/page.tsx`)

---

## Phase 5: SSO 설정 패널

### 5-1. `SSOConfigPanel.tsx` — 주요 기능

| 기능 | 설명 |
|------|------|
| SSO 활성화/비활성화 | 토글 스위치 |
| 회사 코드 설정 | 인풋 필드 (예: "ai3") |
| 암호화 키 관리 | 마스킹된 키 표시, 변경 버튼 |
| 테스트 URL 생성 | 사번+이름 입력 → 암호화된 URL 미리보기 |
| API 엔드포인트 설정 | 상용/공공 선택 |

**UI 와이어프레임**:
```
┌──────────────────────────────────────────────────────┐
│ SSO 설정                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│ SSO 인증 활성화                          [●━━━━ ON]   │
│                                                      │
│ 회사 코드                                             │
│ ┌────────────────────────────────┐                   │
│ │ ai3                            │                   │
│ └────────────────────────────────┘                   │
│                                                      │
│ API 엔드포인트                                        │
│ (●) 상용 (gateway-api.wrks.ai)                       │
│ ( ) 공공 (gov-api.wrks.ai)                           │
│                                                      │
│ 암호화 키                                             │
│ ┌────────────────────────────────┐                   │
│ │ ●●●●●●●●●●●●●●●●       [변경] │                   │
│ └────────────────────────────────┘                   │
│                                                      │
│ ─── SSO 테스트 ─────────────────────────────────      │
│                                                      │
│ 사번: ┌──────────┐ 이름: ┌──────────┐                │
│       │ 293201   │       │ 홍길동   │                │
│       └──────────┘       └──────────┘                │
│                                                      │
│ [테스트 URL 생성]                                      │
│                                                      │
│ 생성된 URL:                                           │
│ https://wrks.ai/ko/signin/company/ai3?code=wJOG...   │
│                                           [복사]     │
│                                                      │
│                               [저장]                  │
└──────────────────────────────────────────────────────┘
```

---

## Phase 6: 네비게이션 확장 & 빌드

### 6-1. AdminNav 업데이트

```typescript
// 추가할 navItems
{ href: '/departments', label: '부서 관리' },
{ href: '/audit-logs', label: '감사 로그' },
{ href: '/sso', label: 'SSO 설정' },
```

### 6-2. 환경변수

```env
# apps/admin/.env.local
HCHAT_ENTERPRISE_API_KEY=your-api-key-here
HCHAT_ENTERPRISE_API_BASE=https://gateway-api.wrks.ai
```

---

## 3. 수정 파일 목록

| 파일 | 변경 | Phase |
|------|------|-------|
| `packages/ui/src/admin/services/types/enterprise.ts` | 신규 — 타입 정의 | 1 |
| `packages/ui/src/admin/services/enterpriseApi.ts` | 신규 — API 클라이언트 | 1 |
| `packages/ui/src/admin/services/index.ts` | 수정 — enterprise export 추가 | 1 |
| `apps/admin/app/api/enterprise/[...path]/route.ts` | 신규 — API 프록시 | 1 |
| `packages/ui/src/admin/DepartmentManagement.tsx` | 신규 — 부서 관리 UI | 2 |
| `apps/admin/app/departments/page.tsx` | 신규 — 부서 관리 라우트 | 2 |
| `packages/ui/src/admin/AdminUserManagement.tsx` | 수정 — 실데이터 연동 | 3 |
| `packages/ui/src/admin/AuditLogViewer.tsx` | 신규 — 감사 로그 뷰어 | 4 |
| `apps/admin/app/audit-logs/page.tsx` | 신규 — 감사 로그 라우트 | 4 |
| `packages/ui/src/admin/SSOConfigPanel.tsx` | 신규 — SSO 설정 패널 | 5 |
| `apps/admin/app/sso/page.tsx` | 신규 — SSO 라우트 | 5 |
| `packages/ui/src/admin/index.ts` | 수정 — 새 컴포넌트 export | 5 |
| `apps/admin/components/AdminNav.tsx` | 수정 — 메뉴 추가 | 6 |
| `apps/admin/.env.local` | 신규 — API 키 환경변수 | 6 |

---

## 4. 보안 고려사항

### 4.1 API Key 보호

| 레이어 | 방법 |
|--------|------|
| 클라이언트 | API Key 직접 노출 금지 — 모든 호출은 프록시 경유 |
| 서버 프록시 | `process.env.HCHAT_ENTERPRISE_API_KEY`에서만 읽기 |
| Vercel 배포 | Environment Variables에 설정 (Production only) |
| 로테이션 | 주기적 키 변경 → 환경변수만 업데이트 |

### 4.2 입력 검증

```typescript
import { z } from 'zod';

const departmentSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().min(1).max(100),
  parentCode: z.string().max(50),
});

const userBulkSchema = z.object({
  role: z.enum(['ENTERPRISE_MANAGER', 'WORKSPACE_MANAGER', 'WORKSPACE_USER']).optional(),
  usageLimit: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
});
```

### 4.3 위험 작업 보호

- **implicitDeletion=true**: 2단계 확인 다이얼로그 필수
- **사용자 삭제**: "정말 삭제하시겠습니까?" + 사용자명 재입력 확인
- **일괄 작업**: 영향받는 건수 표시 + 확인 다이얼로그
- **API 호출 제한**: 클라이언트에서 일 100회 카운터 표시

---

## 5. Mock 데이터 (개발용)

Phase 1 완료 전까지 Mock 데이터로 UI 개발 진행:

```typescript
export const mockDepartments: Department[] = [
  { id: 1, name: '현대자동차', code: 'HMC', parentCode: '', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 2, name: 'DX본부', code: 'DX', parentCode: 'HMC', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 3, name: 'AI연구팀', code: 'AI_TEAM', parentCode: 'DX', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 4, name: '기아', code: 'KIA', parentCode: '', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 5, name: 'IT기획팀', code: 'IT_PLAN', parentCode: 'KIA', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
];

export const mockUsers: User[] = [
  { id: 1, userName: '홍길동', workspaceId: 1, workspaceName: '현대자동차', email: 'hong@hyundai.com', createdAt: '2025-02-01T00:00:00Z', role: 'ENTERPRISE_MANAGER', roleId: 1, usageLimit: 0, enabled: true, wsUserUsageLimit: 0, departmentId: 2, departmentCode: 'DX', departmentFullName: '현대자동차/DX본부', employeeId: 20103021 },
  { id: 2, userName: '김철수', workspaceId: 1, workspaceName: '현대자동차', email: 'kimcs@hyundai.com', createdAt: '2025-02-15T00:00:00Z', role: 'WORKSPACE_MANAGER', roleId: 2, usageLimit: 100, enabled: true, wsUserUsageLimit: 100, departmentId: 3, departmentCode: 'AI_TEAM', departmentFullName: '현대자동차/DX본부/AI연구팀', employeeId: 20205018 },
];

export const mockAuditLogs: UserActionLog[] = [
  { id: '67aad1ddb01bcc1533d3c1fa', createdAt: '2026-03-03T10:28:13Z', workspaceName: '현대자동차', userName: '홍길동', email: 'hong@hyundai.com', event: 'Upload/Download', eventDetail: 'Download, monthly_report.xlsx', ipAddress: '10.0.1.23', device: 'Macintosh', browser: 'Chrome' },
  { id: '67aad1ddb01bcc1533d3c1fb', createdAt: '2026-03-03T09:15:00Z', workspaceName: '현대자동차', userName: '김철수', email: 'kimcs@hyundai.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.0.1.45', device: 'Windows', browser: 'Edge' },
];
```

---

## 6. 검증 계획

```bash
# Phase 1 완료 후
npm run build:admin    # 정적 빌드 성공 확인

# Phase 6 완료 후
npm run dev:admin      # localhost:3002 에서 전체 기능 확인
```

### 테스트 체크리스트

- [ ] 부서 트리 계층 렌더링 정상
- [ ] 부서 추가/수정/삭제 bulk API 호출 성공
- [ ] 사용자 검색 (이름/이메일) 동작
- [ ] 사용자 역할 변경 bulk API 호출 성공
- [ ] 감사 로그 날짜 필터 동작
- [ ] 감사 로그 Excel 다운로드 동작
- [ ] SSO 테스트 URL 생성 동작
- [ ] API 프록시 API Key 서버사이드 보관 확인
- [ ] implicitDeletion=true 시 확인 다이얼로그 표시
- [ ] 일 100회 제한 카운터 동작
- [ ] 모바일 반응형 레이아웃
- [ ] 다크모드 정상 표시
