import type { Assistant, ModelUsage, Subscription, Conversation, DocProject, OCRJob } from './types';

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

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    title: '프로젝트 기획 회의 정리',
    messages: [
      { id: 'm1', role: 'user', content: '오늘 기획 회의 내용 정리해줘', timestamp: '2026-03-03T09:00:00Z' },
      { id: 'm2', role: 'assistant', content: '네, 회의 내용을 정리해드리겠습니다.', timestamp: '2026-03-03T09:00:05Z', assistantId: 'a1' },
    ],
    assistantId: 'a1',
    createdAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-03T09:00:05Z',
  },
  {
    id: 'c2',
    title: '영문 이메일 작성',
    messages: [
      { id: 'm3', role: 'user', content: '거래처에 보낼 영문 이메일 작성해줘', timestamp: '2026-03-02T14:00:00Z' },
      { id: 'm4', role: 'assistant', content: 'Subject: Follow-up on Our Recent Meeting...', timestamp: '2026-03-02T14:00:05Z', assistantId: 'a8' },
    ],
    assistantId: 'a8',
    createdAt: '2026-03-02T14:00:00Z',
    updatedAt: '2026-03-02T14:00:05Z',
  },
  {
    id: 'c3',
    title: '분기 보고서 데이터 분석',
    messages: [],
    assistantId: 'a7',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
];

export const mockDocProjects: DocProject[] = [
  { id: 'd1', name: '2026년 상반기 사업계획서', docType: 'DOCX', lastModified: '2026-03-01', step: 4 },
  { id: 'd2', name: 'AI 도입 제안서', docType: 'HWP', lastModified: '2026-02-28', step: 5 },
];

export const mockOCRJobs: OCRJob[] = [
  { id: 'o1', fileName: '영수증_001.jpg', status: 'completed', resultUrl: '#' },
  { id: 'o2', fileName: '사업자등록증.png', status: 'completed', resultUrl: '#' },
  { id: 'o3', fileName: '계약서_스캔.pdf', status: 'processing' },
];
