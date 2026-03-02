'use client';

import Link from 'next/link';
import {
  Sparkles,
  Rocket,
  BookOpen,
  Zap,
  MessagesSquare,
  CirclePlay,
  FileText,
  PanelTop,
  Pencil,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '멀티 AI 프로바이더',
    description: 'AWS Bedrock Claude, OpenAI GPT, Google Gemini를 하나의 인터페이스에서 사용하세요.',
    href: '/settings/providers',
    iconColor: 'text-primary',
    iconBg: 'bg-primary-light',
  },
  {
    icon: MessagesSquare,
    title: '크로스 모델 토론',
    description: '서로 다른 AI 모델 간 3라운드 토론으로 최적의 답변을 도출합니다.',
    href: '/chat/debate',
    iconColor: 'text-accent-emerald',
    iconBg: 'bg-[#F0FDF4] dark:bg-[#064E3B]',
  },
  {
    icon: CirclePlay,
    title: 'YouTube 콘텐츠 분석',
    description: '자막 요약, 타임스탬프, 댓글 감정 분석, 통합 인사이트 리포트 생성.',
    href: '/tools/youtube',
    iconColor: 'text-accent-purple',
    iconBg: 'bg-[#F5F3FF] dark:bg-[#3B0764]',
  },
  {
    icon: FileText,
    title: 'PDF 채팅',
    description: 'PDF 업로드 후 AI와 문서 내용 기반 질의응답을 수행합니다.',
    href: '/tools/pdf',
    iconColor: 'text-warning',
    iconBg: 'bg-[#FFF7ED] dark:bg-[#78350F]',
  },
  {
    icon: PanelTop,
    title: '검색엔진 AI 카드',
    description: 'Google, Bing, Naver 검색 결과에 AI 요약 카드를 자동으로 삽입합니다.',
    href: '/browser/search-card',
    iconColor: 'text-danger',
    iconBg: 'bg-[#FEF2F2] dark:bg-[#7F1D1D]',
  },
  {
    icon: Pencil,
    title: '글쓰기 어시스턴트',
    description: '모든 웹페이지 입력창에 플로팅 툴바로 7가지 AI 텍스트 변환을 지원합니다.',
    href: '/browser/writing-assistant',
    iconColor: 'text-accent-emerald',
    iconBg: 'bg-[#ECFDF5] dark:bg-[#064E3B]',
  },
];

export default function HomePage() {
  return (
    <div className="overflow-y-auto h-full">
      {/* Hero */}
      <section className="bg-bg-hero px-20 py-16 flex flex-col items-center gap-5">
        <div className="inline-flex items-center gap-2 bg-bg-page rounded-full px-3.5 py-1.5 border border-border">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[13px] font-medium text-primary">H Chat v3 출시 — 멀티 AI 프로바이더</span>
        </div>
        <h1 className="text-[40px] font-extrabold text-text-primary text-center">
          H Chat v3 사용 가이드
        </h1>
        <p className="text-base text-text-secondary text-center leading-relaxed max-w-[600px]">
          멀티 AI 프로바이더(Claude, GPT, Gemini) 기반 올인원 브라우저 어시스턴트.
          <br />
          크로스 모델 토론, YouTube 분석, PDF 채팅 등 21가지 기능을 만나보세요.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/quickstart"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-text-white px-6 py-3 rounded-[10px] text-sm font-medium transition-colors"
          >
            <Rocket className="w-4 h-4" />
            빠른 시작
          </Link>
          <Link
            href="/chat/ai-chat"
            className="inline-flex items-center gap-2 border border-border hover:bg-bg-hover px-6 py-3 rounded-[10px] text-sm font-medium text-text-primary transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            기능 둘러보기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-20 py-12 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">주요 기능</h2>
          <p className="text-[15px] text-text-secondary mt-2">
            H Chat v3이 제공하는 핵심 기능을 살펴보세요
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex flex-col gap-3 p-6 rounded-xl bg-bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-[10px] ${f.iconBg} flex items-center justify-center`}>
                <f.icon className={`w-5 h-5 ${f.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
