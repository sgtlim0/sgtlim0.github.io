'use client';

import { useState, useRef, useCallback } from 'react';
import { read, utils, type WorkBook } from 'xlsx';
import { useROIData } from './ROIDataContext';

interface UploadState {
  status: 'idle' | 'dragging' | 'parsing' | 'done' | 'error';
  fileName?: string;
  recordCount?: number;
  errorMessage?: string;
}

interface ParsedRecord {
  [key: string]: string | number | boolean | null;
}

function generateSampleData(): ParsedRecord[] {
  const departments = ['개발팀', '마케팅팀', '영업팀', '기획팀', '인사팀', 'IT인프라팀', '디자인팀', '재무팀'];
  const models = ['Claude Sonnet', 'GPT-4o', 'Gemini Pro', 'Claude Haiku', 'GPT-4o-mini'];
  const features = ['AI 채팅', '문서 요약', '코드 리뷰', '번역', '데이터 분석', '회의록 작성', '이메일 작성'];
  const grades = ['임원', '팀장', '과장', '대리', '사원'];

  const records: ParsedRecord[] = [];
  const startDate = new Date('2025-09-01');
  const endDate = new Date('2026-02-28');

  for (let i = 0; i < 10433; i++) {
    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const tokens = Math.floor(Math.random() * 8000) + 200;
    const savedMin = Math.floor(Math.random() * 40) + 2;

    records.push({
      날짜: date.toISOString().slice(0, 10),
      사용자ID: `USR-${String(Math.floor(Math.random() * 280) + 1).padStart(4, '0')}`,
      부서: dept,
      직급: grade,
      기능: feature,
      모델: model,
      토큰수: tokens,
      절감시간_분: savedMin,
      만족도: Math.floor(Math.random() * 3) + 3,
    });
  }

  return records.sort((a, b) => String(a['날짜']).localeCompare(String(b['날짜'])));
}

function parseWorkbook(wb: WorkBook): ParsedRecord[] {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return utils.sheet_to_json<ParsedRecord>(sheet);
}

