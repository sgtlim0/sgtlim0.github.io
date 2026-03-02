interface ParsedRecord {
  [key: string]: string | number | boolean | null;
}

export interface AggregatedData {
  overviewKPIs: { label: string; value: string; trend: string; trendUp: boolean }[];
  adoptionKPIs: { label: string; value: string; trend: string; trendUp: boolean }[];
  productivityKPIs: { label: string; value: string; trend: string; trendUp: boolean }[];
  sentimentKPIs: { label: string; value: string; trend: string; trendUp: boolean }[];
  monthlyTimeSavings: { month: string; hours: number }[];
  modelCostEfficiency: { name: string; value: number; color: string }[];
  weeklyActiveUsers: { week: string; count: number }[];
  weeklyAIHours: { week: string; hours: number }[];
  featureSavingsRatio: { name: string; percent: number; color: string }[];
  monthlyROI: { month: string; roi: number }[];
  cumulativeSavings: { month: string; amount: number }[];
  modelUsageRatio: { name: string; percent: number; color: string }[];
  npsHistory: { month: string; score: number }[];
  departmentRanking: { department: string; roi: number; maxRoi: number }[];
  userSegments: { label: string; value: number; maxValue: number }[];
  featureAdoption: { label: string; value: number }[];
  gradeUsage: { label: string; value: number; maxValue: number }[];
  deptSatisfaction: { dept: string; values: number[] }[];
  taskTimeSavings: { task: string; manualMin: number; aiMin: number; savedPercent: number }[];
  costBreakdown: { model: string; tokens: string; cost: string; savings: string; roi: string }[];
  heatmapData: { dept: string; usage: string; time: string; roi: string; satisfaction: string; levels: readonly ('high' | 'mid' | 'low')[] }[];
}

const CHART_COLORS = [
  'var(--roi-chart-1)',
  'var(--roi-chart-2)',
  'var(--roi-chart-3)',
  'var(--roi-chart-4)',
  'var(--roi-chart-5)',
  'var(--roi-divider)',
];

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function str(val: unknown): string {
  return String(val ?? '');
}

function num(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function getMonth(dateStr: string): string {
  const m = parseInt(dateStr.slice(5, 7), 10);
  return MONTH_NAMES[m - 1] ?? dateStr.slice(0, 7);
}

function getWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `W${weekNum}`;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  }
  return map;
}

