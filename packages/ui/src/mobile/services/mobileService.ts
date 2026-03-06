import type { MobileChat, MobileAssistant, MobileSetting, MobileNotification } from '../types'

const now = Date.now()
const hour = 3_600_000
const day = 86_400_000

let chatList: MobileChat[] = [
  {
    id: 'mc-1',
    title: '프로젝트 기획서 작성',
    lastMessage: '기획서 초안을 완성했습니다.',
    model: 'H Chat Pro',
    timestamp: now - hour,
    unread: true,
  },
  {
    id: 'mc-2',
    title: '영어 이메일 번역',
    lastMessage: '번역 결과를 확인해주세요.',
    model: 'H Chat',
    timestamp: now - 2 * hour,
    unread: false,
  },
  {
    id: 'mc-3',
    title: 'Python 코드 리뷰',
    lastMessage: '몇 가지 개선 사항이 있습니다.',
    model: 'H Chat Code',
    timestamp: now - 4 * hour,
    unread: true,
  },
  {
    id: 'mc-4',
    title: '주간 보고서 요약',
    lastMessage: '요약본을 작성했습니다.',
    model: 'H Chat Pro',
    timestamp: now - day,
    unread: false,
  },
  {
    id: 'mc-5',
    title: '회의록 정리',
    lastMessage: '핵심 내용을 정리했습니다.',
    model: 'H Chat',
    timestamp: now - day - 3 * hour,
    unread: false,
  },
  {
    id: 'mc-6',
    title: '마케팅 문구 생성',
    lastMessage: '3가지 버전을 준비했습니다.',
    model: 'H Chat Pro',
    timestamp: now - 2 * day,
    unread: false,
  },
  {
    id: 'mc-7',
    title: 'SQL 쿼리 최적화',
    lastMessage: '인덱스 추가를 권장합니다.',
    model: 'H Chat Code',
    timestamp: now - 2 * day,
    unread: false,
  },
  {
    id: 'mc-8',
    title: '고객 응대 스크립트',
    lastMessage: '시나리오별로 정리했습니다.',
    model: 'H Chat',
    timestamp: now - 3 * day,
    unread: false,
  },
  {
    id: 'mc-9',
    title: '데이터 분석 요청',
    lastMessage: '차트와 함께 분석 결과를 보여드립니다.',
    model: 'H Chat Pro',
    timestamp: now - 4 * day,
    unread: false,
  },
  {
    id: 'mc-10',
    title: '일본어 문서 번역',
    lastMessage: '번역이 완료되었습니다.',
    model: 'H Chat',
    timestamp: now - 5 * day,
    unread: false,
  },
]

let assistantList: MobileAssistant[] = [
  {
    id: 'ma-1',
    name: '범용 어시스턴트',
    description: '다양한 질문에 답변하는 기본 AI 비서',
    icon: 'MessageSquare',
    category: '일반',
    model: 'H Chat Pro',
    isFavorite: true,
  },
  {
    id: 'ma-2',
    name: '코드 도우미',
    description: '코드 작성, 리뷰, 디버깅 전문',
    icon: 'Code',
    category: '코딩',
    model: 'H Chat Code',
    isFavorite: true,
  },
  {
    id: 'ma-3',
    name: '글쓰기 코치',
    description: '문서 작성과 교정을 도와주는 비서',
    icon: 'PenTool',
    category: '글쓰기',
    model: 'H Chat Pro',
    isFavorite: false,
  },
  {
    id: 'ma-4',
    name: '번역 전문가',
    description: '다국어 번역 및 현지화 지원',
    icon: 'Languages',
    category: '번역',
    model: 'H Chat',
    isFavorite: false,
  },
  {
    id: 'ma-5',
    name: '데이터 분석가',
    description: '데이터 해석과 시각화 추천',
    icon: 'BarChart3',
    category: '분석',
    model: 'H Chat Pro',
    isFavorite: true,
  },
  {
    id: 'ma-6',
    name: 'API 설계자',
    description: 'REST/GraphQL API 설계 전문',
    icon: 'Webhook',
    category: '코딩',
    model: 'H Chat Code',
    isFavorite: false,
  },
  {
    id: 'ma-7',
    name: '보고서 작성기',
    description: '업무 보고서 자동 생성',
    icon: 'FileText',
    category: '글쓰기',
    model: 'H Chat Pro',
    isFavorite: false,
  },
  {
    id: 'ma-8',
    name: '리서치 봇',
    description: '자료 조사 및 요약 전문',
    icon: 'Search',
    category: '분석',
    model: 'H Chat Pro',
    isFavorite: false,
  },
]