export default function ROIDataUpload() {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setRecords: setGlobalRecords, clearRecords: clearGlobalRecords } = useROIData();

  const processFile = useCallback(async (file: File) => {
    setState({ status: 'parsing', fileName: file.name });
    try {
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: 'array' });
      const data = parseWorkbook(wb);
      if (data.length === 0) {
        setState({ status: 'error', fileName: file.name, errorMessage: '파일에 데이터가 없습니다.' });
        return;
      }
      setRecords(data);
      setGlobalRecords(data);
      setState({ status: 'done', fileName: file.name, recordCount: data.length });
    } catch {
      setState({ status: 'error', fileName: file.name, errorMessage: '파일 파싱에 실패했습니다. Excel 형식을 확인해주세요.' });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, status: 'idle' }));
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, status: 'dragging' }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => (prev.status === 'dragging' ? { ...prev, status: 'idle' } : prev));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSampleLoad = useCallback(() => {
    setState({ status: 'parsing', fileName: '샘플 데이터' });
    // simulate brief processing
    setTimeout(() => {
      const data = generateSampleData();
      setRecords(data);
      setGlobalRecords(data);
      setState({ status: 'done', fileName: '샘플_이용통계_2025Q3-2026Q1.xlsx', recordCount: data.length });
    }, 600);
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle' });
    setRecords([]);
    clearGlobalRecords();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearGlobalRecords]);

  const columns = records.length > 0 ? Object.keys(records[0]) : [];
  const previewRows = records.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">데이터 업로드</h1>

      {/* Upload Card */}
      <div className="p-8 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <div className="flex items-start gap-3 mb-6">
          <span className="material-symbols-rounded text-2xl text-[var(--roi-chart-1)]">upload_file</span>
          <div>
            <h2 className="text-base font-bold text-[var(--roi-text-primary)]">이용 통계 파일 업로드</h2>
            <p className="text-sm text-[var(--roi-text-secondary)] mt-1">
              H Chat에서 다운로드한 이용 통계 Excel 파일을 업로드하세요. 파일은 브라우저 로컬에서만 처리되며, 서버로 전송되지 않습니다.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="파일 업로드 영역"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          className={`flex flex-col items-center justify-center gap-3 py-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            state.status === 'dragging'
              ? 'border-[var(--roi-chart-1)] bg-[var(--roi-chart-1)]/5'
              : state.status === 'parsing'
                ? 'border-[var(--roi-chart-2)] bg-[var(--roi-chart-2)]/5'
                : 'border-[var(--roi-divider)] hover:border-[var(--roi-chart-1)]/50 hover:bg-[var(--roi-body-bg)]'
          }`}
        >
          {state.status === 'parsing' ? (
            <>
              <span className="material-symbols-rounded text-4xl text-[var(--roi-chart-2)] animate-spin">progress_activity</span>
              <p className="text-sm text-[var(--roi-text-secondary)]">파일 분석 중...</p>
            </>
          ) : (
            <>
              <span className="material-symbols-rounded text-4xl text-[var(--roi-text-muted)]">cloud_upload</span>
              <p className="text-sm text-[var(--roi-text-secondary)]">파일을 여기로 드래그하거나 클릭하여 선택하세요</p>
              <p className="text-xs text-[var(--roi-text-muted)]">지원 형식: .xlsx, .xls</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="엑셀 파일 선택"
        />

        {/* Sample Data CTA */}
        <div className="flex items-center gap-4 mt-5 p-4 rounded-lg bg-[var(--roi-chart-1)]/5 border border-[var(--roi-chart-1)]/20">
          <div className="flex items-center gap-2 flex-1">
            <span className="material-symbols-rounded text-lg text-[var(--roi-chart-1)]">lightbulb</span>
            <div>
              <p className="text-sm font-semibold text-[var(--roi-text-primary)]">샘플 데이터로 먼저 체험해보세요!</p>
              <p className="text-xs text-[var(--roi-text-secondary)]">가상의 회사 데이터로 대시보드 기능을 미리 살펴볼 수 있습니다.</p>
            </div>
          </div>
          <button
            onClick={handleSampleLoad}
            aria-label="샘플 데이터 적재"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--roi-chart-1)] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            샘플 데이터 적재
          </button>
        </div>

        {/* Usage Guide */}
        <div className="mt-5 p-4 rounded-lg bg-[var(--roi-body-bg)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-rounded text-base text-[var(--roi-text-secondary)]">help</span>
            <p className="text-xs font-semibold text-[var(--roi-text-primary)]">사용 안내</p>
          </div>
          <ul className="text-xs text-[var(--roi-text-secondary)] space-y-1.5">
            <li>• H Chat 관리자 페이지에서 이용 통계 파일을 다운로드하세요.</li>
            <li>• 여러 기간의 데이터를 순차적으로 업로드 할 수 있습니다.</li>
            <li>• 동일 기간 데이터를 업로드 시 기존 데이터가 업데이트됩니다.</li>
            <li>• 모든 데이터는 브라우저에서만 처리되며, 언제든 삭제할 수 있습니다.</li>
          </ul>
        </div>
      </div>

      {/* Error State */}
      {state.status === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--roi-negative)]/10 border border-[var(--roi-negative)]/20">
          <span className="material-symbols-rounded text-xl text-[var(--roi-negative)]">error</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--roi-text-primary)]">업로드 실패</p>
            <p className="text-xs text-[var(--roi-text-secondary)] mt-0.5">{state.errorMessage}</p>
          </div>
          <button onClick={handleReset} className="text-xs text-[var(--roi-chart-1)] font-semibold" aria-label="다시 시도">
            다시 시도
          </button>
        </div>
      )}

      {/* Success State + Data Preview */}
      {state.status === 'done' && records.length > 0 && (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--roi-positive)]/10 border border-[var(--roi-positive)]/20">
            <span className="material-symbols-rounded text-xl text-[var(--roi-positive)]">check_circle</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--roi-text-primary)]">
                {state.fileName} — {state.recordCount?.toLocaleString()}개 레코드 분석 완료
              </p>
              <p className="text-xs text-[var(--roi-text-secondary)] mt-0.5">
                {columns.length}개 컬럼 감지 · 데이터 미리보기 (상위 10건)
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--roi-divider)] text-[var(--roi-text-secondary)] hover:bg-[var(--roi-body-bg)]"
              aria-label="데이터 초기화"
            >
              초기화
            </button>
          </div>

          {/* Data Table Preview */}
          <div className="rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--roi-divider)] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--roi-text-primary)]">데이터 미리보기</h3>
              <span className="text-xs text-[var(--roi-text-muted)]">
                전체 {state.recordCount?.toLocaleString()}건 중 10건 표시
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--roi-body-bg)]">
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 text-left font-semibold text-[var(--roi-text-secondary)] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-[var(--roi-divider)]">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2 text-[var(--roi-text-primary)] whitespace-nowrap">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatBox
              icon="database"
              label="총 레코드"
              value={`${state.recordCount?.toLocaleString()}건`}
            />
            <StatBox
              icon="view_column"
              label="컬럼 수"
              value={`${columns.length}개`}
            />
            <StatBox
              icon="date_range"
              label="기간"
              value={getDateRange(records)}
            />
            <StatBox
              icon="group"
              label="고유 사용자"
              value={`${getUniqueCount(records, '사용자ID')}명`}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-[var(--roi-text-muted)] py-4">
        &copy; 2026 H Chat - 생산성 대시보드 | 모든 데이터는 브라우저에서만 처리됩니다
      </p>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)] flex items-center gap-3">
      <span className="material-symbols-rounded text-xl text-[var(--roi-chart-1)]">{icon}</span>
      <div>
        <p className="text-xs text-[var(--roi-text-secondary)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--roi-text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function getDateRange(records: ParsedRecord[]): string {
  const dates = records
    .map((r) => String(r['날짜'] ?? ''))
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return '-';
  const first = dates[0]?.slice(0, 7) ?? '';
  const last = dates[dates.length - 1]?.slice(0, 7) ?? '';
  return first === last ? first : `${first} ~ ${last}`;
}

function getUniqueCount(records: ParsedRecord[], key: string): number {
  return new Set(records.map((r) => String(r[key] ?? ''))).size;
}
