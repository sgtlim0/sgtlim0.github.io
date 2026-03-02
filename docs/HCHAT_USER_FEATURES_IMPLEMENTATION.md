# H Chat 사용자 기능 — 심층분석 및 구현 설계 방안

> 원본: wrks.ai 사용자 화면 스크린샷 5장 분석 (2026-03-03)
> 대상: HMG 앱 (`apps/hmg`) 확장 또는 별도 사용자 앱

---

## 1. 스크린샷 심층분석

### 1.1 업무 비서 채팅 (wrks.ai/ko/chat)

**레이아웃**:
- 상단 GNB: 웍스AI 로고 + 탭 메뉴 (업무 비서, 문서 번역, 문서 작성, 텍스트 추출) + 사용자 이메일 + 기업용 버전 가입 + 언어 선택
- 좌측 사이드바: "새 대화 시작" 버튼, 대화 기록 리스트
- 좌측 하단: 내 계정 관리, 이용 매뉴얼, 로그아웃, 버전 (v 2.0)
- 메인 영역: 히어로 텍스트 + 검색바 + 비서 그리드

**핵심 기능**:

| 기능 | 설명 |
|------|------|
| 실시간 검색 | 웹 검색 + 사진 이해 + 그림/차트 생성 |
| 업무 대화 | 자연어 질의 → AI 응답 |
| 비서 탭 | "웍스 공식 비서" (플랫폼 제공) / "내가 만든 비서" (커스텀) |
| 비서 카테고리 | 전체, 채팅, 업무, 번역, 정리, 보고, 그림, 글쓰기 |

**공식 비서 8종**:

| 비서 | 아이콘 | 기반 모델 | 기능 |
|------|--------|-----------|------|
| 신중한 톡정이 | ❤️ | GPT-4o | 대화, 코딩, 검색, 그림 생성, 사진 인식 |
| 티커타카 장인 | 🟢 | GPT-4.1 nano | 대화, 검색, 그림 생성, 이미지 인식 |
| 문서 파일 검토 | 📋 | - | PDF 등 문서 올리고 내용 질문, 요약 |
| 문서 번역 | 📄 | - | PDF 등 문서 형식 유지한채 번역 |
| 파워포인트 기획 | ⌨️ | - | 시안 내용 주면 PPT 구성 제안 |
| 본문 번역 | 🌐 | - | 본문 추가 원하는 언어로 번역 |
| 데이터 분석 | 📊 | - | 액셀/CSV 올리고 분석, 차트 생성 요청 |
| 이메일 작성 | ✉️ | - | 내용만 주고 전문적인 이메일 작성 |

**UI 컴포넌트 구조**:
```
ChatPage
├── GNB (공통)
├── ChatSidebar
│   ├── NewChatButton
│   ├── ConversationList
│   └── AccountMenu (계정관리, 매뉴얼, 로그아웃)
├── ChatHero
│   ├── HeroText ("실시간 검색, 사진 이해, 그림/차트 생성...")
│   └── SearchBar (아이콘 + 인풋 + 첨부 버튼)
├── AssistantTabs ("웍스 공식 비서" | "내가 만든 비서")
├── CategoryFilter (전체, 채팅, 업무, 번역, 정리, 보고, 그림, 글쓰기)
└── AssistantGrid
    └── AssistantCard (아이콘, 이름, 모델, 설명)
```

### 1.2 문서 번역 도구 (wrks.ai/ko/tools/translation)

**레이아웃**:
- 상단: 타이틀 "문서 번역 도구" + 설명
- 지원 형식: PDF, DOCX, DOC, PPTX, PPT, XLSX, XLS
- 진행 탭: ① 번역 시작 → ② 번역 결과

**번역 엔진 비교**:

| 항목 | 자체 번역 엔진 | DeepL 번역 엔진 |
|------|---------------|-----------------|
| 번역 품질 | 최상 | 최상 |
| 번역 속도 | 빠름 | 빠름 |
| 번역 가능 언어 | 89개 | 32개 |
| 용량 제한 | 하루 최대 5,000페이지, 300MB | 하루 최대 30MB, 100건/자키지 |

