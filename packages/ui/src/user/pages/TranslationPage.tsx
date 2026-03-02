'use client';

import { useState, useCallback } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import FileUploadZone from '../components/FileUploadZone';
import EngineSelector from '../components/EngineSelector';
import type { TranslationEngine, TranslationJob } from '../services/types';

const SUPPORTED_FORMATS = ['PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS'] as const;

const STEPS = [
  { label: '번역 시작' },
  { label: '번역 결과' },
];

const statusLabel: Record<TranslationJob['status'], string> = {
  uploading: '업로드 중',
  processing: '번역 중',
  completed: '완료',
  failed: '실패',
};

const statusBadgeClass: Record<TranslationJob['status'], string> = {
  uploading: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function TranslationPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedEngine, setSelectedEngine] = useState<TranslationEngine>('internal');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [translationJobs, setTranslationJobs] = useState<TranslationJob[]>([]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    setUploadedFiles(files);
  }, []);

  const handleStartTranslation = useCallback(() => {
    if (uploadedFiles.length === 0) return;

    const jobs: TranslationJob[] = uploadedFiles.map((file, i) => ({
      id: `tj-${Date.now()}-${i}`,
      fileName: file.name,
      engine: selectedEngine,
      status: 'processing' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
    }));

    setTranslationJobs(jobs);
    setCurrentStep(2);
  }, [uploadedFiles, selectedEngine]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setTranslationJobs([]);
  }, []);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-user-text-primary">문서 번역 도구</h1>
        <p className="mt-1 text-sm text-user-text-secondary">
          문서를 업로드하면 형식을 유지한 채 번역해 드립니다.
        </p>
      </div>

      {/* Supported formats */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SUPPORTED_FORMATS.map((fmt) => (
          <span
            key={fmt}
            className="rounded-full bg-user-bg-section px-3 py-1 text-xs font-medium text-user-text-secondary ring-1 ring-user-border"
          >
            {fmt}
          </span>
        ))}
      </div>

      {/* Step progress */}
      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Warning banner */}
      <div className="mb-8 flex items-start gap-3 rounded-xl bg-yellow-50 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          AI 번역 특성상 글이 빠질 수 있고, 문서에 그림이 많으면 디자인 일부 빠질 수 있습니다.
        </p>
      </div>

      {/* Step 1: Engine selection + file upload */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="w-full">
            <EngineSelector
              selectedEngine={selectedEngine}
              onSelect={setSelectedEngine}
            />
          </div>

          <FileUploadZone
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls"
            maxFiles={10}
            onUpload={handleFilesUploaded}
            description="번역할 문서 파일을 업로드하세요"
          />

          <button
            type="button"
            disabled={uploadedFiles.length === 0}
            onClick={handleStartTranslation}
            className={[
              'w-full rounded-xl py-3 text-sm font-semibold transition-colors',
              uploadedFiles.length > 0
                ? 'bg-user-primary text-white hover:bg-user-primary/90'
                : 'cursor-not-allowed bg-[#E2E8F0] text-user-text-muted',
            ].join(' ')}
          >
            번역 시작
          </button>
        </div>
      )}

      {/* Step 2: Translation results */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-user-text-primary">번역 결과</h2>

          <div className="overflow-x-auto rounded-xl border border-user-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-user-border bg-user-bg-section">
                  <th className="px-5 py-3 font-medium text-[#64748B]">파일명</th>
                  <th className="px-5 py-3 font-medium text-[#64748B]">상태</th>
                  <th className="px-5 py-3 text-right font-medium text-[#64748B]">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {translationJobs.map((job) => (
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
                            : 'cursor-not-allowed bg-[#E2E8F0] text-user-text-muted',
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
            className="rounded-lg border border-user-border px-4 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-user-bg-section"
          >
            새 번역 시작
          </button>
        </div>
      )}
    </div>
  );
}
