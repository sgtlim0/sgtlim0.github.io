// ER 다이어그램 기반 Mock 데이터

export const overviewKPIs = [
  { label: '총 절감 시간', value: '2,450h', trend: '+12%', trendUp: true },
  { label: '총 비용 절감', value: '₩127M', trend: '+18%', trendUp: true },
  { label: 'ROI', value: '340%', trend: '+45%p', trendUp: true },
  { label: '활성 사용률', value: '78%', trend: '+5%p', trendUp: true },
];

export const adoptionKPIs = [
  { label: '전체 라이선스', value: '280명', trend: '', trendUp: true },
  { label: '활성 사용자', value: '218명', trend: '+15', trendUp: true },
  { label: '비활성 사용자', value: '62명', trend: '-8', trendUp: false },
  { label: '지속 사용률', value: '82%', trend: '+3%p', trendUp: true },
];

export const productivityKPIs = [
  { label: 'AI 지원 총 시간', value: '2,450h', trend: '+320h', trendUp: true },
  { label: '평균 응답속도', value: '1.2초', trend: '-0.3초', trendUp: true },
  { label: '작업당 절감시간', value: '23분', trend: '+4분', trendUp: true },
  { label: '자동화율', value: '45%', trend: '+8%p', trendUp: true },
];

export const sentimentKPIs = [
  { label: 'NPS 점수', value: '+42', trend: '+8', trendUp: true },
  { label: '업무품질 향상', value: '72%', trend: '+5%p', trendUp: true },
  { label: '속도향상 체감', value: '68%', trend: '+3%p', trendUp: true },
  { label: '부담경감 체감', value: '74%', trend: '+6%p', trendUp: true },
];

export const departmentRanking = [
  { department: '개발팀', roi: 520, maxRoi: 520 },
  { department: '마케팅팀', roi: 380, maxRoi: 520 },
  { department: '영업팀', roi: 290, maxRoi: 520 },
  { department: '기획팀', roi: 210, maxRoi: 520 },
  { department: '인사팀', roi: 120, maxRoi: 520 },
];

export const insights = [
  { type: 'positive' as const, title: '개발5팀 사용율 전월 대비 23% 증가', description: '코딩 어시스턴트 교육 이후 활발한 교차 확인 도입 중 (5.0↑)' },
  { type: 'warning' as const, title: 'AI 응답 시간 0.5초 이상인 것으로 판단', description: '모델 변경 시 성능 저하 발생, 피크 시간대 조절 권장 (+13)' },
  { type: 'cost' as const, title: '비용 절감', description: '저비용 모델인 Gemini Flash로 전환하면 비용이 18% 절감될 수 있습니다.' },
];

export const userSegments = [
  { label: '헤비 유저 (주 20회+)', value: 45, maxValue: 100 },
  { label: '보통 유저 (주 5-19회)', value: 30, maxValue: 100 },
  { label: '가벼운 유저 (주 1-4회)', value: 15, maxValue: 100 },
  { label: '비활성 (0회)', value: 10, maxValue: 100 },
];

export const featureAdoption = [
  { label: 'AI 채팅', value: 92 },
  { label: '문서 요약', value: 78 },
  { label: '코드 리뷰', value: 65 },
  { label: '번역', value: 58 },
  { label: '데이터 분석', value: 52 },
  { label: '회의록 작성', value: 45 },
  { label: '이메일 작성', value: 38 },
  { label: '글쓰기 어시스턴트', value: 18 },
];

export const taskTimeSavings = [
  { task: '이메일 작성', manualMin: 25, aiMin: 5, savedPercent: 80 },
  { task: '문서 요약', manualMin: 30, aiMin: 5, savedPercent: 83 },
  { task: '코드 리뷰', manualMin: 45, aiMin: 15, savedPercent: 67 },
  { task: '회의록 요약', manualMin: 20, aiMin: 2, savedPercent: 90 },
  { task: '데이터 분석', manualMin: 60, aiMin: 20, savedPercent: 67 },
  { task: '번역', manualMin: 40, aiMin: 5, savedPercent: 88 },
];

export const roiFlowData = {
  aiCost: '₩37M',
  savedValue: '₩164M',
  netBenefit: '₩127M',
  roiPercent: '340%',
};

export const costBreakdown = [
  { model: 'Claude Sonnet', tokens: '2.4M', cost: '₩15.2M', savings: '₩68M', roi: '347%' },
  { model: 'GPT-4o', tokens: '1.8M', cost: '₩12.1M', savings: '₩52M', roi: '330%' },
  { model: 'Gemini Pro', tokens: '1.2M', cost: '₩5.8M', savings: '₩28M', roi: '383%' },
  { model: 'Claude Haiku', tokens: '3.6M', cost: '₩3.9M', savings: '₩16M', roi: '310%' },
];

export const heatmapData = [
  { dept: '개발팀', usage: '95%', time: '520h', roi: '520%', satisfaction: '4.5', levels: ['high', 'high', 'high', 'high'] as const },
  { dept: '마케팅팀', usage: '88%', time: '320h', roi: '380%', satisfaction: '4.2', levels: ['high', 'mid', 'high', 'high'] as const },
  { dept: '영업팀', usage: '72%', time: '280h', roi: '290%', satisfaction: '3.8', levels: ['mid', 'mid', 'mid', 'mid'] as const },
  { dept: '기획팀', usage: '65%', time: '220h', roi: '210%', satisfaction: '3.5', levels: ['mid', 'mid', 'mid', 'mid'] as const },
  { dept: '인사팀', usage: '42%', time: '120h', roi: '120%', satisfaction: '3.2', levels: ['low', 'low', 'low', 'mid'] as const },
];

