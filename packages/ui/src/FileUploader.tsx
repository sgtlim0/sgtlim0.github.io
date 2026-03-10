'use client'

import React, { useRef } from 'react'
import { useFileUpload } from './hooks/useFileUpload'
import type { UseFileUploadOptions, UploadFile } from './hooks/useFileUpload'

export interface FileUploaderProps {
  readonly options?: UseFileUploadOptions
  readonly className?: string
  readonly dropLabel?: string
  readonly buttonLabel?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatusIcon({ status }: { readonly status: UploadFile['status'] }) {
  switch (status) {
    case 'success':
      return <span data-testid="status-success" style={{ color: '#10b981' }}>&#10003;</span>
    case 'error':
      return <span data-testid="status-error" style={{ color: '#ef4444' }}>&#10007;</span>
    case 'uploading':
      return <span data-testid="status-uploading" style={{ color: '#3b82f6' }}>&#8635;</span>
    default:
      return <span data-testid="status-pending" style={{ color: '#9ca3af' }}>&#8226;</span>
  }
}

function FileItem({
  file,
  onRemove,
}: {
  readonly file: UploadFile
  readonly onRemove: (id: string) => void
}) {
  return (
    <li
      data-testid={`file-item-${file.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-secondary, #f9fafb)',
        border: '1px solid var(--border, #e5e7eb)',
      }}
    >
      {/* Image preview */}
      {file.previewUrl && (
        <img
          src={file.previewUrl}
          alt={`Preview of ${file.name}`}
          data-testid={`preview-${file.id}`}
          style={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        />
      )}

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary, #111827)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: file.error ? '#ef4444' : 'var(--text-secondary, #6b7280)',
            marginTop: '2px',
          }}
        >
          {file.error ?? formatFileSize(file.size)}
        </div>

        {/* Progress bar */}
        {(file.status === 'uploading' || file.status === 'success') && (
          <div
            style={{
              marginTop: '4px',
              height: '4px',
              width: '100%',
              backgroundColor: 'var(--bg-hover, #e5e7eb)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              data-testid={`progress-${file.id}`}
              role="progressbar"
              aria-valuenow={file.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                height: '100%',
                width: `${file.progress}%`,
                backgroundColor: file.status === 'success' ? '#10b981' : '#3b82f6',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
      </div>

      {/* Status icon */}
      <StatusIcon status={file.status} />

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
        data-testid={`remove-${file.id}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: 1,
          color: 'var(--text-secondary, #6b7280)',
          padding: '4px',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </li>
  )
}

/**
 * File uploader component with drag-and-drop, file validation, previews, and progress.
 *
 * Features:
 * - Drag-and-drop zone with dashed border and hover highlight
 * - File selection via hidden input
 * - File list with name, size, progress bar, and remove button
 * - Image preview thumbnails (URL.createObjectURL)
 * - File size/type validation with error display
 * - Total progress bar
 * - Accessible: role="button", aria-label on interactive elements
 */
export default function FileUploader({
  options,
  className = '',
  dropLabel = 'Drag & drop files here, or click to select',
  buttonLabel = 'Upload',
}: FileUploaderProps) {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    upload,
    isUploading,
    totalProgress,
    isDragOver,
    dropZoneProps,
  } = useFileUpload(options)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      // Reset so the same file can be re-selected
      e.target.value = ''
    }
  }

  const acceptAttr = options?.acceptTypes?.join(',')

  return (
    <div className={className} data-testid="file-uploader">
      {/* Drop zone */}
      <div
        {...dropZoneProps}
        role="button"
        tabIndex={0}
        aria-label="File drop zone"
        data-testid="drop-zone"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--primary, #3b82f6)' : 'var(--border, #d1d5db)'}`,
          borderRadius: '12px',
          padding: '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragOver
            ? 'var(--primary-bg, rgba(59, 130, 246, 0.05))'
            : 'var(--bg-primary, #ffffff)',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text-secondary, #6b7280)',
          }}
        >
          {dropLabel}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptAttr}
          onChange={handleInputChange}
          data-testid="file-input"
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {/* Total progress */}
          {isUploading && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #6b7280)',
                  marginBottom: '4px',
                }}
              >
                <span>Total progress</span>
                <span data-testid="total-progress-label">{totalProgress}%</span>
              </div>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  backgroundColor: 'var(--bg-hover, #e5e7eb)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  data-testid="total-progress-bar"
                  role="progressbar"
                  aria-valuenow={totalProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Total upload progress: ${totalProgress}%`}
                  style={{
                    height: '100%',
                    width: `${totalProgress}%`,
                    backgroundColor: 'var(--primary, #3b82f6)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          <ul
            data-testid="file-list"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {files.map((file) => (
              <FileItem key={file.id} file={file} onRemove={removeFile} />
            ))}
          </ul>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={clearAll}
              disabled={isUploading}
              data-testid="clear-all-btn"
              aria-label="Clear all files"
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--border, #d1d5db)',
                backgroundColor: 'var(--bg-primary, #ffffff)',
                color: 'var(--text-secondary, #6b7280)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.5 : 1,
              }}
            >
              Clear All
            </button>
            {options?.onUpload && (
              <button
                type="button"
                onClick={upload}
                disabled={isUploading || files.every((f) => f.status !== 'pending')}
                data-testid="upload-btn"
                aria-label={buttonLabel}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--primary, #3b82f6)',
                  color: '#ffffff',
                  cursor:
                    isUploading || files.every((f) => f.status !== 'pending')
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    isUploading || files.every((f) => f.status !== 'pending') ? 0.5 : 1,
                }}
              >
                {isUploading ? 'Uploading...' : buttonLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { formatFileSize }
