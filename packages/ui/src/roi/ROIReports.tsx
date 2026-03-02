'use client';

import { useState } from 'react';
import { reportList } from './mockData';

export default function ROIReports() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = reportList[selectedIdx];

  const handleDownload = () => {
    window.alert('PDF 다운로드 준비중');
  };

  const handleEmail = () => {
    window.alert('이메일 발송 준비중');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">리포트</h1>
        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--roi-chart-1)] text-white hover:opacity-90 transition-opacity">
          + 새 리포트
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Report List */}
        <div className="col-span-3 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)]">생성된 리포트</h3>
          {reportList.map((report, idx) => (
            <button
              key={report.title}
              onClick={() => setSelectedIdx(idx)}
              aria-label={`리포트 선택: ${report.title}`}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer text-left w-full ${
                idx === selectedIdx
                  ? 'bg-[var(--roi-chart-1)]/5 border-[var(--roi-chart-1)]/30'
                  : 'bg-[var(--roi-card-bg)] border-[var(--roi-card-border)] hover:bg-[var(--roi-body-bg)]'
              }`}
            >
              <span className={`material-symbols-rounded text-2xl ${idx === selectedIdx ? 'text-[var(--roi-chart-1)]' : 'text-[var(--roi-text-secondary)]'}`}>
                picture_as_pdf
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--roi-text-primary)] truncate">{report.title}</p>
                <p className="text-xs text-[var(--roi-text-secondary)] mt-0.5">
                  {report.date} {report.type} · PDF · {report.pages}페이지
                </p>
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className={`material-symbols-rounded text-xl ${idx === selectedIdx ? 'text-[var(--roi-chart-1)]' : 'text-[var(--roi-text-secondary)]'}`}
                role="button"
                aria-label={`${report.title} 다운로드`}
              >
                download
              </span>
            </button>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="col-span-2 p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)]">리포트 미리보기</h3>

          {/* Cover */}
          <div className="rounded-lg bg-[#002C5F] p-6 text-center flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-[#00AAD2] tracking-widest">H Chat</p>
            <p className="text-lg font-bold text-white">{selected.type === '커스텀' ? '비교 리포트' : '월간 AI 생산성 리포트'}</p>
            <p className="text-sm text-white/70">{selected.title.replace(/월간 AI 생산성 리포트|비교 리포트/, '').trim()}</p>
          </div>

          <hr className="border-[var(--roi-divider)]" />

          <div>
            <p className="text-xs font-semibold text-[var(--roi-text-primary)] mb-2">핵심 요약</p>
            <ul className="text-xs text-[var(--roi-text-secondary)] space-y-1">
              <li>• 총 절감 시간: 2,450시간 (▲12%)</li>
              <li>• ROI: 340% (▲45%p)</li>
              <li>• 활성 사용률: 78% (▲5%p)</li>
              <li>• 총 비용 절감: ₩127M</li>
            </ul>
          </div>

          <p className="text-xs text-[var(--roi-text-muted)]">{selected.pages}페이지 · {selected.date}</p>

          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleDownload}
              aria-label="PDF 다운로드"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--roi-chart-1)] text-white text-xs font-semibold"
            >
              <span className="material-symbols-rounded text-base">download</span>
              PDF 다운로드
            </button>
            <button
              onClick={handleEmail}
              aria-label="이메일 발송"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[var(--roi-chart-1)] text-[var(--roi-chart-1)] text-xs font-semibold"
            >
              <span className="material-symbols-rounded text-base">mail</span>
              이메일 발송
            </button>
          </div>

          {/* Schedule */}
          <div className="p-4 rounded-lg bg-[var(--roi-body-bg)]">
            <p className="text-xs font-semibold text-[var(--roi-text-primary)] mb-3">이메일 예약 발송</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--roi-text-secondary)] w-14">주기</span>
                <span className="flex-1 text-xs px-3 py-1.5 rounded border border-[var(--roi-divider)] text-[var(--roi-text-primary)]">월간 (매월 1일)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--roi-text-secondary)] w-14">수신자</span>
                <span className="flex-1 text-xs px-3 py-1.5 rounded border border-[var(--roi-divider)] text-[var(--roi-text-primary)]">경영진 (5명)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