export const gradeUsage = [
  { label: '임원', value: 35, maxValue: 100 },
  { label: '팀장', value: 72, maxValue: 100 },
  { label: '대리', value: 88, maxValue: 100 },
  { label: '사원', value: 95, maxValue: 100 },
];

export const surveyItems = [
  { label: 'AI가 업무 품질 향상에 도움', value: 72 },
  { label: '단순 반복 작업 부담 경감', value: 74 },
  { label: '작업 완료 속도 향상', value: 68 },
  { label: '전반적 생산성 향상 체감', value: 70 },
  { label: '동료에게 추천하겠다', value: 72 },
];

export const improvementRequests = [
  { rank: 1, text: '한국어 응답 품질 개선', count: 42 },
  { rank: 2, text: '응답 속도 개선', count: 38 },
  { rank: 3, text: '파일 첨부 크기 제한 확대', count: 25 },
  { rank: 4, text: '프롬프트 템플릿 확대', count: 22 },
  { rank: 5, text: '오프라인 모드 지원', count: 15 },
];

export const reportList = [
  { title: '2026년 2월 월간 AI 생산성 리포트', date: '2026.03.01', type: '자동 생성', pages: 12, isLatest: true },
  { title: '2026년 1월 월간 AI 생산성 리포트', date: '2026.02.01', type: '자동 생성', pages: 11, isLatest: false },
  { title: '2025년 4분기 비교 리포트', date: '2026.01.15', type: '커스텀', pages: 8, isLatest: false },
  { title: '2025년 12월 월간 AI 생산성 리포트', date: '2026.01.01', type: '자동 생성', pages: 10, isLatest: false },
];

// === 차트 시계열 데이터 ===

export const monthlyTimeSavings = [
  { month: '9월', hours: 320 },
  { month: '10월', hours: 480 },
  { month: '11월', hours: 720 },
  { month: '12월', hours: 1050 },
  { month: '1월', hours: 1680 },
  { month: '2월', hours: 2450 },
];

export const modelCostEfficiency = [
  { name: 'Claude Sonnet', value: 45, color: 'var(--roi-chart-1)' },
  { name: 'GPT-4o', value: 30, color: 'var(--roi-chart-2)' },
  { name: 'Gemini Pro', value: 17, color: 'var(--roi-chart-3)' },
  { name: 'Claude Haiku', value: 8, color: 'var(--roi-chart-4)' },
];

export const weeklyActiveUsers = [
  { week: 'W1', count: 145 },
  { week: 'W2', count: 152 },
  { week: 'W3', count: 158 },
  { week: 'W4', count: 165 },
  { week: 'W5', count: 170 },
  { week: 'W6', count: 178 },
  { week: 'W7', count: 185 },
  { week: 'W8', count: 192 },
  { week: 'W9', count: 198 },
  { week: 'W10', count: 205 },
  { week: 'W11', count: 212 },
  { week: 'W12', count: 218 },
];

export const weeklyAIHours = [
  { week: 'W1', hours: 120 },
  { week: 'W2', hours: 135 },
  { week: 'W3', hours: 150 },
  { week: 'W4', hours: 168 },
  { week: 'W5', hours: 175 },
  { week: 'W6', hours: 190 },
  { week: 'W7', hours: 205 },
  { week: 'W8', hours: 215 },
  { week: 'W9', hours: 228 },
  { week: 'W10', hours: 240 },
  { week: 'W11', hours: 255 },
  { week: 'W12', hours: 270 },
];

export const featureSavingsRatio = [
  { name: '코드 리뷰', percent: 28, color: 'var(--roi-chart-1)' },
  { name: '문서 요약', percent: 22, color: 'var(--roi-chart-2)' },
  { name: '번역', percent: 18, color: 'var(--roi-chart-3)' },
  { name: '이메일 작성', percent: 14, color: 'var(--roi-chart-4)' },
  { name: '데이터 분석', percent: 12, color: 'var(--roi-chart-5)' },
  { name: '기타', percent: 6, color: 'var(--roi-divider)' },
];

export const monthlyROI = [
  { month: '9월', roi: 180 },
  { month: '10월', roi: 220 },
  { month: '11월', roi: 260 },
  { month: '12월', roi: 290 },
  { month: '1월', roi: 310 },
  { month: '2월', roi: 340 },
];

export const cumulativeSavings = [
  { month: '9월', amount: 18 },
  { month: '10월', amount: 38 },
  { month: '11월', amount: 62 },
  { month: '12월', amount: 85 },
  { month: '1월', amount: 108 },
  { month: '2월', amount: 127 },
];

export const modelUsageRatio = [
  { name: 'Claude Sonnet', percent: 38, color: 'var(--roi-chart-1)' },
  { name: 'GPT-4o', percent: 25, color: 'var(--roi-chart-2)' },
  { name: 'Gemini Pro', percent: 18, color: 'var(--roi-chart-3)' },
  { name: 'Claude Haiku', percent: 12, color: 'var(--roi-chart-4)' },
  { name: '기타', percent: 7, color: 'var(--roi-chart-5)' },
];

export const npsHistory = [
  { month: '9월', score: 22 },
  { month: '10월', score: 28 },
  { month: '11월', score: 32 },
  { month: '12월', score: 35 },
  { month: '1월', score: 38 },
  { month: '2월', score: 42 },
];

export const deptSatisfaction = [
  { dept: '개발팀', values: [88, 92, 85, 90, 87] },
  { dept: '마케팅팀', values: [78, 75, 80, 72, 76] },
  { dept: '영업팀', values: [65, 70, 68, 60, 62] },
  { dept: '기획팀', values: [72, 68, 74, 65, 70] },
  { dept: '인사팀', values: [55, 58, 60, 52, 50] },
];

export const satisfactionAxes = ['업무품질', '속도향상', '부담경감', '정확성', '추천의향'];
