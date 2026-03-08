'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { supportsWorker } from '../utils/workerUtils'
import type { WorkerRequest, WorkerResponse } from './xlsxWorker'

export interface UseXlsxWorkerResult {
  /** Parse an Excel file buffer. Resolves with { data, columns }. */
  parseFile: (buffer: ArrayBuffer, fileName: string) => Promise<{
    data: Record<string, unknown>[]
    columns: string[]
  }>
  /** Whether the worker is currently processing. */
  isLoading: boolean
  /** Progress percentage (0–100). */
  progress: number
  /** Last error message, if any. */
  error: string | null
  /** Most recent parsed data. */
  data: Record<string, unknown>[]
  /** Column headers from the most recent parse. */
  columns: string[]
}

/**
 * React hook that manages an xlsx Web Worker lifecycle.
 *
 * - Creates the worker lazily on first `parseFile` call.
 * - Listens for progress and parsed/error messages.
 * - Falls back to main-thread parsing when Workers are unavailable.
 * - Terminates the worker on unmount to prevent leaks.
 */
export function useXlsxWorker(): UseXlsxWorkerResult {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const workerRef = useRef<Worker | null>(null)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const parseFile = useCallback(
    (buffer: ArrayBuffer, fileName: string): Promise<{
      data: Record<string, unknown>[]
      columns: string[]
    }> => {
      setIsLoading(true)
      setProgress(0)
      setError(null)
      setData([])
      setColumns([])

      return new Promise((resolve, reject) => {
        // ── Fallback: main-thread parsing ────────────────────────
        if (!supportsWorker()) {
          mainThreadFallback(buffer)
            .then((result) => {
              if (!mountedRef.current) return
              setData(result.data)
              setColumns(result.columns)
              setProgress(100)
              setIsLoading(false)
              resolve(result)
            })
            .catch((err) => {
              if (!mountedRef.current) return
              const msg = err instanceof Error ? err.message : '파일 파싱에 실패했습니다.'
              setError(msg)
              setIsLoading(false)
              reject(new Error(msg))
            })
          return
        }

        // ── Worker path ──────────────────────────────────────────
        // Terminate previous worker if lingering
        if (workerRef.current) {
          workerRef.current.terminate()
        }

        const worker = new Worker(
          new URL('./xlsxWorker.ts', import.meta.url),
          { type: 'module' },
        )
        workerRef.current = worker

        const cleanup = () => {
          worker.removeEventListener('message', onMessage)
          worker.removeEventListener('error', onError)
        }

        const onMessage = (e: MessageEvent<WorkerResponse>) => {
          if (!mountedRef.current) {
            cleanup()
            return
          }

          switch (e.data.type) {
            case 'progress':
              setProgress(e.data.percent)
              break

            case 'parsed':
              cleanup()
              setData(e.data.data)
              setColumns(e.data.columns)
              setProgress(100)
              setIsLoading(false)
              resolve({ data: e.data.data, columns: e.data.columns })
              break

            case 'error':
              cleanup()
              setError(e.data.message)
              setIsLoading(false)
              reject(new Error(e.data.message))
              break

            case 'validated':
              // Not expected during parseFile — ignore
              break
          }
        }

        const onError = (err: ErrorEvent) => {
          if (!mountedRef.current) {
            cleanup()
            return
          }
          cleanup()
          const msg = err.message || '파일 파싱에 실패했습니다.'
          setError(msg)
          setIsLoading(false)
          reject(new Error(msg))
        }

        worker.addEventListener('message', onMessage)
        worker.addEventListener('error', onError)

        const request: WorkerRequest = { type: 'parse', buffer, fileName }
        worker.postMessage(request, [buffer])
      })
    },
    [],
  )

  return { parseFile, isLoading, progress, error, data, columns }
}

// ── Main-thread fallback (SSR / no Worker) ───────────────────────────
async function mainThreadFallback(buffer: ArrayBuffer): Promise<{
  data: Record<string, unknown>[]
  columns: string[]
}> {
  const { read, utils } = await import('xlsx')
  const wb = read(buffer, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return { data: [], columns: [] }
  const sheet = wb.Sheets[sheetName]
  if (!sheet) return { data: [], columns: [] }
  const data = utils.sheet_to_json<Record<string, unknown>>(sheet)
  const columns = data.length > 0 ? Object.keys(data[0]) : []
  return { data, columns }
}