**주의사항**: AI 번역 특성상 글이 빠질 수 있고, 문서에 그림이 많으면 디자인 일부 빠질 수 있음

**UI 컴포넌트 구조**:
```
TranslationPage
├── GNB (공통)
├── PageHeader (타이틀, 설명, 지원 형식)
├── StepIndicator (번역 시작 | 추출 일반 번역)
├── WarningBanner ("AI 번역 특성상...")
├── EngineSelector
│   ├── EngineCard (자체 번역 엔진 — 상세 스펙)
│   └── EngineCard (DeepL 번역 엔진 — 상세 스펙)
├── FileUploadZone
│   └── DragDropArea ("클릭하여 파일을 선택하거나 드래그하여 추가")
└── TranslationResult (번역 완료 후)
```

### 1.3 문서 작성 도구 (wrks.ai/ko/tools/docs)

**레이아웃**:
- 상단: 타이틀 "문서 작성 도구" + 사용법 설명
- 지원 형식: 한글(HWP), 워드(DOCX)
- 5단계 워크플로우 진행바

**워크플로우 5단계**:

| 단계 | 이름 | 설명 |
|------|------|------|
| ① | 프로젝트 선택 | 새 프로젝트 시작 또는 기존 선택 |
| ② | 작성할 파일 선택 | 문서 유형 선택 |
| ③ | 프로젝트 배경지식 제공 | 컨텍스트 입력 |
| ④ | 목차 선택 및 내용 작성 | AI가 목차 제안, 사용자 편집 |
| ⑤ | 파일 생성 (저장 예정) | 최종 파일 다운로드 |

**프로젝트 테이블**:

| 컬럼 | 설명 |
|------|------|
| 프로젝트명 | 프로젝트 이름 |
| 문서 종류 | HWP/DOCX |
| 최종 작성일 | 마지막 수정일 |
| 삭제 | 삭제 버튼 |

**UI 컴포넌트 구조**:
```
DocsPage
├── GNB (공통)
├── PageHeader (타이틀, 설명)
├── StepProgress (5단계 진행바)
│   └── Step (번호, 이름, 활성 상태)
├── NewProjectButton ("새 프로젝트 시작")
├── ProjectTable
│   └── ProjectRow (이름, 종류, 작성일, 삭제)
└── EmptyState ("아직 만든 프로젝트가 없어요")
```

### 1.4 텍스트 추출/OCR (wrks.ai/ko/tools/ocr)

**레이아웃**:
- 상단: 설명 텍스트 (이미지에서 글자 자동 추출, 사업자등록증, 스크린샷/스캔 문서 등)
- 2단계: ① 이미지 파일 업로드 → ② 추출 일반 번역

**업로드 규칙**:
- 텍스트 추출: 최대 5장, 같은 종류 이미지 동시 업로드
- 번역: 최대 20장 동시 업로드
- 다른 종류 이미지 동시 업로드 불가 (예: 명수증 2개 + 사업자등록증 3개 → 2번 분리 작업)
- 변환된 파일 최대 2주간 무료 다운로드 가능

**변환 결과 테이블**:

| 컬럼 | 설명 |
|------|------|
| 업로드파일명 | 원본 파일 이름 |
| 현재상황 | 변환 진행률/완료 |
| 변환 완료 | 다운로드 버튼 |

**UI 컴포넌트 구조**:
```
OCRPage
├── GNB (공통)
├── PageDescription (기능 설명)
├── StepIndicator (이미지 파일 업로드 | 추출 일반 번역)
├── InfoBox ("영수증 등 문서에 제공성 및 사진 현장에서 퍼사로 저거...")
├── FileUploadZone
│   ├── DragDropArea
│   └── UploadLimitText ("동시에 20장까지...")
└── ConvertedFilesSection
    ├── SectionTitle ("변환된 파일 다운로드")
    ├── RetentionNotice ("최대 2주간 무료 다운로드")
    └── ResultTable (파일명, 상태, 다운로드)
```

### 1.5 마이페이지 (wrks.ai/ko/my-page)

