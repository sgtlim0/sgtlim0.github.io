'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';

export interface FileUploadZoneProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: string;
  onUpload: (files: File[]) => void;
  description?: string;
}

export default function FileUploadZone({
  accept,
  maxFiles = 10,
  maxSize = '50MB',
  onUpload,
  description,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;

    const newFiles = Array.from(incoming);
    setSelectedFiles((prev) => {
      const merged = [...prev, ...newFiles].slice(0, maxFiles);
      return merged;
    });
  }, [maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [addFiles]);

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUploadClick() {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        aria-label="파일 업로드 영역"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
          isDragOver
            ? 'border-user-primary bg-user-primary/5'
            : 'border-user-border hover:border-user-primary/50 bg-user-bg-section',
        ].join(' ')}
      >
        <Upload
          className={[
            'w-10 h-10 transition-colors',
            isDragOver ? 'text-user-primary' : 'text-user-text-muted',
          ].join(' ')}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-user-text-primary">
            클릭하여 파일 선택 또는 드래그 앤 드롭
          </p>
          <p className="text-xs text-user-text-secondary mt-1">
            {description ?? `최대 ${maxFiles}개 파일, 파일당 ${maxSize} 이하`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* File list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-user-bg border border-user-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-user-primary shrink-0" />
                <span className="text-sm text-user-text-primary truncate">
                  {file.name}
                </span>
                <span className="text-xs text-user-text-muted shrink-0">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="p-1 rounded hover:bg-user-bg-section transition-colors shrink-0"
                aria-label={`${file.name} 제거`}
              >
                <X className="w-4 h-4 text-user-text-muted" />
              </button>
            </div>
          ))}

          <button
            onClick={handleUploadClick}
            className="w-full py-2.5 rounded-lg bg-user-primary hover:bg-user-primary/90 text-white text-sm font-medium transition-colors"
          >
            업로드 ({selectedFiles.length}개 파일)
          </button>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}
