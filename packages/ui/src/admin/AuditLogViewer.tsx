'use client';

import { useState } from 'react';
import { Download, Search, ArrowUpDown } from 'lucide-react';
import Pagination from '../Pagination';

interface AuditLog {
  id: string;
  createdAt: string;
  workspaceName: string;
  userName: string;
  email: string;
  event: string;
  eventDetail: string;
  ipAddress: string;
  device: string;
  browser: string;
}

const AUDIT_LOGS: AuditLog[] = [
  { id: '1', createdAt: '2026-03-03T10:28:13Z', workspaceName: '현대자동차', userName: '홍길동', email: 'hong@hyundai.com', event: 'Download', eventDetail: 'Download, monthly_report.xlsx', ipAddress: '10.0.1.23', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '2', createdAt: '2026-03-03T09:15:00Z', workspaceName: '현대자동차', userName: '김철수', email: 'kimcs@hyundai.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.0.1.45', device: 'Windows', browser: 'Edge 121' },
  { id: '3', createdAt: '2026-03-02T18:30:45Z', workspaceName: '현대자동차', userName: '이영희', email: 'lee.yh@hyundai.com', event: 'Upload', eventDetail: 'Upload, project_data.csv', ipAddress: '10.0.2.12', device: 'Macintosh', browser: 'Safari 17' },
  { id: '4', createdAt: '2026-03-02T14:22:30Z', workspaceName: '기아', userName: '최수진', email: 'choisj@kia.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.1.0.88', device: 'Windows', browser: 'Chrome 122' },
  { id: '5', createdAt: '2026-03-02T11:05:12Z', workspaceName: '현대자동차', userName: '박민수', email: 'parkms@hyundai.com', event: 'Download', eventDetail: 'Download, ai_usage_stats.pdf', ipAddress: '10.0.3.67', device: 'Windows', browser: 'Chrome 122' },
  { id: '6', createdAt: '2026-03-01T16:45:00Z', workspaceName: '현대모비스', userName: '정대호', email: 'jung.dh@mobis.com', event: 'Login', eventDetail: 'Login via SSO', ipAddress: '10.2.1.34', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '7', createdAt: '2026-03-01T09:00:00Z', workspaceName: '현대자동차', userName: '홍길동', email: 'hong@hyundai.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.0.1.23', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '8', createdAt: '2026-02-28T17:30:00Z', workspaceName: '현대자동차', userName: '김철수', email: 'kimcs@hyundai.com', event: 'Upload', eventDetail: 'Upload, training_data.json', ipAddress: '10.0.1.45', device: 'Windows', browser: 'Edge 121' },
];

const EVENT_TABS = ['전체', '로그인', '업로드', '다운로드'] as const;

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getEventBadgeColor(event: string): string {
  if (event === 'Login') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (event === 'Upload') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (event === 'Download') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

function filterByEvent(logs: AuditLog[], eventType: string): AuditLog[] {
  if (eventType === '전체') return logs;
  if (eventType === '로그인') return logs.filter(log => log.event === 'Login');
  if (eventType === '업로드') return logs.filter(log => log.event === 'Upload');
  if (eventType === '다운로드') return logs.filter(log => log.event === 'Download');
  return logs;
}

export default function AuditLogViewer() {
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExport = () => {
    alert('Excel 파일을 다운로드합니다.');
  };

  let filtered = filterByEvent(AUDIT_LOGS, activeTab);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(log =>
      log.userName.toLowerCase().includes(q) || log.email.toLowerCase().includes(q)
    );
  }

  if (dateFrom) {
    filtered = filtered.filter(log => log.createdAt >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter(log => log.createdAt <= dateTo + 'T23:59:59Z');
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortNewest) return b.createdAt.localeCompare(a.createdAt);
    return a.createdAt.localeCompare(b.createdAt);
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = sorted.slice(startIndex, endIndex);

  const handleRowClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">감사 로그</h1>
          <p className="text-sm text-text-secondary mt-1">모든 사용자 활동을 추적합니다</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-admin-teal rounded-lg hover:bg-admin-teal/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Excel 다운로드
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-text-secondary">기간</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 px-3 rounded-lg border border-hmg-border bg-admin-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-admin-teal"
          />
          <span className="text-text-secondary">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 px-3 rounded-lg border border-hmg-border bg-admin-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-admin-teal"
          />
        </div>

        {/* Event Type Tabs + Search + Sort */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 p-1 rounded-lg bg-bg-hover">
            {EVENT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-admin-teal text-white font-medium'
                    : 'bg-hmg-bg-section text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="사용자 검색"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-9 pr-4 w-64 rounded-lg border border-hmg-border bg-admin-input-bg text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal"
              />
            </div>

            <button
              onClick={() => setSortNewest(!sortNewest)}
              className="flex items-center gap-2 h-10 px-4 rounded-lg border border-hmg-border bg-admin-input-bg text-text-primary text-sm hover:bg-hmg-bg-surface transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortNewest ? '최신순' : '오래된순'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-hmg-bg-section border-b border-hmg-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">시각</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">사용자</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">이벤트</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">상세</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">IP 주소</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => handleRowClick(log.id)}
                      className="border-b border-hmg-border hover:bg-hmg-bg-surface transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap">{log.userName}</td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{log.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getEventBadgeColor(log.event)}`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{log.eventDetail}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">{log.ipAddress}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-hmg-bg-section/50 border-b border-hmg-border">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex gap-8 text-sm">
                            <div>
                              <span className="text-text-secondary">Device:</span>
                              <span className="ml-2 text-text-primary font-medium">{log.device}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Browser:</span>
                              <span className="ml-2 text-text-primary font-medium">{log.browser}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Workspace:</span>
                              <span className="ml-2 text-text-primary font-medium">{log.workspaceName}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={sorted.length}
        pageSize={itemsPerPage}
        initialPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        showPageSizeSelector={false}
        prevLabel="이전"
        nextLabel="다음"
      />
    </div>
  );
}
