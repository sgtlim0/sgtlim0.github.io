'use client';

import {
  Sparkles,
  MessageSquare,
  BarChart3,
  Users,
  BookOpen,
  Rocket,
  Monitor,
  Palette,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface ProjectCard {
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  tags: string[];
  pages: number;
}

const projects: ProjectCard[] = [
  {
    title: 'H Chat Wiki',
    description: '현대차그룹 생성형 AI 서비스 H Chat v3 사용 가이드. 멀티 AI 프로바이더, 크로스 모델 토론, YouTube 분석 등 21가지 기능 문서.',
    url: '/quickstart',
    icon: BookOpen,
    iconColor: 'text-[#002C5F]',
    iconBg: 'bg-[#E8F0FE] dark:bg-[#1E3A5F]',
    tags: ['Next.js', 'Markdown', 'GitHub Pages'],
    pages: 15,
  },
  {
    title: 'HMG 소개 사이트',
    description: 'H Chat 서비스 소개 및 홍보 페이지. 히어로 배너, 기능 카드, 도입 가이드, 대시보드 데모.',
    url: 'https://hchat-hmg.vercel.app',
    icon: Rocket,
    iconColor: 'text-[#002C5F]',
    iconBg: 'bg-[#E0F2FE] dark:bg-[#0C4A6E]',
    tags: ['Next.js', 'Tailwind', 'Vercel'],
    pages: 4,
  },
  {
    title: 'Admin 관리자 패널',
    description: 'AI 생산성 대시보드, 사용 현황, 통계, 사용자 관리, ROI 분석 8개 페이지. SSO, 공급사 관리 포함.',
    url: 'https://hchat-admin.vercel.app',
    icon: BarChart3,
    iconColor: 'text-[#00796B]',
    iconBg: 'bg-[#E0F2F1] dark:bg-[#004D40]',
    tags: ['Next.js', 'ROI 대시보드', 'SVG 차트'],
    pages: 19,
  },
  {
    title: 'User 사용자 앱',
    description: 'AI 채팅, 문서 번역, OCR, 문서 작성, 마이페이지. 스트리밍 응답, 커스텀 비서 생성, 대화 검색.',
    url: 'https://hchat-user.vercel.app',
    icon: MessageSquare,
    iconColor: 'text-[#4F6EF7]',
    iconBg: 'bg-[#EEF2FF] dark:bg-[#312E81]',
    tags: ['Next.js', 'SSE Streaming', '다크모드'],
    pages: 6,
  },
  {
    title: 'Desktop 앱',
    description: 'H Chat 데스크톱 애플리케이션. 네이티브 환경에서 AI 비서 기능을 활용하세요.',
    url: 'https://hchat-desktop.vercel.app',
    icon: Monitor,
    iconColor: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF] dark:bg-[#4C1D95]',
    tags: ['Desktop', 'Electron', 'Vercel'],
    pages: 0,
  },
  {
    title: 'Storybook 컴포넌트',
    description: '전체 UI 컴포넌트 라이브러리. Wiki 13개, Admin 12개, HMG 8개, User 12개 스토리 (53개+).',
    url: 'https://hchat-storybook.vercel.app',
    icon: Palette,
    iconColor: 'text-[#EC4899]',
    iconBg: 'bg-[#FDF2F8] dark:bg-[#831843]',
    tags: ['Storybook 9', 'React', 'Tailwind'],
    pages: 53,
  },
  {
    title: 'LLM Router',
    description: '86개 AI 모델 통합 API 라우터. 모델 가격표, Playground, 대시보드, API 키 관리, 문서.',
    url: 'https://hchat-llm-router.vercel.app',
    icon: Cpu,
    iconColor: 'text-[#6366F1]',
    iconBg: 'bg-[#EEF2FF] dark:bg-[#312E81]',
    tags: ['Next.js', '86 Models', 'API'],
    pages: 10,
  },
];

const stats = [
  { label: '앱', value: '7개' },
  { label: '페이지', value: '60+' },
  { label: '컴포넌트', value: '100+' },
  { label: '디자인 토큰', value: '80+' },
];

export default function HomePage() {
  return (
    <div className="overflow-y-auto h-full">
      {/* Hero */}
      <section className="bg-bg-hero px-6 md:px-20 py-12 md:py-16 flex flex-col items-center gap-5">
        <div className="inline-flex items-center gap-2 bg-bg-page rounded-full px-3.5 py-1.5 border border-border">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[13px] font-medium text-primary">H Chat Platform — 7개 앱 모노레포</span>
        </div>
        <h1 className="text-3xl md:text-[40px] font-extrabold text-text-primary text-center leading-tight">
          H Chat 프로젝트 포트폴리오
        </h1>
        <p className="text-base text-text-secondary text-center leading-relaxed max-w-[640px]">
          현대자동차그룹 생성형 AI 서비스 <strong>H Chat</strong>의 전체 플랫폼입니다.
          <br />
          Wiki, HMG 소개, Admin, User, Desktop, Storybook, LLM Router — 7개 앱을 모노레포로 운영합니다.
        </p>

        {/* Stats */}
        <div className="flex gap-6 md:gap-10 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="px-6 md:px-20 py-4 border-b border-border bg-bg-page">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-text-secondary">
          {['Next.js 16', 'TypeScript 5', 'Tailwind CSS 4', 'Turborepo', 'Storybook 9', 'Vercel', 'GitHub Pages'].map((t) => (
            <span key={t} className="px-3 py-1 rounded-full border border-border bg-bg-page">{t}</span>
          ))}
        </div>
      </section>

      {/* Project Cards */}
      <section className="px-6 md:px-20 py-10 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">배포된 앱</h2>
          <p className="text-[15px] text-text-secondary mt-2">
            각 카드를 클릭하면 배포된 사이트로 이동합니다
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isExternal = p.url.startsWith('http');
            const isDisabled = p.url === '#';
            const Icon = p.icon;

            return (
              <a
                key={p.title}
                href={isDisabled ? undefined : p.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                aria-label={`${p.title} 프로젝트로 이동`}
                className={[
                  'group flex flex-col gap-4 p-6 rounded-xl border border-border bg-bg-page transition-all',
                  isDisabled
                    ? 'opacity-60 cursor-default'
                    : 'hover:border-primary hover:shadow-lg hover:-translate-y-0.5',
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl ${p.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${p.iconColor}`} />
                  </div>
                  {!isDisabled && (
                    <ExternalLink className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  {isDisabled && (
                    <span className="text-[10px] font-medium text-text-secondary bg-bg-hero px-2 py-0.5 rounded-full">배포 예정</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{p.title}</h3>
                  <p className="text-sm text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium text-text-secondary bg-bg-hero px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {p.pages > 0 && (
                    <span className="text-[11px] text-text-secondary tabular-nums">{p.pages}p</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 md:px-20 py-10 bg-bg-hero">
        <h2 className="text-2xl font-bold text-text-primary mb-6">아키텍처</h2>
        <div className="font-mono text-sm text-text-secondary leading-loose bg-bg-page p-6 rounded-xl border border-border overflow-x-auto">
          <pre>{`hchat-wiki/  (npm workspaces + Turborepo)
├── packages/
│   ├── tokens/     ← 디자인 토큰 (80+ CSS 변수, 라이트/다크)
│   └── ui/         ← 공용 컴포넌트 (100+)
│       └── src/
│           ├── hmg/        8개 컴포넌트
│           ├── admin/     22개 컴포넌트
│           ├── roi/        5개 차트 + 8개 페이지
│           ├── user/      12개 컴포넌트
│           ├── llm-router/ 7개 컴포넌트
│           └── i18n/       다국어 지원
├── apps/
│   ├── wiki/        → sgtlim0.github.io
│   ├── hmg/         → hchat-hmg.vercel.app
│   ├── admin/       → hchat-admin.vercel.app
│   ├── user/        → hchat-user.vercel.app
│   ├── llm-router/  → (배포 예정)
│   └── storybook/   → hchat-storybook.vercel.app
└── design/          wiki.pen, design1.pen`}</pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-20 py-8 border-t border-border text-center">
        <p className="text-sm text-text-secondary">
          &copy; 2026 H Chat — Hyundai Motor Group. Built with Next.js, Tailwind CSS, Turborepo.
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <Users className="w-4 h-4 text-text-secondary" />
          <a href="https://github.com/sgtlim0/sgtlim0.github.io" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
