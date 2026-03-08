'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDataExport } from './hooks/useDataExport'

export interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename?: string
  columns?: string[]
  label?: string
  className?: string
}

export default function ExportButton({
  data,
  filename = 'export',
  columns,
  label = 'Export',
  className = '',
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { exportCSV, exportJSON, isExporting } = useDataExport()

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  const handleExportCSV = async () => {
    handleClose()
    await exportCSV(data, `${filename}.csv`, columns)
  }

  const handleExportJSON = async () => {
    handleClose()
    await exportJSON(data, `${filename}.json`)
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting || data.length === 0}
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {isExporting ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        {label}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Export format options"
          className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleExportCSV}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            CSV (.csv)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleExportJSON}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            JSON (.json)
          </button>
        </div>
      )}
    </div>
  )
}
