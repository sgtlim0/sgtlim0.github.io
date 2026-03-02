# LLM-Router UI 디자인 명세서

> 작성일: 2026-03-03
> 버전: 1.0
> 참조: LLM_ROUTER_IMPLEMENTATION_PLAN.md

---

## 목차

1. [디자인 시스템](#1-디자인-시스템)
2. [랜딩 페이지](#2-랜딩-페이지)
3. [모델 가격표 페이지](#3-모델-가격표-페이지)
4. [문서 페이지](#4-문서-페이지)
5. [플레이그라운드](#5-플레이그라운드)
6. [대시보드](#6-대시보드)
7. [API 키 관리](#7-api-키-관리)
8. [조직 설정](#8-조직-설정)
9. [결제 페이지](#9-결제-페이지)
10. [인증 페이지](#10-인증-페이지)

---

## 1. 디자인 시스템

### 1.1 컬러 팔레트

#### 브랜드 컬러

```css
/* packages/tokens/styles/tokens.css 에 추가 */

/* LLM-Router Primary */
--br-primary-50: #eff6ff;
--br-primary-100: #dbeafe;
--br-primary-200: #bfdbfe;
--br-primary-300: #93c5fd;
--br-primary-400: #60a5fa;
--br-primary-500: #3b82f6;  /* 메인 브랜드 */
--br-primary-600: #2563eb;
--br-primary-700: #1d4ed8;
--br-primary-800: #1e40af;
--br-primary-900: #1e3a8a;

/* LLM-Router Accent (성공/할인) */
--br-accent-50: #f0fdf4;
--br-accent-100: #dcfce7;
--br-accent-500: #22c55e;
--br-accent-600: #16a34a;

/* 경고/에러 */
--br-warning-500: #f59e0b;
--br-error-500: #ef4444;

/* 중립 (라이트 모드) */
--br-gray-50: #f9fafb;
--br-gray-100: #f3f4f6;
--br-gray-200: #e5e7eb;
--br-gray-300: #d1d5db;
--br-gray-400: #9ca3af;
--br-gray-500: #6b7280;
--br-gray-600: #4b5563;
--br-gray-700: #374151;
--br-gray-800: #1f2937;
--br-gray-900: #111827;

/* 다크 모드 */
.dark {
  --br-bg-base: #0a0a0a;
  --br-bg-elevated: #171717;
  --br-bg-card: #262626;
  --br-border: #404040;
  --br-text-primary: #fafafa;
  --br-text-secondary: #a3a3a3;
}

/* 라이트 모드 */
:root {
  --br-bg-base: #ffffff;
  --br-bg-elevated: #f9fafb;
  --br-bg-card: #ffffff;
  --br-border: #e5e7eb;
  --br-text-primary: #111827;
  --br-text-secondary: #6b7280;
}
```

#### 프로바이더 브랜드 컬러

```css
--provider-openai: #10a37f;
--provider-anthropic: #d4a373;
--provider-google: #4285f4;
--provider-xai: #000000;
--provider-perplexity: #4a5568;
--provider-upstage: #7c3aed;
--provider-lg: #a50034;
--provider-zai: #1890ff;
--provider-deepseek: #0066cc;
```

### 1.2 타이포그래피

```css
/* Font Family */
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 1.3 간격 시스템

```css
/* Spacing Scale (Tailwind 호환) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 1.4 레이아웃 그리드

```css
/* Container Max Width */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Breakpoints */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### 1.5 컴포넌트 스타일 토큰

```css
/* Border Radius */
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Transitions */
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### 1.6 반응형 브레이크포인트

| 디바이스 | 브레이크포인트 | 컨테이너 | 주요 레이아웃 변경 |
|---------|--------------|---------|------------------|
| **Mobile** | < 640px | Full width | 1컬럼, 햄버거 메뉴, 카드 뷰 |
| **Tablet** | 640px - 1024px | 640px | 2컬럼, 축소된 사이드바 |
| **Desktop** | 1024px - 1280px | 1024px | 3컬럼, 전체 사이드바 |
| **Large** | > 1280px | 1280px | 여유로운 간격 |

---

## 2. 랜딩 페이지 (`/`)

### 2.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [모델] [문서] [가격]    [로그인] [가입]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         HERO SECTION                             │
│                                                                  │
│            기업용 LLM 라우터, 수수료 0%                           │
│     OpenAI, Anthropic, Google 등 86개 모델을 하나의 API로          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ from openai import OpenAI                        │           │
│  │                                                  │           │
│  │ client = OpenAI(                                │           │
│  │   base_url="https://api.llm-router.ai/v1",      │           │
│  │   api_key="sk-br-v1-..."                       │           │
│  │ )                                               │           │
│  │                                                  │           │
│  │ response = client.chat.completions.create(      │           │
│  │   model="openai/gpt-5.1",                      │           │
│  │   messages=[{"role": "user", ...}]             │           │
│  │ )                                               │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│        [무료로 시작하기] →        [개발 문서 보기]                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      주요 기능 (4 CARDS)                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 🔒 보안   │  │ 💳 과금   │  │ ⚡ 성능   │  │ 🔌 호환   │        │
│  │          │  │          │  │          │  │          │        │
│  │ PII 마스킹│  │ 선불/후불 │  │ 99.9%    │  │ OpenAI   │        │
│  │ 금지어    │  │ KRW 원화 │  │ 업타임   │  │ SDK      │        │
│  │ 모델 차단 │  │ 조직/키별│  │ 멀티 리전│  │ 그대로   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   지원 프로바이더 (로고 스트립)                    │
│                                                                  │
│   [OpenAI] [Anthropic] [Google] [xAI] [Perplexity] ...          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        가격 비교 미리보기                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 모델        입력(M토큰)  출력(M토큰)  총비용(10K토큰)│         │
│  ├────────────────────────────────────────────────────┤         │
│  │ GPT-5 Nano      72원      578원        65원       │         │
│  │ Gemini 2.5     434원    3,613원       404원       │         │
│  │ GPT-5.1      1,806원   14,450원     1,626원       │         │
│  │ Claude Opus  7,225원   36,125원     4,335원       │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│                [전체 가격표 보기] →                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CTA (Call to Action)                          │
│                                                                  │
│              지금 시작하고 $10 크레딧 받기                         │
│                                                                  │
│                    [무료 가입하기] →                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FOOTER                                                          │
│                                                                  │
│  제품           개발자          회사          법률                 │
│  모델 가격표     API 문서        소개          이용약관             │
│  플레이그라운드   SDK            채용          개인정보처리방침      │
│  대시보드       가이드          블로그                             │
│                                                                  │
│  © 2026 LLM-Router. Made in Korea.                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 컴포넌트 명세

#### 2.2.1 네비게이션 바

```typescript
// components/Navigation.tsx
interface NavigationProps {
  transparent?: boolean; // Hero 위에서는 투명
}

<nav className="sticky top-0 z-50 bg-br-bg-base/80 backdrop-blur-md border-b border-br-border">
  <div className="container-xl mx-auto px-4 h-16 flex items-center justify-between">
    <div className="flex items-center gap-8">
      <Logo />
      <NavLinks /> {/* 모델, 문서, 가격, 플레이그라운드 */}
    </div>
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <Button variant="ghost">로그인</Button>
      <Button variant="primary">무료 가입</Button>
    </div>
  </div>
</nav>
```

**스타일:**
- 높이: 64px (h-16)
- 배경: 반투명 + 블러 (backdrop-blur-md)
- 하단 테두리: 1px solid var(--br-border)
- 고정: sticky top-0
- z-index: 50

#### 2.2.2 Hero 섹션

```typescript
// components/HeroSection.tsx

<section className="relative pt-20 pb-32 overflow-hidden">
  {/* 배경 그라데이션 */}
  <div className="absolute inset-0 bg-gradient-to-br from-br-primary-50 to-br-accent-50 dark:from-br-primary-950 dark:to-br-accent-950 opacity-50" />

  <div className="container-xl mx-auto px-4 relative z-10">
    {/* 헤드라인 */}
    <h1 className="text-5xl font-bold text-center mb-6 tracking-tight">
      기업용 LLM 라우터, <span className="text-br-primary-600">수수료 0%</span>
    </h1>

    {/* 서브헤드 */}
    <p className="text-xl text-br-text-secondary text-center mb-12 max-w-2xl mx-auto">
      OpenAI, Anthropic, Google 등 86개 모델을 하나의 API로
    </p>

    {/* 코드 블록 */}
    <CodeBlock
      language="python"
      code={quickStartCode}
      className="max-w-3xl mx-auto mb-8"
    />

    {/* CTA 버튼 */}
    <div className="flex items-center justify-center gap-4">
      <Button size="lg" variant="primary" icon={<ArrowRight />}>
        무료로 시작하기
      </Button>
      <Button size="lg" variant="outline">
        개발 문서 보기
      </Button>
    </div>
  </div>
</section>
```

**스타일:**
- 상단 패딩: 80px (pt-20)
- 하단 패딩: 128px (pb-32)
- 헤드라인: 48px (text-5xl), 굵게 (font-bold), 좁은 자간 (tracking-tight)
- 서브헤드: 20px (text-xl), 보조 색상
- 최대 너비: 768px (컨텐츠), 1280px (컨테이너)

#### 2.2.3 기능 카드

```typescript
// components/FeatureCard.tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 container-xl mx-auto px-4 py-16">
  {features.map(feature => (
    <div className="bg-br-bg-card border border-br-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{feature.icon}</div>
      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
      <ul className="space-y-2">
        {feature.items.map(item => (
          <li className="text-sm text-br-text-secondary flex items-center gap-2">
            <Check className="w-4 h-4 text-br-accent-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

**스타일:**
- 그리드: 모바일 1열, 태블릿 2열, 데스크탑 4열
- 카드 패딩: 24px (p-6)
- 테두리 반경: 12px (rounded-xl)
- 호버: 그림자 확대 (hover:shadow-lg)
- 아이콘 크기: 36px (text-4xl)

#### 2.2.4 프로바이더 로고 스트립

```typescript
// components/ProviderLogos.tsx

<div className="py-12 bg-br-bg-elevated">
  <div className="container-xl mx-auto px-4">
    <p className="text-center text-sm text-br-text-secondary mb-8">
      지원 프로바이더
    </p>
    <div className="flex items-center justify-center gap-12 flex-wrap grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
      {providers.map(provider => (
        <img
          src={`/logos/${provider}.svg`}
          alt={provider}
          className="h-8"
        />
      ))}
    </div>
  </div>
</div>
```

**스타일:**
- 배경: elevated (약간 어두운 회색)
- 로고 높이: 32px (h-8)
- 초기 상태: 흑백 + 60% 투명도
- 호버: 컬러 + 100% 불투명

### 2.3 반응형 동작

#### 모바일 (< 640px)
- 네비게이션: 햄버거 메뉴로 전환
- Hero 헤드라인: text-3xl (30px)로 축소
- 기능 카드: 1열 스택
- 코드 블록: 가로 스크롤 허용

#### 태블릿 (640px - 1024px)
- 기능 카드: 2열 그리드
- Hero 헤드라인: text-4xl (36px)

#### 데스크탑 (> 1024px)
- 전체 레이아웃 유지
- 컨테이너 최대 너비: 1280px

---

## 3. 모델 가격표 페이지 (`/models`)

### 3.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [모델] [문서] [가격]    [로그인] [가입]        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        통합 모델 가격표                                   │
│                                                                          │
│  LLM-Router는 표기된 모델 가격 외에 수수료를 부과하지 않습니다              │
│                                                                          │
│  총 86개 모델 | 마지막 업데이트: 2026.03.03 | 환율: 1 USD = ₩1,445       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ 🔍 모델 검색...                                         │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                          │
│  [전체] [Anthropic] [OpenAI] [Google] [xAI] [Perplexity] [기타]         │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ 제공자    │ 모델명           │ 모델 ID          │ 최대    │ 최대   │ 입력 가격 │  출력 가격    │
│          │                 │                 │ 입력    │ 출력   │ (KRW/M)  │  (KRW/M)     │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ 🔵 Anthropic│ Claude Opus 4.6│ bedrock/claude- │ 1M      │ 128K   │ 7,225원  │  36,125원    │
│ (Bedrock)│ [10% OFF]       │ opus-4.6        │         │        │ >200K    │  >200K       │
│          │                 │                 │         │        │ 14,450원 │  54,188원    │
│          │                 │                 │         │        │ ⬇6,503원 │  ⬇32,513원   │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ 🔵 Anthropic│ Claude Sonnet  │ anthropic/      │ 1M      │ 128K   │ 1,806원  │  9,031원     │
│          │ 4.5             │ claude-sonnet-  │         │        │ >200K    │  >200K       │
│          │                 │ 4.5             │         │        │ 3,613원  │  18,063원    │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ ⚫ OpenAI │ GPT-5.1         │ openai/gpt-5.1  │ 1M      │ 128K   │ 1,806원  │  14,450원    │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ 🔵 Google│ Gemini 3.1 Pro  │ gemini/gemini-  │ 1M      │ 128K   │ 1,445원  │  5,780원     │
│          │                 │ 3.1-pro         │         │        │          │              │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ 🟣 Upstage│ Solar Pro 3 Beta│ upstage/solar-  │ 200K    │ 32K    │ 0원      │  0원         │
│          │ [100% OFF]      │ pro-3-beta      │         │        │          │              │
├───────────┼─────────────────┼─────────────────┼─────────┼────────┼──────────┼──────────────┤
│ ...      │                 │                 │         │        │          │              │
└───────────┴─────────────────┴─────────────────┴─────────┴────────┴──────────┴──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      이미지 생성 모델 (3개)                               │
│                                                                          │
│ 제공자    │ 모델명          │ 텍스트 입력  │ 이미지 출력                   │
├───────────┼─────────────────┼─────────────┼──────────────────────────────┤
│ 🔵 Google│ Gemini 3.1 Flash│ 434원/M토큰  │ 217원/이미지 (1024x1024)      │
│          │ Image           │             │ 108원/이미지 (512x512)        │
└───────────┴─────────────────┴─────────────┴──────────────────────────────┘
```

### 3.2 컴포넌트 명세

#### 3.2.1 페이지 헤더

```typescript
// components/ModelsPageHeader.tsx

<div className="bg-br-bg-elevated border-b border-br-border py-12">
  <div className="container-xl mx-auto px-4">
    <h1 className="text-4xl font-bold mb-4">통합 모델 가격표</h1>
    <p className="text-lg text-br-text-secondary mb-6">
      LLM-Router는 표기된 모델 가격 외에 수수료를 부과하지 않습니다
    </p>
    <div className="flex items-center gap-6 text-sm text-br-text-secondary">
      <span className="flex items-center gap-2">
        <Database className="w-4 h-4" />
        총 {modelCount}개 모델
      </span>
      <span>|</span>
      <span>마지막 업데이트: {lastUpdated}</span>
      <span>|</span>
      <span className="flex items-center gap-2">
        환율: 1 USD = ₩{exchangeRate.toLocaleString()}
      </span>
    </div>
  </div>
</div>
```

**스타일:**
- 배경: elevated (밝은 회색)
- 패딩: 48px 상하 (py-12)
- 헤드라인: 36px (text-4xl), 굵게
- 메타 정보: 14px (text-sm), 보조 색상

#### 3.2.2 검색 및 필터

```typescript
// components/ModelFilters.tsx

<div className="bg-br-bg-base border-b border-br-border py-6">
  <div className="container-xl mx-auto px-4">
    {/* 검색 바 */}
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-br-text-secondary" />
        <input
          type="text"
          placeholder="모델 검색... (예: gpt-5, claude, gemini)"
          className="w-full pl-10 pr-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
        />
      </div>
    </div>

    {/* 프로바이더 필터 탭 */}
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {providers.map(provider => (
        <button
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            active
              ? "bg-br-primary-500 text-white"
              : "bg-br-bg-card border border-br-border hover:bg-br-bg-elevated"
          )}
        >
          {provider.name}
          {provider.count && (
            <span className="ml-2 text-xs opacity-75">({provider.count})</span>
          )}
        </button>
      ))}
    </div>
  </div>
</div>
```

**스타일:**
- 검색 입력: 높이 48px, 좌측 패딩 40px (아이콘 공간)
- 필터 탭: 높이 40px, 최소 너비 없음 (whitespace-nowrap)
- 활성 탭: 브랜드 컬러 배경, 흰색 텍스트
- 비활성 탭: 카드 배경, 테두리, 호버시 elevated 배경

#### 3.2.3 모델 테이블 (데스크탑)

```typescript
// components/ModelTable.tsx

<div className="container-xl mx-auto px-4 py-8">
  <table className="w-full border-collapse">
    <thead className="bg-br-bg-elevated sticky top-16 z-10">
      <tr>
        <th className="text-left p-4 font-semibold text-sm">
          제공자
        </th>
        <th className="text-left p-4 font-semibold text-sm">
          모델명
          <button className="ml-2"><ArrowUpDown className="w-4 h-4" /></button>
        </th>
        <th className="text-left p-4 font-semibold text-sm">
          모델 ID
        </th>
        <th className="text-right p-4 font-semibold text-sm">
          최대 입력
        </th>
        <th className="text-right p-4 font-semibold text-sm">
          최대 출력
        </th>
        <th className="text-right p-4 font-semibold text-sm">
          입력 가격 (KRW/M)
          <button className="ml-2"><ArrowUpDown className="w-4 h-4" /></button>
        </th>
        <th className="text-right p-4 font-semibold text-sm">
          출력 가격 (KRW/M)
          <button className="ml-2"><ArrowUpDown className="w-4 h-4" /></button>
        </th>
      </tr>
    </thead>
    <tbody>
      {models.map(model => (
        <tr className="border-t border-br-border hover:bg-br-bg-elevated transition-colors">
          <td className="p-4">
            <ProviderBadge provider={model.provider} />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{model.name}</span>
              {model.discount > 0 && (
                <DiscountBadge percent={model.discount} />
              )}
            </div>
          </td>
          <td className="p-4">
            <code className="text-xs bg-br-bg-elevated px-2 py-1 rounded">
              {model.id}
            </code>
          </td>
          <td className="text-right p-4 text-sm">
            {formatContextLength(model.contextLength)}
          </td>
          <td className="text-right p-4 text-sm">
            {formatTokens(model.maxOutputTokens)}
          </td>
          <td className="text-right p-4">
            <PriceCell
              price={model.inputPrice}
              extendedPrice={model.inputPriceExtended}
              discount={model.discount}
            />
          </td>
          <td className="text-right p-4">
            <PriceCell
              price={model.outputPrice}
              extendedPrice={model.outputPriceExtended}
              discount={model.discount}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**스타일:**
- 테이블 헤더: sticky (스크롤시 고정), 배경 elevated
- 행 높이: 최소 64px
- 셀 패딩: 16px (p-4)
- 호버: 배경 elevated로 변경
- 정렬: 텍스트는 왼쪽, 숫자는 오른쪽

#### 3.2.4 프로바이더 배지

```typescript
// components/ProviderBadge.tsx

<div className="flex items-center gap-2">
  <div
    className="w-6 h-6 rounded-full flex items-center justify-center"
    style={{ backgroundColor: providerColors[provider] }}
  >
    {providerIcons[provider]}
  </div>
  <span className="text-sm font-medium">{providerNames[provider]}</span>
</div>
```

**스타일:**
- 아이콘 크기: 24x24px
- 아이콘 배경: 프로바이더 브랜드 컬러
- 폰트 크기: 14px (text-sm)

#### 3.2.5 할인 배지

```typescript
// components/DiscountBadge.tsx

<span
  className={cn(
    "px-2 py-0.5 rounded text-xs font-semibold",
    percent === 100
      ? "bg-br-accent-100 text-br-accent-700 dark:bg-br-accent-900 dark:text-br-accent-300"
      : "bg-br-warning-100 text-br-warning-700 dark:bg-br-warning-900 dark:text-br-warning-300"
  )}
>
  {percent}% OFF
</span>
```

**스타일:**
- 100% 할인: 녹색 배경 (accent)
- 부분 할인: 주황색 배경 (warning)
- 폰트 크기: 12px (text-xs)
- 패딩: 상하 2px, 좌우 8px

#### 3.2.6 가격 셀

```typescript
// components/PriceCell.tsx

<div className="text-right">
  {/* 기본 가격 */}
  <div className="flex items-center justify-end gap-2">
    {discount > 0 && (
      <span className="text-xs text-br-text-secondary line-through">
        {formatPrice(price)}원
      </span>
    )}
    <span className={cn(
      "font-semibold",
      discount > 0 && "text-br-accent-600"
    )}>
      {formatPrice(discountedPrice)}원
    </span>
  </div>

  {/* 확장 가격 (>200K) */}
  {extendedPrice && (
    <div className="text-xs text-br-text-secondary mt-1">
      &gt;200K: {formatPrice(discountedExtendedPrice)}원
    </div>
  )}
</div>
```

**스타일:**
- 원래 가격: 취소선, 보조 색상, 12px
- 할인 가격: 강조 (accent), 굵게
- 확장 가격: 보조 색상, 12px, 상단 마진 4px

### 3.3 모바일 레이아웃 (< 640px)

```
┌──────────────────────────────────┐
│ 🔍 모델 검색...                  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ [전체] [Anthropic] [OpenAI] ...  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 🔵 Anthropic (Bedrock)           │
│                                   │
│ Claude Opus 4.6      [10% OFF]    │
│ bedrock/claude-opus-4.6           │
│                                   │
│ 최대 입력: 1M │ 최대 출력: 128K    │
│                                   │
│ 입력: ₩7,225 → ₩6,503 /M토큰      │
│ 출력: ₩36,125 → ₩32,513 /M토큰    │
│                                   │
│ >200K 가격 보기 ▼                 │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 🔵 Anthropic                     │
│ Claude Sonnet 4.5                │
│ ...                              │
└──────────────────────────────────┘
```

**모바일 카드 스타일:**
- 전체 너비 카드
- 패딩: 16px (p-4)
- 테두리: 1px solid border
- 마진: 하단 12px (mb-3)
- 확장 가능: 아코디언 패턴

---

## 4. 문서 페이지 (`/docs/*`)

### 4.1 와이어프레임

```
┌───────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [모델] [문서] [가격]    [로그인] [가입]    │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────────────────────────────────┬──────────────┐
│ SIDEBAR     │  MAIN CONTENT                           │  TOC         │
│             │                                         │              │
│ 시작하기     │  Chat Completions API                   │ 이 페이지     │
│ ├ 개요      │                                         │ ├ 개요       │
│ └ 인증      │  OpenAI 호환 Chat Completions 엔드포인트 │ ├ 엔드포인트  │
│             │                                         │ ├ 요청 파라미터│
│ API 레퍼런스 │  엔드포인트 개요                         │ ├ 응답 형식   │
│ ├ Chat...   │  ┌────────────────────────────────┐     │ └ 예제       │
│ ├ Responses │  │ POST /v1/chat/completions      │     │              │
│ ├ Messages  │  └────────────────────────────────┘     │              │
│ ├ 모델 목록  │                                         │              │
│ └ 미디어    │  요청 파라미터                           │              │
│   └ 이미지   │                                         │              │
│             │  ┌─[cURL]─[Python]─[JavaScript]──┐      │              │
│ 가이드      │  │ curl https://api.llm-router...  │      │              │
│ ├ 외부 연동  │  │   -H "Authorization: Bearer..."│      │              │
│ └ 에러 처리  │  │   -H "Content-Type: ..."       │      │              │
│             │  │   -d '{                        │      │              │
│ [다크모드]   │  │     "model": "openai/gpt-5.1", │      │              │
│             │  │     "messages": [...]          │      │              │
│             │  │   }'                           │      │              │
│             │  └────────────────────────────────┘      │              │
│             │  [복사하기]                             │              │
│             │                                         │              │
│             │  파라미터 테이블                         │              │
│             │  ┌──────────┬──────┬──────┬────────┐    │              │
│             │  │ 이름     │ 타입  │ 필수 │ 설명    │    │              │
│             │  ├──────────┼──────┼──────┼────────┤    │              │
│             │  │ model    │string│ ✓   │ 모델 ID │    │              │
│             │  │ messages │array │ ✓   │ 메시지  │    │              │
│             │  │ stream   │bool  │     │ 스트리밍│    │              │
│             │  └──────────┴──────┴──────┴────────┘    │              │
│             │                                         │              │
│             │  응답 형식                               │              │
│             │  ┌────────────────────────────────┐     │              │
│             │  │ interface ChatCompletion {    │      │              │
│             │  │   id: string;                 │      │              │
│             │  │   choices: Choice[];          │      │              │
│             │  │   usage: {                    │      │              │
│             │  │     input_tokens: number;     │      │              │
│             │  │     output_tokens: number;    │      │              │
│             │  │     cost: number; // KRW      │      │              │
│             │  │   }                           │      │              │
│             │  │ }                             │      │              │
│             │  └────────────────────────────────┘     │              │
│             │                                         │              │
│             │  예제 응답                               │              │
│             │  ┌────────────────────────────────┐     │              │
│             │  │ {                             │      │              │
│             │  │   "id": "chatcmpl-...",       │      │              │
│             │  │   "choices": [{              │      │              │
│             │  │     "message": {...}         │      │              │
│             │  │   }],                        │      │              │
│             │  │   "usage": {                 │      │              │
│             │  │     "cost": 45.23           │      │              │
│             │  │   }                          │      │              │
│             │  │ }                            │      │              │
│             │  └────────────────────────────────┘     │              │
│             │                                         │              │
│             │  [이전: 인증] [다음: Responses API] →    │              │
└─────────────┴─────────────────────────────────────────┴──────────────┘
```

### 4.2 컴포넌트 명세

#### 4.2.1 3컬럼 레이아웃

```typescript
// app/docs/[[...slug]]/layout.tsx

<div className="min-h-screen bg-br-bg-base">
  <Navigation />

  <div className="container-2xl mx-auto px-4">
    <div className="flex gap-8 py-8">
      {/* 좌측 사이드바 */}
      <aside className="w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
        <DocsSidebar />
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 min-w-0 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {children}
        </article>
      </main>

      {/* 우측 TOC */}
      <aside className="w-56 flex-shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto hidden xl:block">
        <TableOfContents />
      </aside>
    </div>
  </div>
</div>
```

**스타일:**
- 좌측 사이드바: 256px 고정 너비 (w-64)
- 메인 컨텐츠: 최대 896px (max-w-4xl), 유연한 너비
- 우측 TOC: 224px 고정 너비 (w-56), XL 이상에서만 표시
- 사이드바: sticky + 스크롤 가능
- 컬럼 간격: 32px (gap-8)

#### 4.2.2 문서 사이드바

```typescript
// components/DocsSidebar.tsx

<nav className="space-y-1">
  {sections.map(section => (
    <div key={section.title}>
      <h3 className="px-3 py-2 text-xs font-semibold text-br-text-secondary uppercase tracking-wider">
        {section.title}
      </h3>
      <ul className="space-y-0.5">
        {section.items.map(item => (
          <li>
            <Link
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-br-primary-100 text-br-primary-700 font-medium dark:bg-br-primary-900 dark:text-br-primary-300"
                  : "text-br-text-secondary hover:bg-br-bg-elevated hover:text-br-text-primary"
              )}
            >
              {item.hasChildren && (
                <ChevronRight className="inline w-4 h-4 mr-1" />
              )}
              {item.title}
            </Link>
            {item.children && (
              <ul className="ml-4 mt-0.5 space-y-0.5">
                {item.children.map(child => (
                  <li>
                    <Link
                      href={child.href}
                      className="block px-3 py-1.5 rounded text-xs text-br-text-secondary hover:text-br-text-primary"
                    >
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  ))}
</nav>
```

**스타일:**
- 섹션 제목: 12px (text-xs), 대문자, 굵게, 넓은 자간
- 링크: 14px (text-sm), 패딩 상하 8px 좌우 12px
- 활성 링크: 브랜드 배경 + 브랜드 텍스트 + 굵게
- 비활성 링크: 보조 색상, 호버시 elevated 배경
- 중첩 링크: 좌측 마진 16px (ml-4), 12px (text-xs)

#### 4.2.3 코드 블록 (탭 전환)

```typescript
// components/CodeBlock.tsx

<div className="my-6 rounded-xl overflow-hidden border border-br-border bg-br-bg-card">
  {/* 탭 헤더 */}
  <div className="flex items-center border-b border-br-border bg-br-bg-elevated px-4">
    {tabs.map(tab => (
      <button
        className={cn(
          "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          activeTab === tab.id
            ? "border-br-primary-500 text-br-primary-600 dark:text-br-primary-400"
            : "border-transparent text-br-text-secondary hover:text-br-text-primary"
        )}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}

    <div className="ml-auto">
      <button
        className="p-2 text-br-text-secondary hover:text-br-text-primary transition-colors"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  </div>

  {/* 코드 내용 */}
  <div className="p-4 overflow-x-auto">
    <pre className="text-sm">
      <code className={`language-${activeTab}`}>
        {codeBlocks[activeTab]}
      </code>
    </pre>
  </div>
</div>
```

**스타일:**
- 테두리 반경: 12px (rounded-xl)
- 탭 높이: 48px (py-3)
- 탭 하단 테두리: 2px, 활성시 브랜드 컬러
- 코드 패딩: 16px (p-4)
- 폰트: JetBrains Mono, 14px
- 배경: 카드 배경
- 복사 버튼: 우상단, 아이콘만

#### 4.2.4 API 엔드포인트 배지

```typescript
// components/ApiEndpoint.tsx

<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-br-bg-elevated border border-br-border font-mono text-sm">
  <span className={cn(
    "px-1.5 py-0.5 rounded text-xs font-bold",
    method === 'POST' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    method === 'GET' && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  )}>
    {method}
  </span>
  <code>{path}</code>
</div>
```

**스타일:**
- 메소드 배지: 12px (text-xs), 굵게, 패딩 상하 2px 좌우 6px
- POST: 녹색 배경
- GET: 파란색 배경
- 경로: monospace 폰트, 14px

#### 4.2.5 파라미터 테이블

```typescript
// components/ParamTable.tsx

<div className="my-6 overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b-2 border-br-border">
        <th className="text-left p-3 font-semibold text-sm">이름</th>
        <th className="text-left p-3 font-semibold text-sm">타입</th>
        <th className="text-center p-3 font-semibold text-sm">필수</th>
        <th className="text-left p-3 font-semibold text-sm">설명</th>
      </tr>
    </thead>
    <tbody>
      {params.map(param => (
        <tr className="border-b border-br-border hover:bg-br-bg-elevated transition-colors">
          <td className="p-3">
            <code className="text-sm font-medium text-br-primary-600 dark:text-br-primary-400">
              {param.name}
            </code>
          </td>
          <td className="p-3">
            <code className="text-xs text-br-text-secondary">
              {param.type}
            </code>
          </td>
          <td className="p-3 text-center">
            {param.required ? (
              <Check className="w-4 h-4 text-br-accent-500 mx-auto" />
            ) : (
              <span className="text-xs text-br-text-secondary">-</span>
            )}
          </td>
          <td className="p-3 text-sm text-br-text-secondary">
            {param.description}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**스타일:**
- 헤더: 하단 테두리 2px, 굵게
- 행: 하단 테두리 1px, 호버시 배경 변경
- 셀 패딩: 12px (p-3)
- 파라미터 이름: monospace, 브랜드 컬러, 14px
- 타입: monospace, 보조 색상, 12px

#### 4.2.6 TypeScript 인터페이스 블록

```typescript
// MDX 컴포넌트로 자동 렌더링

<div className="my-6 p-4 rounded-xl border border-br-border bg-br-bg-card overflow-x-auto">
  <pre className="text-sm font-mono">
    <code className="language-typescript">
      {interfaceCode}
    </code>
  </pre>
</div>
```

**스타일:**
- 배경: 카드 배경
- 패딩: 16px (p-4)
- 테두리 반경: 12px
- 구문 강조: highlight.js 또는 Prism
- 폰트: JetBrains Mono, 14px

#### 4.2.7 Table of Contents (TOC)

```typescript
// components/TableOfContents.tsx

<nav className="space-y-1">
  <h3 className="px-3 py-2 text-xs font-semibold text-br-text-secondary uppercase">
    이 페이지
  </h3>
  <ul className="space-y-0.5">
    {headings.map(heading => (
      <li>
        <a
          href={`#${heading.id}`}
          className={cn(
            "block px-3 py-1.5 text-sm transition-colors border-l-2",
            isActive
              ? "border-br-primary-500 text-br-primary-600 dark:text-br-primary-400 font-medium"
              : "border-transparent text-br-text-secondary hover:text-br-text-primary hover:border-br-border",
            heading.level === 3 && "pl-6 text-xs"
          )}
        >
          {heading.text}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

**스타일:**
- h2: 좌측 패딩 12px, 14px
- h3: 좌측 패딩 24px, 12px (들여쓰기)
- 활성 링크: 좌측 테두리 브랜드 컬러, 텍스트 브랜드 컬러
- 좌측 테두리: 2px

### 4.3 반응형 동작

#### 모바일 (< 768px)
- 좌측 사이드바: 햄버거 메뉴로 전환 (오버레이)
- 우측 TOC: 숨김
- 메인 컨텐츠: 전체 너비

#### 태블릿 (768px - 1280px)
- 좌측 사이드바: 표시 (축소 가능)
- 우측 TOC: 숨김
- 메인 컨텐츠: 유연한 너비

#### 데스크탑 (> 1280px)
- 3컬럼 레이아웃 유지
- 모든 요소 표시

---

## 5. 플레이그라운드 (`/playground`)

### 5.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [모델] [문서] [가격]    [로그인] [가입]  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         모델 플레이그라운드                          │
│                                                                      │
│  다양한 모델을 실시간으로 테스트하고 파라미터를 조정해보세요          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────────┐
│ CHAT INTERFACE                       │  SETTINGS PANEL              │
│                                      │                              │
│ ┌──────────────────────────────────┐ │ 모델 선택                     │
│ │ 🔍 모델 선택: openai/gpt-5.1    │ │ ┌──────────────────────────┐ │
│ │                              [⚙]│ │ │ Anthropic                │ │
│ └──────────────────────────────────┘ │ │ ├ Claude Opus 4.6        │ │
│                                      │ │ │ ├ Claude Sonnet 4.5     │ │
│ ┌──────────────────────────────────┐ │ │ ├ Claude Haiku 4.5       │ │
│ │ SYSTEM MESSAGE                   │ │ │ OpenAI                   │ │
│ │ ┌──────────────────────────────┐ │ │ │ ├ GPT-5.1               │ │
│ │ │ You are a helpful assistant │ │ │ │ ├ GPT-5 Pro              │ │
│ │ │                             │ │ │ └──────────────────────────┘ │
│ │ └──────────────────────────────┘ │ │                              │
│ └──────────────────────────────────┘ │ 파라미터                      │
│                                      │                              │
│ ┌──────────────────────────────────┐ │ Temperature    [======○--]   │
│ │ [USER]                          │ │ 0.7                          │
│ │ Explain quantum computing       │ │                              │
│ │                         12:30 PM│ │ Top P          [========○]   │
│ └──────────────────────────────────┘ │ 1.0                          │
│                                      │                              │
│ ┌──────────────────────────────────┐ │ Max Tokens                   │
│ │ [ASSISTANT]                     │ │ ┌──────────────────────────┐ │
│ │ Quantum computing is...         │ │ │ 2048                    │ │
│ │                                 │ │ └──────────────────────────┘ │
│ │ • Superposition                 │ │                              │
│ │ • Entanglement                  │ │ [ ] Stream responses          │
│ │ • ...                           │ │                              │
│ │                         12:30 PM│ │ [Clear Chat]                 │
│ └──────────────────────────────────┘ │                              │
│                                      │ ─────────────────────────────│
│ [Tokens: 1,234]                     │ 사용량                        │
│ [Cost: ₩45.23]                      │                              │
│                                      │ Input: 234 tokens            │
│ ┌──────────────────────────────────┐ │ Output: 1,000 tokens         │
│ │ Type your message...            │ │ Cost: ₩45.23                 │
│ │                            [Send]│ │                              │
│ └──────────────────────────────────┘ │ Total today: ₩123.45         │
└──────────────────────────────────────┴──────────────────────────────┘
```

### 5.2 컴포넌트 명세

#### 5.2.1 2컬럼 레이아웃

```typescript
// app/playground/page.tsx

<div className="min-h-screen bg-br-bg-base">
  <Navigation />

  <div className="container-2xl mx-auto px-4 py-8">
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold mb-3">모델 플레이그라운드</h1>
      <p className="text-lg text-br-text-secondary">
        다양한 모델을 실시간으로 테스트하고 파라미터를 조정해보세요
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      {/* 좌측: 채팅 인터페이스 */}
      <ChatInterface />

      {/* 우측: 설정 패널 */}
      <SettingsPanel />
    </div>
  </div>
</div>
```

**스타일:**
- 그리드: 모바일 1열, 데스크탑 2열 (좌측 유연, 우측 400px 고정)
- 간격: 24px (gap-6)

#### 5.2.2 모델 선택기

```typescript
// components/ModelSelector.tsx

<div className="flex items-center gap-3 p-4 bg-br-bg-elevated rounded-xl border border-br-border">
  <div className="flex-1">
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-between w-full px-4 py-2 bg-br-bg-card border border-br-border rounded-lg hover:bg-br-bg-elevated transition-colors">
          <div className="flex items-center gap-3">
            <ProviderBadge provider={selectedModel.provider} size="sm" />
            <div className="text-left">
              <div className="font-medium text-sm">{selectedModel.name}</div>
              <div className="text-xs text-br-text-secondary">{selectedModel.id}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        <div className="max-h-96 overflow-y-auto">
          {/* 검색 */}
          <div className="p-3 border-b border-br-border sticky top-0 bg-br-bg-card">
            <input
              type="text"
              placeholder="모델 검색..."
              className="w-full px-3 py-2 text-sm border border-br-border rounded-lg"
            />
          </div>

          {/* 그룹별 모델 목록 */}
          {modelGroups.map(group => (
            <div key={group.provider}>
              <div className="px-3 py-2 text-xs font-semibold text-br-text-secondary uppercase bg-br-bg-elevated">
                {group.provider}
              </div>
              {group.models.map(model => (
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-br-bg-elevated transition-colors flex items-center justify-between"
                  onClick={() => selectModel(model)}
                >
                  <span>{model.name}</span>
                  {model.discount > 0 && (
                    <DiscountBadge percent={model.discount} />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  </div>

  <button className="p-2 text-br-text-secondary hover:text-br-text-primary">
    <Settings className="w-5 h-5" />
  </button>
</div>
```

**스타일:**
- 트리거 버튼: 전체 너비, 패딩 상하 8px 좌우 16px
- 팝오버: 너비 384px (w-96), 최대 높이 384px, 스크롤 가능
- 그룹 헤더: 12px (text-xs), 대문자, elevated 배경
- 모델 항목: 14px (text-sm), 패딩 상하 8px 좌우 12px, 호버시 배경 변경

#### 5.2.3 시스템 메시지 입력

```typescript
// components/SystemMessageInput.tsx

<div className="mb-4">
  <label className="block text-sm font-medium mb-2">시스템 메시지</label>
  <textarea
    className="w-full px-4 py-3 border border-br-border rounded-lg bg-br-bg-card resize-none focus:ring-2 focus:ring-br-primary-500"
    rows={3}
    placeholder="시스템 메시지를 입력하세요..."
    value={systemMessage}
    onChange={(e) => setSystemMessage(e.target.value)}
  />
</div>
```

**스타일:**
- 라벨: 14px (text-sm), 굵게 (font-medium), 하단 마진 8px
- 텍스트 영역: 패딩 12px, 테두리 반경 8px, 3행 기본
- 포커스: ring 2px, 브랜드 컬러

#### 5.2.4 채팅 메시지 목록

```typescript
// components/MessageList.tsx

<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-br-bg-base rounded-xl border border-br-border min-h-[500px] max-h-[600px]">
  {messages.map(message => (
    <div
      key={message.id}
      className={cn(
        "flex gap-3",
        message.role === 'user' && "flex-row-reverse"
      )}
    >
      {/* 아바타 */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        message.role === 'user'
          ? "bg-br-primary-500 text-white"
          : "bg-br-bg-elevated border border-br-border"
      )}>
        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* 메시지 버블 */}
      <div className={cn(
        "flex-1 max-w-2xl",
        message.role === 'user' && "flex flex-col items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-xl",
          message.role === 'user'
            ? "bg-br-primary-500 text-white"
            : "bg-br-bg-card border border-br-border"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {message.content}
          </div>
        </div>

        <div className="text-xs text-br-text-secondary mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  ))}

  {/* 스트리밍 중 표시 */}
  {isStreaming && (
    <div className="flex items-center gap-2 text-sm text-br-text-secondary">
      <Loader className="w-4 h-4 animate-spin" />
      응답 생성 중...
    </div>
  )}
</div>
```

**스타일:**
- 컨테이너: 최소 높이 500px, 최대 높이 600px, 스크롤 가능
- 아바타: 32x32px, 둥글게
- 사용자 메시지: 브랜드 컬러 배경, 흰색 텍스트, 우측 정렬
- 어시스턴트 메시지: 카드 배경, 테두리, 좌측 정렬
- 버블 패딩: 상하 12px, 좌우 16px
- 타임스탬프: 12px (text-xs), 보조 색상

#### 5.2.5 메시지 입력

```typescript
// components/MessageInput.tsx

<div className="mt-4">
  <div className="flex items-end gap-3">
    <div className="flex-1">
      <textarea
        className="w-full px-4 py-3 border border-br-border rounded-xl bg-br-bg-card resize-none focus:ring-2 focus:ring-br-primary-500"
        rows={3}
        placeholder="메시지를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-br-text-secondary">
          Shift + Enter로 줄바꿈
        </span>
        <div className="flex items-center gap-4 text-xs text-br-text-secondary">
          <span>토큰: {totalTokens.toLocaleString()}</span>
          <span>비용: ₩{totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <button
      className="px-6 py-3 bg-br-primary-500 text-white rounded-xl font-medium hover:bg-br-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      onClick={handleSend}
      disabled={!input.trim() || isStreaming}
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
</div>
```

**스타일:**
- 텍스트 영역: 패딩 12px, 테두리 반경 12px, 3행 기본
- 전송 버튼: 높이 48px, 패딩 좌우 24px, 브랜드 컬러 배경
- 메타 정보: 12px (text-xs), 보조 색상
- 비활성화 상태: 50% 불투명도, 커서 not-allowed

#### 5.2.6 파라미터 슬라이더

```typescript
// components/ParameterSlider.tsx

<div className="space-y-6 p-4 bg-br-bg-card rounded-xl border border-br-border">
  <h3 className="font-semibold text-sm">파라미터</h3>

  {/* Temperature */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium">Temperature</label>
      <span className="text-xs text-br-text-secondary">{temperature}</span>
    </div>
    <input
      type="range"
      min="0"
      max="2"
      step="0.1"
      value={temperature}
      onChange={(e) => setTemperature(Number(e.target.value))}
      className="w-full h-2 bg-br-bg-elevated rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-br-primary-500"
    />
  </div>

  {/* Top P */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium">Top P</label>
      <span className="text-xs text-br-text-secondary">{topP}</span>
    </div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={topP}
      onChange={(e) => setTopP(Number(e.target.value))}
      className="w-full h-2 bg-br-bg-elevated rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-br-primary-500"
    />
  </div>

  {/* Max Tokens */}
  <div>
    <label className="block text-sm font-medium mb-2">Max Tokens</label>
    <input
      type="number"
      value={maxTokens}
      onChange={(e) => setMaxTokens(Number(e.target.value))}
      className="w-full px-3 py-2 border border-br-border rounded-lg bg-br-bg-base text-sm"
    />
  </div>

  {/* Stream Toggle */}
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium">스트리밍 응답</label>
    <button
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative",
        stream ? "bg-br-primary-500" : "bg-br-gray-300"
      )}
      onClick={() => setStream(!stream)}
    >
      <div className={cn(
        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
        stream ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  </div>

  {/* Clear Button */}
  <button
    className="w-full px-4 py-2 border border-br-border rounded-lg text-sm font-medium hover:bg-br-bg-elevated transition-colors"
    onClick={clearChat}
  >
    채팅 초기화
  </button>
</div>
```

**스타일:**
- 슬라이더 트랙: 높이 8px, 둥글게, elevated 배경
- 슬라이더 썸: 16x16px, 둥글게, 브랜드 컬러
- 토글 스위치: 너비 44px, 높이 24px
- 라벨: 14px (text-sm), 굵게 (font-medium)
- 값 표시: 12px (text-xs), 보조 색상

#### 5.2.7 사용량 표시

```typescript
// components/UsageDisplay.tsx

<div className="mt-6 p-4 bg-br-bg-elevated rounded-xl border-t border-br-border">
  <h3 className="font-semibold text-sm mb-4">사용량</h3>

  <div className="space-y-3">
    <div className="flex items-center justify-between text-sm">
      <span className="text-br-text-secondary">입력 토큰</span>
      <span className="font-medium">{inputTokens.toLocaleString()}</span>
    </div>

    <div className="flex items-center justify-between text-sm">
      <span className="text-br-text-secondary">출력 토큰</span>
      <span className="font-medium">{outputTokens.toLocaleString()}</span>
    </div>

    <div className="h-px bg-br-border my-2" />

    <div className="flex items-center justify-between text-sm">
      <span className="text-br-text-secondary">현재 대화 비용</span>
      <span className="font-semibold text-br-primary-600">
        ₩{conversationCost.toFixed(2)}
      </span>
    </div>

    <div className="flex items-center justify-between text-sm">
      <span className="text-br-text-secondary">오늘 총 비용</span>
      <span className="font-semibold">
        ₩{todayCost.toFixed(2)}
      </span>
    </div>
  </div>
</div>
```

**스타일:**
- 컨테이너: 패딩 16px, elevated 배경, 상단 테두리
- 행 간격: 12px (space-y-3)
- 폰트 크기: 14px (text-sm)
- 비용: 브랜드 컬러, 굵게 (font-semibold)

### 5.3 반응형 동작

#### 모바일 (< 1024px)
- 1컬럼 레이아웃
- 설정 패널: 하단에 배치 또는 아코디언으로 접기
- 채팅 높이: 최소 400px

#### 데스크탑 (> 1024px)
- 2컬럼 레이아웃 유지
- 좌측 채팅, 우측 설정 (400px 고정)

---

## 6. 대시보드 (`/dashboard`)

### 6.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [대시보드] [사용량] [통계]  [@user ▼]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  대시보드                                              [다크모드]     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  SUMMARY CARDS (4개)                                                 │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 📊 오늘  │  │ 💰 이번달 │  │ 💳 크레딧 │  │ 📞 API   │            │
│  │          │  │          │  │          │  │   호출    │            │
│  │ 123.4K   │  │ ₩45,230  │  │ ₩50,000  │  │  1,234   │            │
│  │ 토큰     │  │ 사용액    │  │ 잔액     │  │  건      │            │
│  │          │  │          │  │          │  │          │            │
│  │ +12.3%   │  │ 84% 사용 │  │ [충전]   │  │ +5.6%    │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  모델별 사용량                         [일간] [주간] [월간]          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  █████████████████ Claude Opus 4.6         45.2K 토큰  36.7%  │  │
│  │  ████████████ GPT-5.1                      28.3K 토큰  23.0%  │  │
│  │  ████████ Gemini 2.5 Flash                 18.9K 토큰  15.4%  │  │
│  │  ████ Claude Sonnet 4.5                     9.2K 토큰   7.5%  │  │
│  │  ███ GPT-5 Nano                             6.7K 토큰   5.4%  │  │
│  │  ██ 기타                                    14.9K 토큰  12.0%  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  일별 사용량 추이                      [7일] [30일] [90일]           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 40K ┤                                              ●            │  │
│  │ 35K ┤                                      ●                    │  │
│  │ 30K ┤                              ●                            │  │
│  │ 25K ┤                      ●                                    │  │
│  │ 20K ┤              ●                                            │  │
│  │ 15K ┤      ●                                                    │  │
│  │ 10K ┤  ●                                                        │  │
│  │  5K ┤                                                           │  │
│  │  0  └───┴───┴───┴───┴───┴───┴───                               │  │
│  │     월   화   수   목   금   토   일                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  최근 API 호출                                          [전체 보기]   │
│                                                                       │
│  시간       모델              입력     출력     비용      상태        │
│  ──────────────────────────────────────────────────────────────────  │
│  12:45 PM  GPT-5.1           234T    1,023T  ₩18.23   ✅ 성공       │
│  12:43 PM  Claude Opus 4.6   456T    2,134T  ₩78.45   ✅ 성공       │
│  12:40 PM  Gemini 2.5        123T      456T   ₩2.89   ✅ 성공       │
│  12:38 PM  GPT-5 Nano         89T      234T   ₩0.67   ✅ 성공       │
│  12:35 PM  Claude Sonnet     345T    1,567T  ₩28.34   ❌ 오류       │
│  ...                                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 컴포넌트 명세

#### 6.2.1 대시보드 레이아웃

```typescript
// app/dashboard/page.tsx

<div className="min-h-screen bg-br-bg-base">
  <DashboardNav />

  <div className="container-xl mx-auto px-4 py-8">
    {/* 페이지 헤더 */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-br-text-secondary mt-1">
          {organization.name}의 사용량 현황
        </p>
      </div>
      <ThemeToggle />
    </div>

    {/* 요약 카드 그리드 */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard />
      <StatCard />
      <StatCard />
      <StatCard />
    </div>

    {/* 차트 영역 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ModelUsageChart />
      <UsageTrendChart />
    </div>

    {/* 최근 호출 테이블 */}
    <RecentCallsTable />
  </div>
</div>
```

#### 6.2.2 통계 카드

```typescript
// components/StatCard.tsx

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  action?: React.ReactNode;
}

<div className="bg-br-bg-card border border-br-border rounded-xl p-6 hover:shadow-lg transition-shadow">
  {/* 아이콘 & 라벨 */}
  <div className="flex items-start justify-between mb-4">
    <div className="p-3 bg-br-primary-100 dark:bg-br-primary-900 rounded-lg">
      {icon}
    </div>
    {action}
  </div>

  {/* 메인 값 */}
  <div className="mb-2">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm text-br-text-secondary mt-1">{label}</div>
  </div>

  {/* 서브 정보 */}
  {subtitle && (
    <div className="text-sm text-br-text-secondary">{subtitle}</div>
  )}

  {/* 추세 */}
  {trend && (
    <div className={cn(
      "flex items-center gap-1 text-sm font-medium mt-2",
      trend.direction === 'up' ? "text-br-accent-600" : "text-br-error-500"
    )}>
      {trend.direction === 'up' ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
    </div>
  )}
</div>
```

**스타일:**
- 패딩: 24px (p-6)
- 테두리 반경: 12px (rounded-xl)
- 아이콘 컨테이너: 48x48px, 브랜드 컬러 배경
- 메인 값: 30px (text-3xl), 굵게
- 라벨: 14px (text-sm), 보조 색상
- 추세: 14px, 상승 녹색/하락 빨강

#### 6.2.3 모델별 사용량 차트 (수평 바)

```typescript
// components/ModelUsageChart.tsx

<div className="bg-br-bg-card border border-br-border rounded-xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">모델별 사용량</h2>
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 text-sm rounded-lg hover:bg-br-bg-elevated">일간</button>
      <button className="px-3 py-1.5 text-sm rounded-lg bg-br-primary-500 text-white">주간</button>
      <button className="px-3 py-1.5 text-sm rounded-lg hover:bg-br-bg-elevated">월간</button>
    </div>
  </div>

  <div className="space-y-4">
    {modelUsage.map(model => (
      <div key={model.id}>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <ProviderBadge provider={model.provider} size="xs" />
            <span className="font-medium">{model.name}</span>
          </div>
          <div className="flex items-center gap-4 text-br-text-secondary">
            <span>{model.tokens.toLocaleString()} 토큰</span>
            <span className="font-medium">{model.percentage}%</span>
          </div>
        </div>
        <div className="h-2 bg-br-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-br-primary-500 rounded-full transition-all"
            style={{ width: `${model.percentage}%` }}
          />
        </div>
      </div>
    ))}
  </div>
</div>
```

**스타일:**
- 바 높이: 8px (h-2)
- 바 배경: elevated
- 바 전경: 브랜드 컬러, 애니메이션
- 행 간격: 16px (space-y-4)
- 라벨: 14px (text-sm)

#### 6.2.4 사용량 추이 차트 (라인)

```typescript
// components/UsageTrendChart.tsx

<div className="bg-br-bg-card border border-br-border rounded-xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">일별 사용량 추이</h2>
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 text-sm rounded-lg bg-br-primary-500 text-white">7일</button>
      <button className="px-3 py-1.5 text-sm rounded-lg hover:bg-br-bg-elevated">30일</button>
      <button className="px-3 py-1.5 text-sm rounded-lg hover:bg-br-bg-elevated">90일</button>
    </div>
  </div>

  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--br-border)" />
        <XAxis
          dataKey="date"
          stroke="var(--br-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--br-text-secondary)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${value / 1000}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--br-bg-card)',
            border: '1px solid var(--br-border)',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="tokens"
          stroke="var(--br-primary-500)"
          strokeWidth={2}
          dot={{ fill: 'var(--br-primary-500)', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>
```

**스타일:**
- 차트 높이: 256px (h-64)
- 라인 두께: 2px
- 점 크기: 4px 반경
- 툴팁: 카드 배경, 테두리, 8px 반경

#### 6.2.5 최근 API 호출 테이블

```typescript
// components/RecentCallsTable.tsx

<div className="bg-br-bg-card border border-br-border rounded-xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">최근 API 호출</h2>
    <Link
      href="/dashboard/usage"
      className="text-sm text-br-primary-600 hover:text-br-primary-700 font-medium"
    >
      전체 보기 →
    </Link>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b border-br-border">
        <tr>
          <th className="text-left p-3 text-sm font-semibold">시간</th>
          <th className="text-left p-3 text-sm font-semibold">모델</th>
          <th className="text-right p-3 text-sm font-semibold">입력</th>
          <th className="text-right p-3 text-sm font-semibold">출력</th>
          <th className="text-right p-3 text-sm font-semibold">비용</th>
          <th className="text-center p-3 text-sm font-semibold">상태</th>
        </tr>
      </thead>
      <tbody>
        {recentCalls.map(call => (
          <tr
            key={call.id}
            className="border-b border-br-border hover:bg-br-bg-elevated transition-colors"
          >
            <td className="p-3 text-sm text-br-text-secondary">
              {formatTime(call.timestamp)}
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <ProviderBadge provider={call.provider} size="xs" />
                <span className="text-sm font-medium">{call.modelName}</span>
              </div>
            </td>
            <td className="p-3 text-right text-sm">
              {call.inputTokens.toLocaleString()}T
            </td>
            <td className="p-3 text-right text-sm">
              {call.outputTokens.toLocaleString()}T
            </td>
            <td className="p-3 text-right text-sm font-medium">
              ₩{call.cost.toFixed(2)}
            </td>
            <td className="p-3 text-center">
              {call.status === 'success' ? (
                <span className="inline-flex items-center gap-1 text-xs text-br-accent-600">
                  <CheckCircle className="w-4 h-4" />
                  성공
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-br-error-500">
                  <XCircle className="w-4 h-4" />
                  오류
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**스타일:**
- 헤더: 하단 테두리, 14px (text-sm), 굵게
- 행: 호버시 배경 변경
- 셀 패딩: 12px (p-3)
- 상태 아이콘: 16x16px, 성공 녹색/오류 빨강

### 6.3 크레딧 게이지

```typescript
// components/CreditGauge.tsx

<div className="relative">
  {/* 반원 게이지 */}
  <svg viewBox="0 0 200 100" className="w-full">
    <path
      d="M 20 80 A 80 80 0 0 1 180 80"
      stroke="var(--br-bg-elevated)"
      strokeWidth="12"
      fill="none"
    />
    <path
      d="M 20 80 A 80 80 0 0 1 180 80"
      stroke="var(--br-primary-500)"
      strokeWidth="12"
      fill="none"
      strokeDasharray={`${(remaining / total) * 251} 251`}
    />
  </svg>

  {/* 중앙 값 */}
  <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
    <div className="text-3xl font-bold">₩{remaining.toLocaleString()}</div>
    <div className="text-sm text-br-text-secondary">
      ₩{total.toLocaleString()} 중
    </div>
  </div>
</div>
```

---

## 7. API 키 관리 (`/dashboard/keys`)

### 7.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [대시보드] [사용량] [통계]  [@user ▼]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  API 키 관리                                        [+ 새 키 생성]   │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 이름       │ API 키                │ 생성일   │ 마지막 사용 │ 사용량 │ 상태  │ 작업 │
├────────────┼───────────────────────┼─────────┼────────────┼────────┼──────┼──────┤
│ Production │ sk-br-v1-abc1...xyz9  │ 2026.01 │ 방금 전    │ 45.2K/ │ ✅ 활성│ [⋮] │
│            │ [복사]                │         │            │ 100K   │      │      │
│            │                       │         │            │ ──────│      │      │
│            │                       │         │            │ 45.2%  │      │      │
├────────────┼───────────────────────┼─────────┼────────────┼────────┼──────┼──────┤
│ Development│ sk-br-v1-def2...uvw8  │ 2026.02 │ 2시간 전   │ 12.3K/ │ ✅ 활성│ [⋮] │
│            │ [복사]                │         │            │ 50K    │      │      │
│            │                       │         │            │ ──────│      │      │
│            │                       │         │            │ 24.6%  │      │      │
├────────────┼───────────────────────┼─────────┼────────────┼────────┼──────┼──────┤
│ Testing    │ sk-br-v1-ghi3...rst7  │ 2025.12 │ 1주일 전   │  1.2K/ │ ⭕ 비활성│ [⋮] │
│            │ [복사]                │         │            │ 무제한 │      │      │
└────────────┴───────────────────────┴─────────┴────────────┴────────┴──────┴──────┘
```

### 7.2 컴포넌트 명세

#### 7.2.1 새 키 생성 다이얼로그

```typescript
// components/CreateKeyDialog.tsx

<Dialog>
  <DialogTrigger asChild>
    <Button className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      새 키 생성
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>새 API 키 생성</DialogTitle>
      <DialogDescription>
        생성된 키는 한 번만 표시됩니다. 안전한 곳에 보관하세요.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* 키 이름 */}
      <div>
        <label className="block text-sm font-medium mb-2">키 이름</label>
        <input
          type="text"
          placeholder="예: Production API Key"
          className="w-full px-3 py-2 border border-br-border rounded-lg"
        />
      </div>

      {/* 크레딧 한도 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          크레딧 한도 (선택)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="무제한"
            className="flex-1 px-3 py-2 border border-br-border rounded-lg"
          />
          <span className="text-sm text-br-text-secondary">KRW</span>
        </div>
        <p className="text-xs text-br-text-secondary mt-1">
          미설정 시 조직 한도를 따릅니다
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button variant="primary">생성</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 7.2.2 키 표시 성공 다이얼로그

```typescript
// components/KeyCreatedDialog.tsx

<Dialog open={showKey}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-br-accent-600">
        <CheckCircle className="w-6 h-6" />
        API 키 생성 완료
      </DialogTitle>
    </DialogHeader>

    <div className="py-4 space-y-4">
      <div className="p-4 bg-br-warning-50 dark:bg-br-warning-900 border border-br-warning-200 dark:border-br-warning-700 rounded-lg">
        <p className="text-sm font-medium text-br-warning-800 dark:text-br-warning-200">
          ⚠️ 이 키는 다시 표시되지 않습니다
        </p>
        <p className="text-xs text-br-warning-700 dark:text-br-warning-300 mt-1">
          지금 복사하여 안전한 곳에 보관하세요
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">API 키</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-br-bg-elevated border border-br-border rounded-lg text-sm font-mono">
            {apiKey}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button onClick={closeDialog}>완료</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**스타일:**
- 경고 박스: 주황색 배경, 테두리
- 키 표시: monospace 폰트, elevated 배경
- 복사 버튼: 아이콘만, 소형

#### 7.2.3 키 목록 테이블

```typescript
// components/KeysTable.tsx

<div className="bg-br-bg-card border border-br-border rounded-xl overflow-hidden">
  <table className="w-full">
    <thead className="bg-br-bg-elevated border-b border-br-border">
      <tr>
        <th className="text-left p-4 text-sm font-semibold">이름</th>
        <th className="text-left p-4 text-sm font-semibold">API 키</th>
        <th className="text-left p-4 text-sm font-semibold">생성일</th>
        <th className="text-left p-4 text-sm font-semibold">마지막 사용</th>
        <th className="text-left p-4 text-sm font-semibold">사용량</th>
        <th className="text-center p-4 text-sm font-semibold">상태</th>
        <th className="text-center p-4 text-sm font-semibold">작업</th>
      </tr>
    </thead>
    <tbody>
      {keys.map(key => (
        <tr key={key.id} className="border-b border-br-border hover:bg-br-bg-elevated">
          <td className="p-4">
            <div className="font-medium">{key.name}</div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-br-text-secondary">
                {key.prefix}...{key.suffix}
              </code>
              <button
                className="p-1 hover:bg-br-bg-elevated rounded"
                onClick={() => copyKey(key.prefix)}
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </td>
          <td className="p-4 text-sm text-br-text-secondary">
            {formatDate(key.createdAt)}
          </td>
          <td className="p-4 text-sm text-br-text-secondary">
            {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : '-'}
          </td>
          <td className="p-4">
            <div className="w-32">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{key.usage.toLocaleString()}</span>
                <span className="text-br-text-secondary">
                  {key.limit ? `/ ${key.limit.toLocaleString()}` : '무제한'}
                </span>
              </div>
              {key.limit && (
                <div className="h-1.5 bg-br-bg-elevated rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      key.usage / key.limit > 0.9 ? "bg-br-error-500" : "bg-br-primary-500"
                    )}
                    style={{ width: `${(key.usage / key.limit) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </td>
          <td className="p-4 text-center">
            {key.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-br-accent-100 text-br-accent-700 dark:bg-br-accent-900 dark:text-br-accent-300 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                활성
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-br-gray-100 text-br-gray-700 dark:bg-br-gray-800 dark:text-br-gray-300 rounded-full text-xs font-medium">
                <XCircle className="w-3 h-3" />
                비활성
              </span>
            )}
          </td>
          <td className="p-4 text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-br-bg-elevated rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => viewDetails(key.id)}>
                  상세 보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editKey(key.id)}>
                  수정
                </DropdownMenuItem>
                {key.isActive ? (
                  <DropdownMenuItem onClick={() => deactivateKey(key.id)}>
                    비활성화
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => activateKey(key.id)}>
                    활성화
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteKey(key.id)}
                  className="text-br-error-500"
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**스타일:**
- 사용량 게이지: 높이 6px, 90% 이상시 빨강
- 상태 배지: 12px (text-xs), 패딩 상하 4px 좌우 8px, 둥글게
- 액션 버튼: 아이콘만, 호버시 배경

---

## 8. 조직 설정 (`/dashboard/settings`)

### 8.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [대시보드] [사용량] [통계]  [@user ▼]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  조직 설정                                                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  조직 정보                                                           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 조직 이름                                                      │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ Acme Corporation                                          ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ 플랜                                                           │  │
│  │ Enterprise  [업그레이드]                                       │  │
│  │                                                                │  │
│  │ 월 사용량 한도                                                 │  │
│  │ ₩1,000,000                                                     │  │
│  │                                                                │  │
│  │                                         [변경사항 저장]        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  멤버 관리                                             [+ 멤버 초대]  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 이메일           │ 역할    │ 가입일     │ 작업                 │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ admin@acme.com   │ Owner   │ 2026.01.01 │ -                   │  │
│  │ dev@acme.com     │ Member  │ 2026.01.15 │ [변경] [제거]        │  │
│  │ test@acme.com    │ Member  │ 2026.02.01 │ [변경] [제거]        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  보안 설정                                                           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 금지어 필터링                                    [ ○───── ] ON  │  │
│  │                                                                │  │
│  │ 금지어 목록 (줄바꿈으로 구분)                                   │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ 비밀번호                                                   ││  │
│  │ │ 개인정보                                                   ││  │
│  │ │ 주민등록번호                                               ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ 모델 블랙리스트                                                │  │
│  │ [ ] GPT-5.3 Pro                                               │  │
│  │ [ ] Claude Opus 4.6                                           │  │
│  │ [✓] Gemini 3.1 Pro                                            │  │
│  │                                                                │  │
│  │ 파일 업로드 차단                                 [ ─────○ ] OFF│  │
│  │ PII 자동 마스킹                                  [ ○───── ] ON │  │
│  │                                                                │  │
│  │                                         [변경사항 저장]        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Claude Code 모델 오버라이드                                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Haiku Family                                                   │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ bedrock/claude-haiku-4.5                               ▼  ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ Sonnet Family                                                  │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ bedrock/claude-sonnet-4.5                              ▼  ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ Opus Family                                                    │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ bedrock/claude-opus-4.6                                ▼  ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │                                         [변경사항 저장]        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.2 컴포넌트 명세

#### 8.2.1 설정 섹션 레이아웃

```typescript
// app/dashboard/settings/page.tsx

<div className="container-xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-8">조직 설정</h1>

  <div className="space-y-6">
    <OrganizationInfoSection />
    <MembersSection />
    <SecuritySection />
    <ClaudeCodeOverrideSection />
  </div>
</div>
```

#### 8.2.2 토글 스위치

```typescript
// components/Toggle.tsx

<div className="flex items-center justify-between p-4 bg-br-bg-card border border-br-border rounded-lg">
  <div>
    <div className="font-medium">{label}</div>
    <div className="text-sm text-br-text-secondary mt-1">{description}</div>
  </div>

  <button
    className={cn(
      "w-12 h-6 rounded-full transition-colors relative",
      enabled ? "bg-br-primary-500" : "bg-br-gray-300"
    )}
    onClick={() => setEnabled(!enabled)}
  >
    <div className={cn(
      "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm",
      enabled ? "translate-x-6" : "translate-x-0.5"
    )} />
  </button>
</div>
```

**스타일:**
- 스위치: 너비 48px, 높이 24px
- 핸들: 20x20px, 흰색, 그림자
- ON: 브랜드 컬러 배경
- OFF: 회색 배경

#### 8.2.3 체크박스 목록

```typescript
// components/CheckboxList.tsx

<div className="space-y-2">
  {options.map(option => (
    <label
      key={option.id}
      className="flex items-center gap-3 p-3 hover:bg-br-bg-elevated rounded-lg cursor-pointer transition-colors"
    >
      <input
        type="checkbox"
        checked={selected.includes(option.id)}
        onChange={() => toggleOption(option.id)}
        className="w-4 h-4 text-br-primary-500 border-br-border rounded focus:ring-2 focus:ring-br-primary-500"
      />
      <span className="text-sm">{option.label}</span>
    </label>
  ))}
</div>
```

---

## 9. 결제 페이지 (`/dashboard/billing`)

### 9.1 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  [로고] LLM-Router          [대시보드] [사용량] [통계]  [@user ▼]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  결제 및 크레딧                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬─────────────────────────────────────┐
│  크레딧 잔액                    │  이번 달 사용량                      │
│                                │                                     │
│  ₩50,000                       │  ₩45,230                            │
│  ───────────────               │  ─────────────────────              │
│  ₩100,000                      │  ₩53,770 남음                       │
│                                │                                     │
│  [크레딧 충전]                  │  84% 사용                           │
└────────────────────────────────┴─────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  크레딧 거래 내역                                       [내보내기]    │
│                                                                       │
│  날짜       │ 타입    │ 금액         │ 잔액         │ 설명           │
│  ──────────┼────────┼─────────────┼─────────────┼────────────────  │
│  03.03     │ 사용    │ -₩18,230    │ ₩50,000     │ API 사용료     │
│  03.02     │ 사용    │ -₩27,000    │ ₩68,230     │ API 사용료     │
│  03.01     │ 충전    │ +₩100,000   │ ₩95,230     │ 카드 결제      │
│  02.28     │ 사용    │ -₩15,450    │ -₩4,770     │ API 사용료     │
│  ...                                                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  월별 사용량 요약                                                     │
│                                                                       │
│  2026년 3월 (현재까지)                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 모델                   입력 토큰   출력 토큰   비용             │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ Claude Opus 4.6        123.4K      456.7K     ₩18,230         │  │
│  │ GPT-5.1                 89.2K      234.5K     ₩12,450         │  │
│  │ Gemini 2.5 Flash        67.8K      189.3K      ₩4,560         │  │
│  │ ...                                                            │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ 총계                   456.7K    1,234.5K     ₩45,230         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [이전 달 보기]                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  요금 계산기                                                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 모델 선택                                                      │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ openai/gpt-5.1                                         ▼  ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ 예상 입력 토큰                                                 │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ 10,000                                                    ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ 예상 출력 토큰                                                 │  │
│  │ ┌────────────────────────────────────────────────────────────┐│  │
│  │ │ 2,000                                                     ││  │
│  │ └────────────────────────────────────────────────────────────┘│  │
│  │                                                                │  │
│  │ ───────────────────────────────────────────────────────────── │  │
│  │                                                                │  │
│  │ 예상 비용: ₩47.03                                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 9.2 컴포넌트 명세

#### 9.2.1 크레딧 충전 다이얼로그

```typescript
// components/TopUpDialog.tsx

<Dialog>
  <DialogTrigger asChild>
    <Button variant="primary">크레딧 충전</Button>
  </DialogTrigger>

  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>크레딧 충전</DialogTitle>
    </DialogHeader>

    <div className="py-4 space-y-4">
      {/* 충전 금액 선택 */}
      <div>
        <label className="block text-sm font-medium mb-3">충전 금액</label>
        <div className="grid grid-cols-2 gap-3">
          {amounts.map(amount => (
            <button
              key={amount}
              className={cn(
                "p-4 border-2 rounded-xl text-center transition-all",
                selected === amount
                  ? "border-br-primary-500 bg-br-primary-50 dark:bg-br-primary-900"
                  : "border-br-border hover:border-br-primary-300"
              )}
              onClick={() => setSelected(amount)}
            >
              <div className="text-xl font-bold">₩{amount.toLocaleString()}</div>
              {amount >= 100000 && (
                <div className="text-xs text-br-accent-600 mt-1">+5% 보너스</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 커스텀 금액 */}
      <div>
        <label className="block text-sm font-medium mb-2">또는 직접 입력</label>
        <input
          type="number"
          placeholder="금액 입력 (최소 ₩10,000)"
          className="w-full px-3 py-2 border border-br-border rounded-lg"
        />
      </div>

      {/* 결제 수단 */}
      <div>
        <label className="block text-sm font-medium mb-2">결제 수단</label>
        <select className="w-full px-3 py-2 border border-br-border rounded-lg">
          <option>신용카드 (****-1234)</option>
          <option>계좌이체</option>
          <option>무통장입금</option>
        </select>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button variant="primary">
        ₩{selected.toLocaleString()} 충전
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**스타일:**
- 금액 버튼: 패딩 16px, 테두리 2px
- 선택 상태: 브랜드 컬러 테두리 + 배경
- 보너스 표시: 12px (text-xs), accent 컬러

---

## 10. 인증 페이지 (`/login`, `/signup`)

### 10.1 로그인 페이지 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                                                                       │
│                    ┌───────────────────────┐                         │
│                    │                       │                         │
│                    │   [로고] LLM-Router    │                         │
│                    │                       │                         │
│                    │   기업용 LLM 라우터   │                         │
│                    │                       │                         │
│                    │   ──────────────────  │                         │
│                    │                       │                         │
│                    │   이메일              │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │                       │                         │
│                    │   비밀번호            │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │                       │                         │
│                    │   [ ] 로그인 상태유지 │                         │
│                    │                       │                         │
│                    │   [    로그인     ]   │                         │
│                    │                       │                         │
│                    │   비밀번호 찾기       │                         │
│                    │                       │                         │
│                    │   ──────────────────  │                         │
│                    │                       │                         │
│                    │   계정이 없으신가요?  │                         │
│                    │   무료 가입하기 →     │                         │
│                    │                       │                         │
│                    └───────────────────────┘                         │
│                                                                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 회원가입 페이지 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                    ┌───────────────────────┐                         │
│                    │                       │                         │
│                    │   [로고] LLM-Router    │                         │
│                    │                       │                         │
│                    │   무료로 시작하기     │                         │
│                    │                       │                         │
│                    │   ──────────────────  │                         │
│                    │                       │                         │
│                    │   조직 이름           │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │                       │                         │
│                    │   이메일              │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │                       │                         │
│                    │   비밀번호            │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │   ● 8자 이상          │                         │
│                    │   ● 대소문자 포함     │                         │
│                    │   ● 숫자 포함         │                         │
│                    │                       │                         │
│                    │   비밀번호 확인       │                         │
│                    │   ┌─────────────────┐ │                         │
│                    │   │                 │ │                         │
│                    │   └─────────────────┘ │                         │
│                    │                       │                         │
│                    │   [✓] 이용약관 동의   │                         │
│                    │   [✓] 개인정보처리방침│                         │
│                    │                       │                         │
│                    │   [   가입하기    ]   │                         │
│                    │                       │                         │
│                    │   ──────────────────  │                         │
│                    │                       │                         │
│                    │   이미 계정이 있나요? │                         │
│                    │   로그인 →            │                         │
│                    │                       │                         │
│                    └───────────────────────┘                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.3 컴포넌트 명세

#### 10.3.1 인증 레이아웃

```typescript
// app/(auth)/layout.tsx

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-br-primary-50 to-br-accent-50 dark:from-br-primary-950 dark:to-br-accent-950 p-4">
  {/* 배경 패턴 (선택) */}
  <div className="absolute inset-0 bg-grid-pattern opacity-5" />

  {/* 인증 카드 */}
  <div className="relative w-full max-w-md">
    <div className="bg-br-bg-card border border-br-border rounded-2xl shadow-xl p-8">
      {children}
    </div>

    {/* 하단 링크 */}
    <div className="text-center mt-6 text-sm text-br-text-secondary">
      <Link href="/privacy" className="hover:text-br-text-primary">
        개인정보처리방침
      </Link>
      <span className="mx-2">·</span>
      <Link href="/terms" className="hover:text-br-text-primary">
        이용약관
      </Link>
    </div>
  </div>
</div>
```

**스타일:**
- 카드: 최대 너비 448px (max-w-md)
- 패딩: 32px (p-8)
- 테두리 반경: 16px (rounded-2xl)
- 그림자: xl
- 배경: 그라데이션 (primary → accent)

#### 10.3.2 로그인 폼

```typescript
// app/login/page.tsx

<form onSubmit={handleLogin} className="space-y-6">
  {/* 로고 & 헤드라인 */}
  <div className="text-center mb-8">
    <Logo className="mx-auto mb-4" />
    <h1 className="text-2xl font-bold">LLM-Router</h1>
    <p className="text-br-text-secondary mt-2">기업용 LLM 라우터</p>
  </div>

  {/* 이메일 */}
  <div>
    <label className="block text-sm font-medium mb-2">이메일</label>
    <input
      type="email"
      required
      className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
      placeholder="your@email.com"
    />
  </div>

  {/* 비밀번호 */}
  <div>
    <label className="block text-sm font-medium mb-2">비밀번호</label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required
        className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
        placeholder="••••••••"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-br-text-secondary"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>

  {/* 로그인 상태 유지 */}
  <div className="flex items-center justify-between">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 text-br-primary-500 border-br-border rounded focus:ring-2 focus:ring-br-primary-500"
      />
      <span className="text-sm">로그인 상태 유지</span>
    </label>
    <Link
      href="/forgot-password"
      className="text-sm text-br-primary-600 hover:text-br-primary-700"
    >
      비밀번호 찾기
    </Link>
  </div>

  {/* 로그인 버튼 */}
  <button
    type="submit"
    className="w-full px-4 py-3 bg-br-primary-500 text-white rounded-lg font-medium hover:bg-br-primary-600 disabled:opacity-50 transition-colors"
    disabled={isLoading}
  >
    {isLoading ? '로그인 중...' : '로그인'}
  </button>

  {/* 구분선 */}
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-br-border" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-4 bg-br-bg-card text-br-text-secondary">또는</span>
    </div>
  </div>

  {/* 가입 링크 */}
  <div className="text-center text-sm">
    <span className="text-br-text-secondary">계정이 없으신가요? </span>
    <Link
      href="/signup"
      className="text-br-primary-600 hover:text-br-primary-700 font-medium"
    >
      무료 가입하기 →
    </Link>
  </div>
</form>
```

**스타일:**
- 입력 필드: 높이 48px, 패딩 좌우 16px
- 버튼: 높이 48px, 전체 너비
- 간격: 24px (space-y-6)
- 포커스: ring 2px, 브랜드 컬러

#### 10.3.3 회원가입 폼

```typescript
// app/signup/page.tsx

<form onSubmit={handleSignup} className="space-y-5">
  {/* 로고 & 헤드라인 */}
  <div className="text-center mb-6">
    <Logo className="mx-auto mb-4" />
    <h1 className="text-2xl font-bold">무료로 시작하기</h1>
    <p className="text-br-text-secondary mt-2">$10 크레딧 증정</p>
  </div>

  {/* 조직 이름 */}
  <div>
    <label className="block text-sm font-medium mb-2">조직 이름</label>
    <input
      type="text"
      required
      className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
      placeholder="Acme Corporation"
    />
  </div>

  {/* 이메일 */}
  <div>
    <label className="block text-sm font-medium mb-2">이메일</label>
    <input
      type="email"
      required
      className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
      placeholder="your@email.com"
    />
  </div>

  {/* 비밀번호 */}
  <div>
    <label className="block text-sm font-medium mb-2">비밀번호</label>
    <input
      type="password"
      required
      className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
      placeholder="••••••••"
      onChange={validatePassword}
    />
    <ul className="mt-2 space-y-1 text-xs">
      {passwordRequirements.map(req => (
        <li
          key={req.id}
          className={cn(
            "flex items-center gap-2",
            req.met ? "text-br-accent-600" : "text-br-text-secondary"
          )}
        >
          {req.met ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
          {req.label}
        </li>
      ))}
    </ul>
  </div>

  {/* 비밀번호 확인 */}
  <div>
    <label className="block text-sm font-medium mb-2">비밀번호 확인</label>
    <input
      type="password"
      required
      className="w-full px-4 py-3 border border-br-border rounded-lg focus:ring-2 focus:ring-br-primary-500"
      placeholder="••••••••"
    />
  </div>

  {/* 약관 동의 */}
  <div className="space-y-2">
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        required
        className="mt-0.5 w-4 h-4 text-br-primary-500 border-br-border rounded focus:ring-2 focus:ring-br-primary-500"
      />
      <span className="text-sm">
        <Link href="/terms" className="text-br-primary-600 hover:underline">
          이용약관
        </Link>
        에 동의합니다 (필수)
      </span>
    </label>
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        required
        className="mt-0.5 w-4 h-4 text-br-primary-500 border-br-border rounded focus:ring-2 focus:ring-br-primary-500"
      />
      <span className="text-sm">
        <Link href="/privacy" className="text-br-primary-600 hover:underline">
          개인정보처리방침
        </Link>
        에 동의합니다 (필수)
      </span>
    </label>
  </div>

  {/* 가입 버튼 */}
  <button
    type="submit"
    className="w-full px-4 py-3 bg-br-primary-500 text-white rounded-lg font-medium hover:bg-br-primary-600 disabled:opacity-50 transition-colors"
    disabled={isLoading || !isValid}
  >
    {isLoading ? '가입 중...' : '가입하기'}
  </button>

  {/* 로그인 링크 */}
  <div className="text-center text-sm">
    <span className="text-br-text-secondary">이미 계정이 있나요? </span>
    <Link
      href="/login"
      className="text-br-primary-600 hover:text-br-primary-700 font-medium"
    >
      로그인 →
    </Link>
  </div>
</form>
```

**스타일:**
- 비밀번호 요구사항: 12px (text-xs), 체크 아이콘 12x12px
- 체크박스: 16x16px
- 간격: 20px (space-y-5), 더 촘촘하게

---

## 종합 정리

### 디자인 시스템 체크리스트

- [x] 컬러 팔레트 정의 (브랜드, 프로바이더, 상태)
- [x] 타이포그래피 스케일
- [x] 간격 시스템
- [x] 컴포넌트 토큰 (radius, shadow, transition)
- [x] 반응형 브레이크포인트

### 페이지별 완성도

| 페이지 | 와이어프레임 | 컴포넌트 명세 | 스타일 | 반응형 | 상태 |
|-------|------------|-------------|-------|-------|------|
| 랜딩 페이지 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 모델 가격표 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 문서 페이지 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 플레이그라운드 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 대시보드 | ✅ | ✅ | ✅ | ✅ | ✅ |
| API 키 관리 | ✅ | ✅ | ✅ | - | ✅ |
| 조직 설정 | ✅ | ✅ | ✅ | - | ✅ |
| 결제 페이지 | ✅ | ✅ | ✅ | - | ✅ |
| 로그인 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 회원가입 | ✅ | ✅ | ✅ | ✅ | ✅ |

### 재사용 가능 컴포넌트 목록

**기본 컴포넌트:**
- Button (variant: primary, outline, ghost, danger)
- Input (text, email, password, number)
- Select, Checkbox, Toggle
- Badge, Tag
- Dialog, Popover, DropdownMenu
- Table
- Card

**도메인 컴포넌트:**
- ProviderBadge
- DiscountBadge
- PriceCell
- ModelSelector
- CodeBlock
- ApiEndpoint
- StatCard
- CreditGauge
- UsageChart (Bar, Line)

**레이아웃 컴포넌트:**
- Navigation
- DashboardNav
- DocsSidebar
- TableOfContents
- Footer

### 다크 모드 구현 체크리스트

- [x] CSS 변수 정의 (라이트/다크)
- [x] ThemeProvider 전역 적용
- [x] 모든 컴포넌트에 다크 모드 스타일
- [x] 차트 색상 테마 대응
- [x] 이미지/로고 변형
- [x] 토글 버튼 배치

### 접근성 체크리스트

- [ ] 키보드 네비게이션
- [ ] ARIA 레이블
- [ ] 포커스 인디케이터
- [ ] 색상 대비 (WCAG AA)
- [ ] 스크린 리더 지원

### 성능 최적화

- [ ] 코드 블록 지연 로딩
- [ ] 차트 라이브러리 동적 임포트
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 폰트 최적화 (subset)
- [ ] CSS 트리 쉐이킹

---

**문서 작성 완료: 2026-03-03**
