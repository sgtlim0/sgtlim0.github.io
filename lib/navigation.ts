export interface NavItemConfig {
  title: string;
  slug: string;
  icon: string;
}

export interface NavGroupConfig {
  title: string;
  icon: string;
  items: NavItemConfig[];
}

export type NavEntry = NavItemConfig | NavGroupConfig;

export function isNavGroup(entry: NavEntry): entry is NavGroupConfig {
  return 'items' in entry;
}

export const sidebarNavigation: NavEntry[] = [
  { title: '홈', slug: 'home', icon: 'home' },
  { title: '빠른 시작', slug: 'quickstart', icon: 'rocket' },
  {
    title: 'AI 대화',
    icon: 'chevron-down',
    items: [
      { title: 'AI 채팅', slug: 'chat/ai-chat', icon: 'message-square' },
      { title: '그룹 채팅', slug: 'chat/group-chat', icon: 'users' },
      { title: '크로스 모델 토론', slug: 'chat/debate', icon: 'messages-square' },
      { title: '멀티턴 에이전트', slug: 'chat/agent', icon: 'bot' },
      { title: '대화 기록 관리', slug: 'chat/history', icon: 'clock' },
      { title: '프롬프트 라이브러리', slug: 'chat/prompts', icon: 'library' },
    ],
  },
  {
    title: '도구 & 분석',
    icon: 'chevron-down',
    items: [
      { title: '도구 패널', slug: 'tools/panel', icon: 'wrench' },
      { title: 'YouTube 분석', slug: 'tools/youtube', icon: 'circle-play' },
      { title: 'PDF 채팅', slug: 'tools/pdf', icon: 'file-text' },
      { title: '웹 검색 + RAG', slug: 'tools/web-search', icon: 'search' },
    ],
  },
  {
    title: '브라우저 통합',
    icon: 'chevron-down',
    items: [
      { title: '검색엔진 AI 카드', slug: 'browser/search-card', icon: 'panel-top' },
      { title: '글쓰기 어시스턴트', slug: 'browser/writing-assistant', icon: 'pencil' },
      { title: '스마트 북마크', slug: 'browser/bookmarks', icon: 'bookmark' },
    ],
  },
  {
    title: '설정',
    icon: 'chevron-down',
    items: [
      { title: 'AI 프로바이더', slug: 'settings/providers', icon: 'settings' },
      { title: '모델 가이드', slug: 'settings/models', icon: 'layers' },
      { title: '사용량 추적', slug: 'settings/usage', icon: 'bar-chart-2' },
    ],
  },
  {
    title: '기타',
    icon: 'chevron-down',
    items: [
      { title: 'FAQ', slug: 'faq', icon: 'help-circle' },
      { title: '변경 로그', slug: 'changelog', icon: 'git-branch' },
    ],
  },
];

export const pageOrder: string[] = [
  'home',
  'quickstart',
  'chat/ai-chat',
  'chat/group-chat',
  'chat/debate',
  'chat/agent',
  'chat/history',
  'chat/prompts',
  'tools/panel',
  'tools/youtube',
  'tools/pdf',
  'tools/web-search',
  'browser/search-card',
  'browser/writing-assistant',
  'browser/bookmarks',
  'settings/providers',
  'settings/models',
  'settings/usage',
  'faq',
  'changelog',
];

export function getPageTitle(slug: string): string {
  for (const entry of sidebarNavigation) {
    if (!isNavGroup(entry) && entry.slug === slug) return entry.title;
    if (isNavGroup(entry)) {
      for (const item of entry.items) {
        if (item.slug === slug) return item.title;
      }
    }
  }
  return slug;
}

export function getPrevNext(slug: string): { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null } {
  const idx = pageOrder.indexOf(slug);
  if (idx === -1) return { prev: null, next: null };

  const prev = idx > 0 ? { slug: pageOrder[idx - 1], title: getPageTitle(pageOrder[idx - 1]) } : null;
  const next = idx < pageOrder.length - 1 ? { slug: pageOrder[idx + 1], title: getPageTitle(pageOrder[idx + 1]) } : null;

  return { prev, next };
}

export function getBreadcrumbs(slug: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: '홈', href: '/' }];

  for (const entry of sidebarNavigation) {
    if (isNavGroup(entry)) {
      for (const item of entry.items) {
        if (item.slug === slug) {
          crumbs.push({ label: entry.title, href: '#' });
          crumbs.push({ label: item.title, href: `/${item.slug}` });
          return crumbs;
        }
      }
    } else if (entry.slug === slug && slug !== 'home') {
      crumbs.push({ label: entry.title, href: `/${entry.slug}` });
      return crumbs;
    }
  }

  return crumbs;
}
