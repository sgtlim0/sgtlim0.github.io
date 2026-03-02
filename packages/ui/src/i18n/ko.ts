export const ko = {
  // GNB menu items
  'nav.service': '서비스 소개',
  'nav.guide': '사용 가이드',
  'nav.dashboard': '대시보드',
  'nav.publications': '자료실',

  // Theme toggle
  'theme.dark': '다크모드',
  'theme.light': '라이트모드',

  // Language
  'lang.korean': '한국어',
  'lang.english': 'English',

  // Home page
  'home.hero.title': 'H Chat 사용 가이드',
  'home.hero.description': '멀티 AI 어시스턴트의 모든 기능을 확인하세요',
  'home.feature.multiProvider.title': '멀티 AI 프로바이더',
  'home.feature.multiProvider.description': 'ChatGPT, Claude, Gemini 등 다양한 AI 모델을 하나의 플랫폼에서 활용하세요',
  'home.feature.crossModel.title': '크로스 모델 토론',
  'home.feature.crossModel.description': '여러 AI 모델이 하나의 주제에 대해 토론하고 최적의 답변을 도출합니다',
  'home.feature.youtube.title': 'YouTube 분석',
  'home.feature.youtube.description': 'YouTube 영상의 핵심 내용을 자동으로 요약하고 분석합니다',
  'home.feature.pdfChat.title': 'PDF 채팅',
  'home.feature.pdfChat.description': 'PDF 문서를 업로드하고 AI와 대화하며 핵심 정보를 추출하세요',
  'home.feature.searchAI.title': '검색 AI 카드',
  'home.feature.searchAI.description': 'AI 기반 검색으로 필요한 정보를 빠르고 정확하게 찾으세요',
  'home.feature.writingAssistant.title': '글쓰기 어시스턴트',
  'home.feature.writingAssistant.description': '보고서, 이메일, 기획서 등 다양한 문서 작성을 AI가 도와드립니다',

  // Publications page
  'publications.hero.title': 'H Chat 발행물',
  'publications.hero.description': '최신 가이드와 릴리즈 노트를 확인하세요',
  'publications.tab.all': '전체',
  'publications.tab.guide': '가이드',
  'publications.tab.release': '릴리즈 노트',
  'publications.tab.tech': '기술 문서',
  'publications.section.guide.title': '사용 가이드',
  'publications.section.guide.description': 'H Chat 사용을 위한 완벽한 가이드 문서입니다',
  'publications.section.release.title': '릴리즈 노트',
  'publications.section.release.description': 'H Chat의 최신 업데이트 내역을 확인하세요',
  'publications.section.tech.title': '기술 문서',
  'publications.section.tech.description': '개발자를 위한 기술 참고 문서입니다',

  // Footer
  'footer.company': '현대자동차그룹',
  'footer.copyright': '© 2024 Hyundai Motor Group. All rights reserved.',
} as const;

export type TranslationKey = keyof typeof ko;