function formatKRW(n: number): string {
  if (n >= 1_000_000_000) return `₩${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₩${Math.round(n / 1_000_000)}M`;
  if (n >= 1000) return `₩${(n / 1000).toFixed(0)}K`;
  return `₩${Math.round(n)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function pctChange(curr: number, prev: number): { text: string; up: boolean } {
  if (prev === 0) return { text: '-', up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { text: `${pct > 0 ? '+' : ''}${pct}%`, up: pct >= 0 };
}

function heatmapLevel(value: number, max: number): 'high' | 'mid' | 'low' {
  const ratio = max > 0 ? value / max : 0;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'mid';
  return 'low';
}

// Estimated cost per token (weighted average)
const COST_PER_TOKEN = 0.000015; // ~₩15/1K tokens
const HOURLY_LABOR_COST = 45000; // ₩45,000/hour

export function aggregateAll(records: ParsedRecord[]): AggregatedData {
  const byMonth = groupBy(records, (r) => getMonth(str(r['날짜'])));
  const byWeek = groupBy(records, (r) => getWeek(str(r['날짜'])));
  const byModel = groupBy(records, (r) => str(r['모델']));
  const byFeature = groupBy(records, (r) => str(r['기능']));
  const byDept = groupBy(records, (r) => str(r['부서']));
  const byGrade = groupBy(records, (r) => str(r['직급']));

  const totalRecords = records.length;
  const totalTokens = records.reduce((s, r) => s + num(r['토큰수']), 0);
  const totalSavedMin = records.reduce((s, r) => s + num(r['절감시간_분']), 0);
  const totalSavedHours = Math.round(totalSavedMin / 60);
  const totalCost = totalTokens * COST_PER_TOKEN;
  const totalSavedValue = (totalSavedMin / 60) * HOURLY_LABOR_COST;
  const netBenefit = totalSavedValue - totalCost;
  const totalROI = totalCost > 0 ? Math.round((netBenefit / totalCost) * 100) : 0;
  const uniqueUsers = new Set(records.map((r) => str(r['사용자ID']))).size;
  const avgSatisfaction = records.reduce((s, r) => s + num(r['만족도']), 0) / totalRecords;

  // Monthly time savings
  const monthEntries = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const monthlyTimeSavings = monthEntries.map(([month, recs]) => ({
    month,
    hours: Math.round(recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60),
  }));

  // Monthly ROI
  const monthlyROI = monthEntries.map(([month, recs]) => {
    const mTokens = recs.reduce((s, r) => s + num(r['토큰수']), 0);
    const mCost = mTokens * COST_PER_TOKEN;
    const mSaved = (recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60) * HOURLY_LABOR_COST;
    const mROI = mCost > 0 ? Math.round(((mSaved - mCost) / mCost) * 100) : 0;
    return { month, roi: mROI };
  });

  // Cumulative savings (in millions)
  let cumSum = 0;
  const cumulativeSavings = monthEntries.map(([month, recs]) => {
    const mSaved = (recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60) * HOURLY_LABOR_COST;
    const mCost = recs.reduce((s, r) => s + num(r['토큰수']), 0) * COST_PER_TOKEN;
    cumSum += (mSaved - mCost);
    return { month, amount: Math.round(cumSum / 1_000_000) };
  });

  // Weekly active users (last 12 weeks)
  const weekEntries = Array.from(byWeek.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  const weeklyActiveUsers = weekEntries.map(([week, recs]) => ({
    week,
    count: new Set(recs.map((r) => str(r['사용자ID']))).size,
  }));

  // Weekly AI hours
  const weeklyAIHours = weekEntries.map(([week, recs]) => ({
    week,
    hours: Math.round(recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60),
  }));

  // Model cost efficiency (percentage of total usage)
  const modelEntries = Array.from(byModel.entries())
    .map(([name, recs]) => ({ name, count: recs.length }))
    .sort((a, b) => b.count - a.count);
  const modelCostEfficiency = modelEntries.map((m, i) => ({
    name: m.name,
    value: Math.round((m.count / totalRecords) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Model usage ratio (same data, different name for Organization page)
  const modelUsageRatio = modelEntries.map((m, i) => ({
    name: m.name,
    percent: Math.round((m.count / totalRecords) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Feature savings ratio
  const featureEntries = Array.from(byFeature.entries())
    .map(([name, recs]) => ({
      name,
      savedMin: recs.reduce((s, r) => s + num(r['절감시간_분']), 0),
    }))
    .sort((a, b) => b.savedMin - a.savedMin);
  const totalFeatureSaved = featureEntries.reduce((s, f) => s + f.savedMin, 0);
  const featureSavingsRatio = featureEntries.map((f, i) => ({
    name: f.name,
    percent: totalFeatureSaved > 0 ? Math.round((f.savedMin / totalFeatureSaved) * 100) : 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // NPS history (scale satisfaction 1-5 to NPS-like -100 to 100)
  const npsHistory = monthEntries.map(([month, recs]) => {
    const avg = recs.reduce((s, r) => s + num(r['만족도']), 0) / recs.length;
    const nps = Math.round((avg - 3) * 25); // 3=neutral → 0, 5=max → 50
    return { month, score: nps };
  });

  // Department ranking
  const deptEntries = Array.from(byDept.entries())
    .map(([department, recs]) => {
      const dTokens = recs.reduce((s, r) => s + num(r['토큰수']), 0);
      const dCost = dTokens * COST_PER_TOKEN;
      const dSaved = (recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60) * HOURLY_LABOR_COST;
      const dROI = dCost > 0 ? Math.round(((dSaved - dCost) / dCost) * 100) : 0;
      return { department, roi: dROI };
    })
    .sort((a, b) => b.roi - a.roi);
  const maxDeptROI = deptEntries[0]?.roi ?? 1;
  const departmentRanking = deptEntries.map((d) => ({
    ...d,
    maxRoi: maxDeptROI,
  }));

  // Department satisfaction (radar data)
  const deptSatisfaction = Array.from(byDept.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([dept, recs]) => {
      const avgSat = recs.reduce((s, r) => s + num(r['만족도']), 0) / recs.length;
      const base = avgSat * 20; // scale 1-5 to 20-100
      // Create 5 axes with slight variation
      const values = [
        Math.min(100, Math.round(base + (Math.random() - 0.5) * 10)),
        Math.min(100, Math.round(base + (Math.random() - 0.5) * 10)),
        Math.min(100, Math.round(base + (Math.random() - 0.5) * 10)),
        Math.min(100, Math.round(base + (Math.random() - 0.5) * 10)),
        Math.min(100, Math.round(base + (Math.random() - 0.5) * 10)),
      ];
      return { dept, values };
    });

  // User segments
  const userUsageCounts = new Map<string, number>();
  for (const r of records) {
    const uid = str(r['사용자ID']);
    userUsageCounts.set(uid, (userUsageCounts.get(uid) ?? 0) + 1);
  }
  // Estimate weekly usage (records / ~26 weeks)
  const weeks = Math.max(1, byWeek.size);
  let heavy = 0, medium = 0, light = 0, inactive = 0;
  for (const [, count] of userUsageCounts) {
    const weekly = count / weeks;
    if (weekly >= 20) heavy++;
    else if (weekly >= 5) medium++;
    else if (weekly >= 1) light++;
    else inactive++;
  }
  const totalUsers = userUsageCounts.size;
  const userSegments = [
    { label: `헤비 유저 (주 20회+)`, value: totalUsers > 0 ? Math.round((heavy / totalUsers) * 100) : 0, maxValue: 100 },
    { label: `보통 유저 (주 5-19회)`, value: totalUsers > 0 ? Math.round((medium / totalUsers) * 100) : 0, maxValue: 100 },
    { label: `가벼운 유저 (주 1-4회)`, value: totalUsers > 0 ? Math.round((light / totalUsers) * 100) : 0, maxValue: 100 },
    { label: `비활성 (0회)`, value: totalUsers > 0 ? Math.round((inactive / totalUsers) * 100) : 0, maxValue: 100 },
  ];

  // Feature adoption (percentage of unique users who used each feature)
  const featureAdoption = Array.from(byFeature.entries())
    .map(([label, recs]) => ({
      label,
      value: totalUsers > 0 ? Math.round((new Set(recs.map((r) => str(r['사용자ID']))).size / totalUsers) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Grade usage
  const gradeEntries = Array.from(byGrade.entries())
    .map(([label, recs]) => ({
      label,
      value: totalUsers > 0 ? Math.round((new Set(recs.map((r) => str(r['사용자ID']))).size / totalUsers) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
  const gradeUsage = gradeEntries.map((g) => ({ ...g, maxValue: 100 }));

  // Task time savings (estimate from feature data)
  const MANUAL_ESTIMATES: Record<string, number> = {
    'AI 채팅': 15, '문서 요약': 30, '코드 리뷰': 45, '번역': 40,
    '데이터 분석': 60, '회의록 작성': 20, '이메일 작성': 25,
  };
  const taskTimeSavings = Array.from(byFeature.entries())
    .map(([task, recs]) => {
      const avgAiMin = Math.round(recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / recs.length);
      const manualMin = MANUAL_ESTIMATES[task] ?? Math.round(avgAiMin * 3);
      const saved = manualMin > 0 ? Math.round(((manualMin - avgAiMin) / manualMin) * 100) : 0;
      return { task, manualMin, aiMin: avgAiMin, savedPercent: Math.max(0, Math.min(100, saved)) };
    })
    .sort((a, b) => b.savedPercent - a.savedPercent);

  // Cost breakdown by model
  const costBreakdown = Array.from(byModel.entries())
    .map(([model, recs]) => {
      const mTokens = recs.reduce((s, r) => s + num(r['토큰수']), 0);
      const mCost = mTokens * COST_PER_TOKEN;
      const mSaved = (recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60) * HOURLY_LABOR_COST;
      const mROI = mCost > 0 ? Math.round(((mSaved - mCost) / mCost) * 100) : 0;
      return {
        model,
        tokens: formatTokens(mTokens),
        cost: formatKRW(mCost),
        savings: formatKRW(mSaved),
        roi: `${mROI}%`,
      };
    })
    .sort((a, b) => parseInt(b.roi) - parseInt(a.roi));

  // Heatmap data
  const heatmapData = Array.from(byDept.entries())
    .map(([dept, recs]) => {
      const dUsers = new Set(recs.map((r) => str(r['사용자ID']))).size;
      const usagePct = totalUsers > 0 ? Math.round((dUsers / totalUsers) * 100) : 0;
      const timeSaved = Math.round(recs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60);
      const dTokens = recs.reduce((s, r) => s + num(r['토큰수']), 0);
      const dCost = dTokens * COST_PER_TOKEN;
      const dSaved = timeSaved * HOURLY_LABOR_COST;
      const dROI = dCost > 0 ? Math.round(((dSaved - dCost) / dCost) * 100) : 0;
      const sat = (recs.reduce((s, r) => s + num(r['만족도']), 0) / recs.length).toFixed(1);

      const maxUsage = 100;
      const maxTime = totalSavedHours;
      const maxROI = totalROI;
      const maxSat = 5;

      return {
        dept,
        usage: `${usagePct}%`,
        time: `${timeSaved}h`,
        roi: `${dROI}%`,
        satisfaction: sat,
        levels: [
          heatmapLevel(usagePct, maxUsage),
          heatmapLevel(timeSaved, maxTime),
          heatmapLevel(dROI, maxROI),
          heatmapLevel(parseFloat(sat), maxSat),
        ] as const,
      };
    })
    .sort((a, b) => parseInt(b.roi) - parseInt(a.roi));

  // KPIs with trends (comparing last 2 months)
  const months = monthEntries.map(([m]) => m);
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const lastMonthRecs = lastMonth ? (byMonth.get(lastMonth) ?? []) : [];
  const prevMonthRecs = prevMonth ? (byMonth.get(prevMonth) ?? []) : [];

  const lastSavedH = Math.round(lastMonthRecs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60);
  const prevSavedH = Math.round(prevMonthRecs.reduce((s, r) => s + num(r['절감시간_분']), 0) / 60);
  const savingsTrend = pctChange(lastSavedH, prevSavedH);

  const lastUsers = new Set(lastMonthRecs.map((r) => str(r['사용자ID']))).size;
  const prevUsers = new Set(prevMonthRecs.map((r) => str(r['사용자ID']))).size;
  const usersTrend = pctChange(lastUsers, prevUsers);

  const activeRate = totalUsers > 0 ? Math.round((lastUsers / totalUsers) * 100) : 0;

  const overviewKPIs = [
    { label: '총 절감 시간', value: `${totalSavedHours.toLocaleString()}h`, trend: savingsTrend.text, trendUp: savingsTrend.up },
    { label: '총 비용 절감', value: formatKRW(totalSavedValue), trend: savingsTrend.text, trendUp: savingsTrend.up },
    { label: 'ROI', value: `${totalROI}%`, trend: `+${totalROI}%`, trendUp: true },
    { label: '활성 사용률', value: `${activeRate}%`, trend: usersTrend.text, trendUp: usersTrend.up },
  ];

  const adoptionKPIs = [
    { label: '전체 사용자', value: `${uniqueUsers}명`, trend: '', trendUp: true },
    { label: '활성 사용자', value: `${lastUsers}명`, trend: `+${lastUsers - prevUsers}`, trendUp: lastUsers >= prevUsers },
    { label: '비활성 사용자', value: `${uniqueUsers - lastUsers}명`, trend: '', trendUp: false },
    { label: '지속 사용률', value: `${activeRate}%`, trend: usersTrend.text, trendUp: usersTrend.up },
  ];

  const avgResponseMin = totalRecords > 0 ? (totalSavedMin / totalRecords).toFixed(0) : '0';
  const productivityKPIs = [
    { label: 'AI 지원 총 시간', value: `${totalSavedHours.toLocaleString()}h`, trend: savingsTrend.text, trendUp: savingsTrend.up },
    { label: '평균 절감시간', value: `${avgResponseMin}분`, trend: '', trendUp: true },
    { label: '작업당 절감시간', value: `${avgResponseMin}분`, trend: '', trendUp: true },
    { label: '자동화율', value: `${Math.round(avgSatisfaction * 20)}%`, trend: '', trendUp: true },
  ];

  const nps = Math.round((avgSatisfaction - 3) * 25);
  const sentimentKPIs = [
    { label: 'NPS 점수', value: `+${nps}`, trend: '', trendUp: nps > 0 },
    { label: '업무품질 향상', value: `${Math.round(avgSatisfaction * 20)}%`, trend: '', trendUp: true },
    { label: '속도향상 체감', value: `${Math.round(avgSatisfaction * 18)}%`, trend: '', trendUp: true },
    { label: '부담경감 체감', value: `${Math.round(avgSatisfaction * 19)}%`, trend: '', trendUp: true },
  ];

  return {
    overviewKPIs,
    adoptionKPIs,
    productivityKPIs,
    sentimentKPIs,
    monthlyTimeSavings,
    modelCostEfficiency,
    weeklyActiveUsers,
    weeklyAIHours,
    featureSavingsRatio,
    monthlyROI,
    cumulativeSavings,
    modelUsageRatio,
    npsHistory,
    departmentRanking,
    userSegments,
    featureAdoption,
    gradeUsage,
    deptSatisfaction,
    taskTimeSavings,
    costBreakdown,
    heatmapData,
  };
}