let settingList: MobileSetting[] = [
  // general
  { id: 'ms-1', label: '다크 모드', type: 'toggle', value: false, section: 'general' },
  {
    id: 'ms-2',
    label: '언어',
    type: 'select',
    value: '한국어',
    options: ['한국어', 'English', '日本語'],
    section: 'general',
  },
  {
    id: 'ms-3',
    label: '기본 모델',
    type: 'select',
    value: 'H Chat Pro',
    options: ['H Chat', 'H Chat Pro', 'H Chat Code'],
    section: 'general',
  },
  // notification
  { id: 'ms-4', label: '푸시 알림', type: 'toggle', value: true, section: 'notification' },
  { id: 'ms-5', label: '채팅 알림', type: 'toggle', value: true, section: 'notification' },
  { id: 'ms-6', label: '업데이트 알림', type: 'toggle', value: false, section: 'notification' },
  // privacy
  { id: 'ms-7', label: '대화 기록 저장', type: 'toggle', value: true, section: 'privacy' },
  { id: 'ms-8', label: '사용 데이터 수집', type: 'toggle', value: false, section: 'privacy' },
  { id: 'ms-9', label: '개인정보 처리방침', type: 'link', value: '/privacy', section: 'privacy' },
  // about
  { id: 'ms-10', label: '앱 버전', type: 'link', value: 'v1.0.0', section: 'about' },
  { id: 'ms-11', label: '이용약관', type: 'link', value: '/terms', section: 'about' },
  { id: 'ms-12', label: '오픈소스 라이선스', type: 'link', value: '/licenses', section: 'about' },
]

let notificationList: MobileNotification[] = [
  {
    id: 'mn-1',
    title: '시스템 점검 안내',
    message: '3월 10일 02:00-04:00 시스템 점검이 예정되어 있습니다.',
    timestamp: now - hour,
    read: false,
    type: 'system',
  },
  {
    id: 'mn-2',
    title: '새 메시지',
    message: '코드 도우미가 리뷰 결과를 보냈습니다.',
    timestamp: now - 3 * hour,
    read: false,
    type: 'chat',
  },
  {
    id: 'mn-3',
    title: 'H Chat v2.0 업데이트',
    message: '새로운 기능이 추가되었습니다. 지금 확인해보세요.',
    timestamp: now - day,
    read: true,
    type: 'update',
  },
  {
    id: 'mn-4',
    title: '보안 알림',
    message: '새로운 기기에서 로그인이 감지되었습니다.',
    timestamp: now - 2 * day,
    read: true,
    type: 'system',
  },
  {
    id: 'mn-5',
    title: '주간 리포트',
    message: '이번 주 AI 사용량 리포트가 준비되었습니다.',
    timestamp: now - 3 * day,
    read: true,
    type: 'system',
  },
]

function delay(ms: number = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getChatList(): Promise<readonly MobileChat[]> {
  await delay()
  return [...chatList]
}

export async function getAssistants(): Promise<readonly MobileAssistant[]> {
  await delay()
  return [...assistantList]
}

export async function getSettings(): Promise<readonly MobileSetting[]> {
  await delay()
  return [...settingList]
}

export async function getNotifications(): Promise<readonly MobileNotification[]> {
  await delay()
  return [...notificationList]
}

export async function toggleFavorite(assistantId: string): Promise<void> {
  await delay(100)
  assistantList = assistantList.map((a) =>
    a.id === assistantId ? { ...a, isFavorite: !a.isFavorite } : a,
  )
}

export async function updateSetting(settingId: string, value: boolean | string): Promise<void> {
  await delay(100)
  settingList = settingList.map((s) => (s.id === settingId ? { ...s, value } : s))
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(100)
  notificationList = notificationList.map((n) => (n.id === id ? { ...n, read: true } : n))
}

export async function deleteChat(id: string): Promise<void> {
  await delay(100)
  chatList = chatList.filter((c) => c.id !== id)
}
