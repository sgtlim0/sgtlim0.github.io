'use client';

import { useState, useCallback } from 'react';
import { Download, Info } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import FileUploadZone from '../components/FileUploadZone';
import { mockOCRJobs } from '../services/mockData';
import type { OCRJob } from '../services/types';

type OCRMode = 'extract' | 'translate';

const STEPS = [
  { label: '이미지 파일 업로드' },
  { label: '추출/번역' },
];

const statusLabel: Record<OCRJob['status'], string> = {
  uploading: '업로드 중',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
};

const statusBadgeClass: Record<OCRJob['status'], string> = {
  uploading: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const MODE_CONFIG: Record<OCRMode, { label: string; maxFiles: number; desc: string }> = {
  extract: {
    label: '텍스트 추출',
    maxFiles: 5,
    desc: '이미지에서 텍스트를 추출합니다. 최대 5장까지 업로드할 수 있습니다.',
  },
  translate: {
    label: '번역',
    maxFiles: 20,
    desc: '이미지에서 텍스트를 추출 후 번역합니다. 최대 20장까지 업로드할 수 있습니다.',
  },
};

export default function OCRPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<OCRMode>('extract');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [ocrJobs, setOcrJobs] = useState<OCRJob[]>(mockOCRJobs);

  const config = MODE_CONFIG[mode];

  const handleUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
  }, []);

  const handleStartOCR = useCallback(() => {
    if (uploadedFiles.length === 0) return;

    const jobs: OCRJob[] = uploadedFiles.map((file, i) => ({
      id: `ocr-${Date.now()}-${i}`,
      fileName: file.name,
      status: 'processing' as const,
    }));

    setOcrJobs((prev) => [...jobs, ...prev]);
    setCurrentStep(2);
  }, [uploadedFiles]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setUploadedFiles([]);
  }, []);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-user-text-primary">텍스트 추출 (OCR)</h1>
        <p className="mt-1 text-sm text-user-text-secondary">
          이미지에서 글자를 자동으로 추출합니다. 사업자등록증, 영수증, 스크린샷, 스캔 문서 등을 지원합니다.
        </p>
      </div>

      {/* Step progress */}
      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Mode selector toggle */}
          <div className="flex flex-col sm:flex-row rounded-xl border border-user-border p-1 gap-1 sm:gap-0">
            {(Object.keys(MODE_CONFIG) as OCRMode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setUploadedFiles([]);
                }}
                className={[
                  'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  mode === key
                    ? 'bg-user-primary text-white'
                    : 'text-user-text-secondary hover:text-user-text-primary',
                ].join(' ')}
              >
                {MODE_CONFIG[key].label}
                <span className="ml-1 text-xs opacity-70">
                  (max {MODE_CONFIG[key].maxFiles}장)
                </span>
              </button>
            ))}
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 rounded-xl bg-user-primary-light px-5 py-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-user-primary" />
            <p className="text-sm text-user-primary">
              {config.desc}
            </p>
          </div>

          {/* Upload zone */}
          <FileUploadZone
            accept=".jpg,.jpeg,.png,.pdf"
            maxFiles={config.maxFiles}
            onUpload={handleUpload}
            description="JPG, JPEG, PNG, PDF 형식 지원"
          />

          {/* Start button */}
          <button
            type="button"
            disabled={uploadedFiles.length === 0}
            onClick={handleStartOCR}
            className={[
              'w-full rounded-xl py-3 text-sm font-semibold transition-colors',
              uploadedFiles.length > 0
                ? 'bg-user-primary text-white hover:bg-user-primary/90'
                : 'cursor-not-allowed bg-user-border text-user-text-muted',
            ].join(' ')}
          >
            {mode === 'extract' ? '텍스트 추출 시작' : '번역 시작'}
          </button>
        </div>
      )}

      {/* Step 2: Results */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-user-text-primary">
              변환된 파일 다운로드
            </h2>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
              최대 2주간 무료 다운로드 가능
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-user-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-user-border bg-user-bg-section">
                  <th className="px-5 py-3 font-medium text-user-text-secondary">업로드파일명</th>
                  <th className="px-5 py-3 font-medium text-user-text-secondary">현재상황</th>
                  <th className="px-5 py-3 text-right font-medium text-user-text-secondary">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {ocrJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-user-border last:border-b-0"
                  >
                    <td className="px-5 py-3 font-medium text-user-text-primary">
                      {job.fileName}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={[
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusBadgeClass[job.status],
                        ].join(' ')}
                      >
                        {statusLabel[job.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        disabled={job.status !== 'completed'}
                        className={[
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          job.status === 'completed'
                            ? 'bg-user-primary text-white hover:bg-user-primary/90'
                            : 'cursor-not-allowed bg-user-border text-user-text-muted',
                        ].join(' ')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        다운로드
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-user-border px-4 py-2 text-sm font-medium text-user-text-secondary transition-colors hover:bg-user-bg-section"
          >
            새 파일 업로드
          </button>
        </div>
      )}
    </div>
  );
}