**레이아웃**:
- 로그인한 계정 이메일 표시
- 현재 요금제 정보
- 모델별 사용량 테이블

**요금제 정보**:
- 플랜명: Starter (무료)
- 요금제 갱신일: 2026.03.14
- 매달 자동 갱신

**모델별 사용량 테이블**:

| 모델명 | 설명 |
|--------|------|
| OPENAI_CHAT_GPT4 | GPT-4 채팅 |
| OPENAI_CHAT_GPT3_5 | GPT-3.5 채팅 |
| OPENAI_ASSISTANT | OpenAI Assistant API |
| OPENAI_ASSISTANT_FILE | Assistant 파일 처리 |
| CLAUDE_DOC_CREATE_NEW | Claude 문서 신규 생성 |
| CLAUDE_DOC_GEN_PART | Claude 문서 부분 생성 |
| DEEPL_TRANSLATE_FILE | DeepL 파일 번역 |
| OPENAI_COMPLETION_OCR | OpenAI OCR 텍스트 추출 |
| OPENAI_DALL_E3 | DALL-E 3 이미지 생성 |

**테이블 컬럼**: 모델명, 현재 사용량 (토큰 사용), 이용 요금 (원)

**주의사항**: 매 3시간 또는 매달 제공되는 사용분은 매달 시간 또는 월에 사용하지 않으면 소진되며, 이월되지 않음

**UI 컴포넌트 구조**:
```
MyPage
├── GNB (공통)
├── AccountInfo
│   ├── ProfileIcon
│   └── EmailDisplay
├── SubscriptionCard
│   ├── PlanName ("Starter")
│   ├── PlanType ("무료")
│   └── RenewalDate ("2026.03.14")
├── UsageSection
│   ├── SectionTitle ("이달의 내 상세 사용 현황")
│   └── UsageTable
│       └── UsageRow (모델명, 토큰사용, 요금)
└── UsageNotice ("매 3시간 또는 매달...")
```

---

## 2. 아키텍처 설계

### 2.1 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                 H Chat User App (Next.js)                │
│                                                          │
│  ┌─────────┬──────────┬──────────┬─────────┬──────────┐ │
│  │  채팅    │ 문서번역  │ 문서작성  │ OCR    │ 마이페이지│ │
│  │ /chat   │/translate │  /docs   │  /ocr   │ /my-page │ │
│  └────┬────┴────┬─────┴────┬─────┴────┬────┴────┬─────┘ │
│       │         │          │          │         │        │
│  ┌────▼─────────▼──────────▼──────────▼─────────▼────┐  │
│  │              Shared Components                     │  │
│  │  GNB, Sidebar, FileUpload, StepProgress,          │  │
│  │  AssistantCard, EngineSelector, UsageTable         │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                  │
│  ┌────────────────────▼──────────────────────────────┐  │
│  │              Service Layer                         │  │
│  │  chatApi, translationApi, docsApi, ocrApi, userApi │  │
│  └────────────────────┬──────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTPS
        ┌───────────────▼───────────────┐
        │       wrks.ai Backend         │
        └───────────────────────────────┘
