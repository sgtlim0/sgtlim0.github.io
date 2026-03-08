'use client'

import { useState, useCallback } from 'react'
import { exportToCSV, exportToJSON } from '../utils/dataExport'

const CHUNK_SIZE = 1000

interface UseDataExportReturn {
  exportCSV: (data: Record<string, unknown>[], filename: string, columns?: string[]) => Promise<void>
  exportJSON: (data: unknown, filename: string) => Promise<void>
  isExporting: boolean
}

export function useDataExport(): UseDataExportReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportCSV = useCallback(
    async (data: Record<string, unknown>[], filename: string, columns?: string[]) => {
      setIsExporting(true)
      try {
        if (data.length > CHUNK_SIZE) {
          // Yield to the main thread between chunks for large datasets
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              exportToCSV(data, filename, columns)
              resolve()
            }, 0)
          })
        } else {
          exportToCSV(data, filename, columns)
        }
      } catch (error) {
        console.error('CSV export failed:', error)
      } finally {
        setIsExporting(false)
      }
    },
    [],
  )

  const exportJSONFn = useCallback(async (data: unknown, filename: string) => {
    setIsExporting(true)
    try {
      exportToJSON(data, filename)
    } catch (error) {
      console.error('JSON export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    exportCSV,
    exportJSON: exportJSONFn,
    isExporting,
  }
}
