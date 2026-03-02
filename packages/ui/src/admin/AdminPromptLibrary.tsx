'use client';

import { useState } from 'react';
import StatCard from './StatCard';

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: '업무' | '개발' | '마케팅' | '분석';
  author: string;
  usageCount: number;
  rating: number;
  tags: string[];
}

const PROMPTS: Prompt[] = [
  {
    id: '1',
    title: '회의록 작성 도우미',
    description: '회의 내용을 체계적으로 정리하고 액션 아이템을 추출합니다.',
    category: '업무',
    author: '김민수',
    usageCount: 342,
    rating: 4.5,
    tags: ['회의', '문서작성', '요약'],
  },
  {
    id: '2',
    title: '코드 리뷰 가이드',
    description: 'Pull Request를 분석하고 개선점과 보안 이슈를 찾아냅니다.',
    category: '개발',
    author: '박지원',
    usageCount: 278,
    rating: 4.8,
    tags: ['코드리뷰', 'PR', '보안'],
  },
  {
    id: '3',
    title: '마케팅 카피 생성기',
    description: '제품 특징을 바탕으로 매력적인 마케팅 문구를 생성합니다.',
    category: '마케팅',
    author: '이서연',
    usageCount: 195,
    rating: 4.2,
    tags: ['카피라이팅', '광고', 'SNS'],
  },
  {
    id: '4',
    title: '데이터 인사이트 추출',
    description: 'CSV 데이터를 분석하여 핵심 트렌드와 패턴을 찾아냅니다.',
    category: '분석',
    author: '정현우',
    usageCount: 156,
    rating: 4.6,
    tags: ['데이터분석', '통계', '시각화'],
  },
  {
    id: '5',
    title: '이메일 자동 답변',
    description: '고객 문의 이메일을 분석하고 적절한 답변 초안을 작성합니다.',
    category: '업무',
    author: '최유진',
    usageCount: 203,
    rating: 4.1,
    tags: ['이메일', '고객응대', 'CS'],
  },
  {
    id: '6',
    title: 'SQL 쿼리 최적화',
    description: '복잡한 SQL 쿼리를 분석하고 성능 개선 방안을 제안합니다.',
    category: '개발',
    author: '강태희',
    usageCount: 124,
    rating: 4.4,
    tags: ['SQL', '데이터베이스', '성능'],
  },
];

type Category = '전체' | '업무' | '개발' | '마케팅' | '분석';
const CATEGORIES: Category[] = ['전체', '업무', '개발', '마케팅', '분석'];

function renderRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  return '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(emptyStars);
}

export default function AdminPromptLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category>('전체');

  const filteredPrompts = activeCategory === '전체'
    ? PROMPTS
    : PROMPTS.filter((p) => p.category === activeCategory);

  const totalUsage = PROMPTS.reduce((sum, p) => sum + p.usageCount, 0);
  const avgRating = PROMPTS.reduce((sum, p) => sum + p.rating, 0) / PROMPTS.length;
  const uniqueAuthors = new Set(PROMPTS.map((p) => p.author)).size;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">프롬프트 라이브러리</h1>
        <p className="text-sm text-text-secondary mt-1">조직 내 공유 프롬프트 템플릿 관리</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="등록 프롬프트" value={`${PROMPTS.length}개`} />
        <StatCard label="이번 달 사용" value={`${(totalUsage / 1000).toFixed(1)}K건`} trend="+12.3%" trendUp />
        <StatCard label="평균 평점" value={`${avgRating.toFixed(1)}/5.0`} trend="+0.2" trendUp />
        <StatCard label="활성 기여자" value={`${uniqueAuthors}명`} trend="+2명" trendUp />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 border-b border-admin-border overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'text-admin-teal border-b-2 border-admin-teal'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="p-5 rounded-xl bg-admin-bg-card border border-admin-border flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-primary">{prompt.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{prompt.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-teal/10 text-admin-teal shrink-0">
                {prompt.category}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-admin-bg-section text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-admin-border">
              <span className="text-sm text-text-secondary">작성자: {prompt.author}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary tabular-nums">{prompt.usageCount}회 사용</span>
                <span className="text-sm text-[#F59E0B] tabular-nums">
                  {renderRating(prompt.rating)} {prompt.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="flex items-center justify-center py-12 text-text-secondary">
          해당 카테고리에 등록된 프롬프트가 없습니다.
        </div>
      )}
    </div>
  );
}