```

### 2.2 디렉토리 구조

```
packages/ui/src/user/
├── components/
│   ├── UserGNB.tsx              # 사용자 GNB (탭 메뉴 포함)
│   ├── ChatSidebar.tsx          # 채팅 사이드바 (대화 기록)
│   ├── AssistantCard.tsx        # AI 비서 카드
│   ├── AssistantGrid.tsx        # 비서 그리드 레이아웃
│   ├── CategoryFilter.tsx       # 카테고리 필터 탭
│   ├── ChatSearchBar.tsx        # 채팅 검색바
│   ├── EngineSelector.tsx       # 번역 엔진 선택
│   ├── FileUploadZone.tsx       # 파일 업로드 (드래그앤드롭)
│   ├── StepProgress.tsx         # 다단계 진행 표시
│   ├── ProjectTable.tsx         # 프로젝트 목록 테이블
│   ├── UsageTable.tsx           # 모델 사용량 테이블
│   └── SubscriptionCard.tsx     # 요금제 카드
├── pages/
│   ├── ChatPage.tsx             # 업무 비서 채팅
│   ├── TranslationPage.tsx      # 문서 번역
│   ├── DocsPage.tsx             # 문서 작성
│   ├── OCRPage.tsx              # 텍스트 추출
│   └── MyPage.tsx               # 마이페이지
├── services/
│   ├── types.ts                 # 타입 정의
│   └── mockData.ts              # Mock 데이터
└── index.ts                     # Export
```

### 2.3 앱 선택

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. HMG 앱 확장 | `apps/hmg`에 추가 | 기존 인프라 활용 | HMG 사이트와 성격 다름 |
| B. 별도 앱 생성 | `apps/user` 신규 | 독립적 배포, 분리 명확 | 설정 중복 |
| **C. Admin 앱 확장** (추천) | `apps/admin`에 사용자 데모 추가 | Admin에서 전체 기능 시연 가능 | Admin 앱 비대화 |

**추천: 옵션 B** — 별도 `apps/user` 앱 생성
- H Chat 사용자 기능은 Admin/HMG와 완전히 다른 UX
- 독립 배포 (Vercel)
- GNB/사이드바 패턴이 기존 앱과 다름

---

## 3. Phase별 구현 계획

### Phase 1: 공통 컴포넌트 + 타입

**1-1. 타입 정의** (`packages/ui/src/user/services/types.ts`)

```typescript
// AI 비서
export interface Assistant {
  id: string;
  name: string;
  icon: string;          // 이모지 또는 아이콘
  iconColor: string;
  model: string;         // "GPT-4o", "GPT-4.1 nano" 등
  description: string;
  category: AssistantCategory;
  isOfficial: boolean;   // 공식 비서 vs 커스텀
}

export type AssistantCategory =
  | '전체' | '채팅' | '업무' | '번역'
  | '정리' | '보고' | '그림' | '글쓰기';

// 번역
export type TranslationEngine = 'internal' | 'deepl';

export interface TranslationJob {
  id: string;
  fileName: string;
  engine: TranslationEngine;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  createdAt: string;
}

// 문서 작성
export interface DocProject {
  id: string;
  name: string;
  docType: 'HWP' | 'DOCX';
  lastModified: string;
  step: 1 | 2 | 3 | 4 | 5;
}

// OCR
export interface OCRJob {
  id: string;
  fileName: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
}

// 사용량
export interface ModelUsage {
  modelName: string;
  currentUsage: string;   // "0 토큰 사용"
  cost: number;           // 원
}

export interface Subscription {
  planName: string;       // "Starter"
  planType: string;       // "무료"
  renewalDate: string;    // "2026.03.14"
  email: string;
}

