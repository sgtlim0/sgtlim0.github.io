'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Represents a file being managed by the upload hook.
 */
export interface UploadFile {
  readonly id: string
  readonly file: File
  readonly name: string
  readonly size: number
  readonly type: string
  readonly progress: number // 0-100
  readonly status: 'pending' | 'uploading' | 'success' | 'error'
  readonly previewUrl?: string
  readonly error?: string
}

export interface UseFileUploadOptions {
  readonly maxFiles?: number
  readonly maxSizeBytes?: number
  readonly acceptTypes?: string[] // e.g. ['image/*', '.pdf']
  readonly onUpload?: (file: File) => Promise<void>
}

export interface UseFileUploadReturn {
  readonly files: readonly UploadFile[]
  readonly addFiles: (files: FileList | File[]) => void
  readonly removeFile: (id: string) => void
  readonly clearAll: () => void
  readonly upload: () => Promise<void>
  readonly isUploading: boolean
  readonly totalProgress: number
  readonly isDragOver: boolean
  readonly dropZoneProps: Record<string, unknown>
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

function createPreviewUrl(file: File): string | undefined {
  if (typeof URL === 'undefined') return undefined
  if (!isImageType(file.type)) return undefined
  return URL.createObjectURL(file)
}

function matchesAcceptType(file: File, acceptTypes: string[]): boolean {
  if (acceptTypes.length === 0) return true
  return acceptTypes.some((accept) => {
    // Wildcard MIME, e.g. "image/*"
    if (accept.endsWith('/*')) {
      const prefix = accept.slice(0, accept.indexOf('/'))
      return file.type.startsWith(`${prefix}/`)
    }
    // Extension match, e.g. ".pdf"
    if (accept.startsWith('.')) {
      return file.name.toLowerCase().endsWith(accept.toLowerCase())
    }
    // Exact MIME match
    return file.type === accept
  })
}

function formatValidationError(
  file: File,
  maxSizeBytes: number | undefined,
  acceptTypes: string[],
): string | null {
  if (acceptTypes.length > 0 && !matchesAcceptType(file, acceptTypes)) {
    return `File type "${file.type || 'unknown'}" is not allowed. Accepted: ${acceptTypes.join(', ')}`
  }
  if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    return `File size exceeds limit (${maxMB} MB)`
  }
  return null
}

/**
 * Hook for managing file uploads with drag-and-drop, validation, and progress tracking.
 *
 * Features:
 * - Drag-and-drop zone props (isDragOver, dropZoneProps)
 * - Image preview via URL.createObjectURL (auto-revoked on removal)
 * - File size and type validation
 * - Per-file and total progress tracking
 * - SSR safe (typeof File / URL checks)
 *
 * @example
 * ```tsx
 * const { files, addFiles, removeFile, upload, dropZoneProps, isDragOver } = useFileUpload({
 *   maxFiles: 5,
 *   maxSizeBytes: 10 * 1024 * 1024,
 *   acceptTypes: ['image/*', '.pdf'],
 *   onUpload: async (file) => { await api.upload(file) },
 * })
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { maxFiles, maxSizeBytes, acceptTypes = [], onUpload } = options

  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Track preview URLs for cleanup
  const previewUrlsRef = useRef<Set<string>>(new Set())

  // Cleanup all preview URLs on unmount
  useEffect(() => {
    const urls = previewUrlsRef.current
    return () => {
      urls.forEach((url) => {
        if (typeof URL !== 'undefined') {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const revokePreviewUrl = useCallback((url: string | undefined) => {
    if (url && typeof URL !== 'undefined') {
      URL.revokeObjectURL(url)
      previewUrlsRef.current.delete(url)
    }
  }, [])

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const fileArray = Array.from(incoming)

      setFiles((prev) => {
        const remaining = maxFiles !== undefined ? maxFiles - prev.length : fileArray.length
        const toAdd = fileArray.slice(0, Math.max(0, remaining))

        const newEntries: UploadFile[] = toAdd.map((file) => {
          const validationError = formatValidationError(file, maxSizeBytes, acceptTypes)
          const previewUrl = validationError ? undefined : createPreviewUrl(file)
          if (previewUrl) {
            previewUrlsRef.current.add(previewUrl)
          }

          return {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: validationError ? 'error' : 'pending',
            previewUrl,
            error: validationError ?? undefined,
          }
        })

        return [...prev, ...newEntries]
      })
    },
    [maxFiles, maxSizeBytes, acceptTypes],
  )

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id)
        if (target?.previewUrl) {
          revokePreviewUrl(target.previewUrl)
        }
        return prev.filter((f) => f.id !== id)
      })
    },
    [revokePreviewUrl],
  )

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => revokePreviewUrl(f.previewUrl))
      return []
    })
  }, [revokePreviewUrl])

  const upload = useCallback(async () => {
    if (!onUpload) return

    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Mark all pending as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f,
      ),
    )

    for (const uploadFile of pendingFiles) {
      try {
        // Simulate progress updates
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 50 } : f)),
        )

        await onUpload(uploadFile.file)

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'success' as const, progress: 100 }
              : f,
          ),
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error' as const, progress: 0, error: message }
              : f,
          ),
        )
      }
    }

    setIsUploading(false)
  }, [files, onUpload])

  const totalProgress =
    files.length === 0
      ? 0
      : Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)

  // Drop zone event handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (e.dataTransfer?.files?.length) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const dropZoneProps: Record<string, unknown> = {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  }

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    upload,
    isUploading,
    totalProgress,
    isDragOver,
    dropZoneProps,
  }
}