// 대화
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  assistantId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  assistantId: string;
  createdAt: string;
  updatedAt: string;
}
```

**1-2. UserGNB** (`packages/ui/src/user/components/UserGNB.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🟦 H Chat  │ 업무 비서  문서 번역  문서 작성  텍스트 추출 │     │
│             │                                             │     │
│             │                    user@email.com  [기업용]  [한국어]│
└─────────────────────────────────────────────────────────────────┘
```

- 로고 + 4개 탭 메뉴 (active 상태 밑줄)
- 우측: 사용자 이메일, 기업용 버전 가입 CTA, 언어 선택

**1-3. FileUploadZone** (`packages/ui/src/user/components/FileUploadZone.tsx`)
- 공통 드래그앤드롭 파일 업로드
- Props: `accept`, `maxFiles`, `maxSize`, `onUpload`
- 번역/OCR/문서작성에서 재사용

**1-4. StepProgress** (`packages/ui/src/user/components/StepProgress.tsx`)
- Props: `steps: {label: string}[]`, `currentStep: number`
- 번역(2단계), 문서작성(5단계), OCR(2단계)에서 재사용

---

### Phase 2: 업무 비서 채팅 페이지

**주요 컴포넌트**:

| 컴포넌트 | 기능 |
|----------|------|
| ChatSidebar | 대화 기록 리스트, 새 대화 버튼, 계정 메뉴 |
| ChatHero | 히어로 텍스트 ("실시간 검색, 사진 이해, 그림/차트 생성") |
| ChatSearchBar | 중앙 검색바 (입력 + 첨부 + 전송) |
| AssistantGrid | 비서 카드 그리드 (공식/커스텀 탭) |
| AssistantCard | 개별 비서 카드 (아이콘, 이름, 모델, 설명) |
| CategoryFilter | 카테고리 필터 탭 (8개 카테고리) |
| ChatInterface | 대화 인터페이스 (비서 선택 후 표시) |

**상태 관리**:
```typescript
const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
const [category, setCategory] = useState<AssistantCategory>('전체');
const [conversations, setConversations] = useState<Conversation[]>([]);
const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
```

---

### Phase 3: 문서 번역 페이지

**주요 기능**:
1. 엔진 선택 (자체 vs DeepL) — EngineSelector 컴포넌트
2. 파일 업로드 — FileUploadZone 재사용
3. 번역 진행 상태 표시
4. 결과 다운로드

**EngineSelector UI**:
```
┌──────────────────────────┐  ┌──────────────────────────┐
│ (●) 자체 번역 엔진        │  │ ( ) DeepL 번역 엔진       │
│                          │  │                          │
│ • 번역 품질: 최상          │  │ • 번역 품질: 최상          │
│ • 번역 속도: 빠름          │  │ • 번역 속도: 빠름          │
│ • 번역 가능 언어: 89개     │  │ • 번역 가능 언어: 32개     │
│ • 하루 5,000페이지/300MB  │  │ • 하루 30MB/100건         │
└──────────────────────────┘  └──────────────────────────┘
```

---

### Phase 4: 문서 작성 페이지

**5단계 워크플로우**:

| 단계 | 컴포넌트 | 설명 |
|------|----------|------|
| 1 | ProjectSelector | 새 프로젝트 or 기존 선택 |
| 2 | FileTypeSelector | HWP/DOCX 선택 |
| 3 | ContextInput | 배경지식 텍스트 입력 |
| 4 | OutlineEditor | AI 생성 목차 편집 + 내용 작성 |
| 5 | FileGenerator | 최종 파일 생성 + 다운로드 |

**프로젝트 테이블**: ProjectTable 컴포넌트
- 빈 상태: "아직 만든 프로젝트가 없어요. '새 프로젝트 시작'을 눌러 AI와 함께 첫 문서를 작성해보세요!"

---

### Phase 5: 텍스트 추출(OCR) 페이지

**주요 기능**:
1. 이미지 업로드 (최대 20장, 드래그앤드롭)
2. 변환 진행 상태 표시
3. 변환된 파일 다운로드 (2주간 보관)

**업로드 제한 로직**:
```typescript
const MAX_TEXT_EXTRACT = 5;    // 텍스트 추출 최대
const MAX_TRANSLATE = 20;       // 번역 최대
const RETENTION_DAYS = 14;      // 파일 보관 기간

function validateUpload(files: File[], mode: 'extract' | 'translate'): ValidationResult {
  const maxFiles = mode === 'extract' ? MAX_TEXT_EXTRACT : MAX_TRANSLATE;
  if (files.length > maxFiles) {
    return { valid: false, error: `최대 ${maxFiles}장까지 업로드 가능합니다.` };
  }
  return { valid: true };
}
```

---

### Phase 6: 마이페이지

**주요 컴포넌트**:

| 컴포넌트 | 기능 |
|----------|------|
| SubscriptionCard | 요금제 이름, 유형, 갱신일 |
| UsageTable | 모델별 사용량 (토큰, 요금) |
| UsageNotice | 이월 불가 안내 |

**요금제 모델**:
```typescript
interface PricingPlan {
  name: string;        // "Starter", "Pro", "Enterprise"
  type: string;        // "무료", "유료"
  monthlyPrice: number;
  features: string[];
  models: {
    name: string;
    monthlyLimit: number;   // 토큰 제한 (0 = 무제한)
    pricePerToken: number;
  }[];
}
```

**9개 모델 사용량 추적**:

| 모델 ID | 용도 |
|---------|------|
| OPENAI_CHAT_GPT4 | 채팅 (GPT-4) |
| OPENAI_CHAT_GPT3_5 | 채팅 (GPT-3.5) |
| OPENAI_ASSISTANT | Assistant API |
| OPENAI_ASSISTANT_FILE | 파일 처리 |
| CLAUDE_DOC_CREATE_NEW | 문서 신규 생성 |
| CLAUDE_DOC_GEN_PART | 문서 부분 생성 |
| DEEPL_TRANSLATE_FILE | 파일 번역 |
| OPENAI_COMPLETION_OCR | OCR 추출 |
| OPENAI_DALL_E3 | 이미지 생성 |

---

## 4. Mock 데이터

```typescript
export const mockAssistants: Assistant[] = [
  { id: 'a1', name: '신중한 톡정이', icon: '❤️', iconColor: '#ef4444', model: 'GPT-4o', description: '대화, 코딩, 검색, 그림 생성, 사진 인식', category: '채팅', isOfficial: true },
  { id: 'a2', name: '티커타카 장인', icon: '🟢', iconColor: '#22c55e', model: 'GPT-4.1 nano', description: '대화, 검색, 그림 생성, 이미지 인식', category: '채팅', isOfficial: true },
  { id: 'a3', name: '문서 파일 검토', icon: '📋', iconColor: '#6366f1', model: '', description: 'PDF 등 문서 올리고 내용 질문, 요약', category: '업무', isOfficial: true },
  { id: 'a4', name: '문서 번역', icon: '📄', iconColor: '#6366f1', model: '', description: 'PDF 등 문서 형식 유지한채 번역', category: '번역', isOfficial: true },
  { id: 'a5', name: '파워포인트 기획', icon: '⌨️', iconColor: '#8b5cf6', model: '', description: '시안 내용 주면 PPT 구성 제안', category: '업무', isOfficial: true },
  { id: 'a6', name: '본문 번역', icon: '🌐', iconColor: '#14b8a6', model: '', description: '본문 추가 원하는 언어로 번역', category: '번역', isOfficial: true },
  { id: 'a7', name: '데이터 분석', icon: '📊', iconColor: '#f59e0b', model: '', description: '엑셀/CSV 올리고 분석, 차트 생성', category: '정리', isOfficial: true },
  { id: 'a8', name: '이메일 작성', icon: '✉️', iconColor: '#ec4899', model: '', description: '내용만 주고 전문적인 이메일 작성', category: '글쓰기', isOfficial: true },
];

export const mockModelUsage: ModelUsage[] = [
  { modelName: 'OPENAI_CHAT_GPT4', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'OPENAI_CHAT_GPT3_5', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'OPENAI_ASSISTANT', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'OPENAI_ASSISTANT_FILE', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'CLAUDE_DOC_CREATE_NEW', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'CLAUDE_DOC_GEN_PART', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'DEEPL_TRANSLATE_FILE', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'OPENAI_COMPLETION_OCR', currentUsage: '0 토큰 사용', cost: 0 },
  { modelName: 'OPENAI_DALL_E3', currentUsage: '0 토큰 사용', cost: 0 },
];

export const mockSubscription: Subscription = {
  planName: 'Starter',
  planType: '무료',
  renewalDate: '2026.03.14',
  email: 'wooggi@gmail.com',
};
```

---

## 5. 수정 파일 목록

| 파일 | 변경 | Phase |
|------|------|-------|
| `packages/ui/src/user/services/types.ts` | 신규 — 타입 정의 | 1 |
| `packages/ui/src/user/services/mockData.ts` | 신규 — Mock 데이터 | 1 |
| `packages/ui/src/user/components/UserGNB.tsx` | 신규 — 사용자 GNB | 1 |
| `packages/ui/src/user/components/FileUploadZone.tsx` | 신규 — 파일 업로드 | 1 |
| `packages/ui/src/user/components/StepProgress.tsx` | 신규 — 단계 진행 | 1 |
| `packages/ui/src/user/components/ChatSidebar.tsx` | 신규 — 채팅 사이드바 | 2 |
| `packages/ui/src/user/components/AssistantCard.tsx` | 신규 — 비서 카드 | 2 |
| `packages/ui/src/user/components/AssistantGrid.tsx` | 신규 — 비서 그리드 | 2 |
| `packages/ui/src/user/components/CategoryFilter.tsx` | 신규 — 카테고리 필터 | 2 |
| `packages/ui/src/user/components/ChatSearchBar.tsx` | 신규 — 검색바 | 2 |
| `packages/ui/src/user/pages/ChatPage.tsx` | 신규 — 채팅 페이지 | 2 |
| `packages/ui/src/user/components/EngineSelector.tsx` | 신규 — 번역 엔진 | 3 |
| `packages/ui/src/user/pages/TranslationPage.tsx` | 신규 — 번역 페이지 | 3 |
| `packages/ui/src/user/components/ProjectTable.tsx` | 신규 — 프로젝트 테이블 | 4 |
| `packages/ui/src/user/pages/DocsPage.tsx` | 신규 — 문서 작성 | 4 |
| `packages/ui/src/user/pages/OCRPage.tsx` | 신규 — OCR 페이지 | 5 |
| `packages/ui/src/user/components/SubscriptionCard.tsx` | 신규 — 구독 카드 | 6 |
| `packages/ui/src/user/components/UsageTable.tsx` | 신규 — 사용량 테이블 | 6 |
| `packages/ui/src/user/pages/MyPage.tsx` | 신규 — 마이페이지 | 6 |
| `packages/ui/src/user/index.ts` | 신규 — Export | 1 |

---

## 6. UI 스타일 가이드

기존 스크린샷에서 추출한 디자인 토큰:

### 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--user-primary` | `#4F6EF7` | GNB 배경, 주요 버튼 |
| `--user-primary-light` | `#EBF0FF` | 히어로 배경, 비서 카드 호버 |
| `--user-accent` | `#10B981` | CTA 버튼 ("기업용 버전 가입") |
| `--user-bg` | `#FFFFFF` | 페이지 배경 |
| `--user-bg-section` | `#F8FAFC` | 섹션 배경 |
| `--user-border` | `#E2E8F0` | 카드 테두리 |
| `--user-text-primary` | `#1E293B` | 주요 텍스트 |
| `--user-text-secondary` | `#64748B` | 보조 텍스트 |
| `--user-text-muted` | `#94A3B8` | 비활성 텍스트 |

### 타이포그래피

| 요소 | 크기 | 두께 |
|------|------|------|
| GNB 로고 | 20px | Bold |
| GNB 탭 | 15px | Medium (active), Regular (inactive) |
| 히어로 타이틀 | 28px | Bold |
| 섹션 타이틀 | 20px | SemiBold |
| 비서 카드 이름 | 15px | SemiBold |
| 비서 카드 설명 | 13px | Regular |
| 본문 | 14px | Regular |

### GNB 패턴

```
배경: #4F6EF7 (파란색 그라데이션)
높이: 56px
로고: 흰색 "웍스AI" → "H Chat"으로 변경
탭: 흰색 텍스트, active 시 밑줄
우측: 이메일 + CTA 버튼(녹색) + 언어 선택
```

---

## 7. 검증 계획

```bash
# 앱 생성 후
npm run dev:user      # localhost:3003 에서 확인

# 빌드 검증
npm run build:user    # 정적 빌드 성공 확인
```

### 테스트 체크리스트

- [ ] GNB 4개 탭 네비게이션 동작
- [ ] 채팅 사이드바 대화 기록 렌더링
- [ ] AI 비서 8종 카드 표시
- [ ] 카테고리 필터 동작 (8개 카테고리)
- [ ] 비서 탭 전환 (공식/커스텀)
- [ ] 번역 엔진 선택 UI
- [ ] 파일 업로드 드래그앤드롭
- [ ] 문서 작성 5단계 진행바
- [ ] OCR 이미지 업로드 + 결과 테이블
- [ ] 마이페이지 요금제 + 사용량 테이블
- [ ] 모바일 반응형
- [ ] 다크모드 지원
