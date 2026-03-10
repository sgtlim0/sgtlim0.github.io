import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { renderHook, act as actHook } from '@testing-library/react'
import FileUploader, { formatFileSize } from '../src/FileUploader'
import { useFileUpload } from '../src/hooks/useFileUpload'
import type { UseFileUploadOptions } from '../src/hooks/useFileUpload'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockFile(
  name: string,
  size: number,
  type: string,
): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

function createMockFileList(files: File[]): FileList {
  const list = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: function* () {
      for (const f of files) yield f
    },
  } as unknown as FileList
  for (let i = 0; i < files.length; i++) {
    Object.defineProperty(list, i, { value: files[i], enumerable: true })
  }
  return list
}

// Mock URL.createObjectURL / revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// 1. formatFileSize utility
// ===========================================================================

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })

  it('formats exactly 1 KB boundary', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
  })

  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })
})

// ===========================================================================
// 2. useFileUpload hook
// ===========================================================================

describe('useFileUpload', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useFileUpload())
    expect(result.current.files).toEqual([])
    expect(result.current.isUploading).toBe(false)
    expect(result.current.totalProgress).toBe(0)
    expect(result.current.isDragOver).toBe(false)
  })

  it('adds files via addFiles', () => {
    const { result } = renderHook(() => useFileUpload())
    const file = createMockFile('test.txt', 1024, 'text/plain')

    actHook(() => {
      result.current.addFiles([file])
    })

    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].name).toBe('test.txt')
    expect(result.current.files[0].size).toBe(1024)
    expect(result.current.files[0].status).toBe('pending')
    expect(result.current.files[0].progress).toBe(0)
  })

  it('adds files from FileList', () => {
    const { result } = renderHook(() => useFileUpload())
    const file1 = createMockFile('a.txt', 100, 'text/plain')
    const file2 = createMockFile('b.txt', 200, 'text/plain')
    const fileList = createMockFileList([file1, file2])

    actHook(() => {
      result.current.addFiles(fileList)
    })

    expect(result.current.files).toHaveLength(2)
  })

  it('respects maxFiles limit', () => {
    const { result } = renderHook(() => useFileUpload({ maxFiles: 2 }))
    const files = [
      createMockFile('a.txt', 100, 'text/plain'),
      createMockFile('b.txt', 100, 'text/plain'),
      createMockFile('c.txt', 100, 'text/plain'),
    ]

    actHook(() => {
      result.current.addFiles(files)
    })

    expect(result.current.files).toHaveLength(2)
    expect(result.current.files[0].name).toBe('a.txt')
    expect(result.current.files[1].name).toBe('b.txt')
  })

  it('enforces maxFiles across multiple addFiles calls', () => {
    const { result } = renderHook(() => useFileUpload({ maxFiles: 2 }))

    actHook(() => {
      result.current.addFiles([createMockFile('a.txt', 100, 'text/plain')])
    })
    actHook(() => {
      result.current.addFiles([
        createMockFile('b.txt', 100, 'text/plain'),
        createMockFile('c.txt', 100, 'text/plain'),
      ])
    })

    expect(result.current.files).toHaveLength(2)
  })

  it('validates file size and marks as error', () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxSizeBytes: 500 }),
    )
    const bigFile = createMockFile('big.txt', 1000, 'text/plain')

    actHook(() => {
      result.current.addFiles([bigFile])
    })

    expect(result.current.files[0].status).toBe('error')
    expect(result.current.files[0].error).toContain('exceeds limit')
  })

  it('validates file type and marks as error', () => {
    const { result } = renderHook(() =>
      useFileUpload({ acceptTypes: ['image/*'] }),
    )
    const textFile = createMockFile('doc.txt', 100, 'text/plain')

    actHook(() => {
      result.current.addFiles([textFile])
    })

    expect(result.current.files[0].status).toBe('error')
    expect(result.current.files[0].error).toContain('not allowed')
  })

  it('accepts files matching wildcard MIME type', () => {
    const { result } = renderHook(() =>
      useFileUpload({ acceptTypes: ['image/*'] }),
    )
    const imgFile = createMockFile('photo.png', 100, 'image/png')

    actHook(() => {
      result.current.addFiles([imgFile])
    })

    expect(result.current.files[0].status).toBe('pending')
    expect(result.current.files[0].error).toBeUndefined()
  })

  it('accepts files matching extension type', () => {
    const { result } = renderHook(() =>
      useFileUpload({ acceptTypes: ['.pdf'] }),
    )
    const pdfFile = createMockFile('report.pdf', 100, 'application/pdf')

    actHook(() => {
      result.current.addFiles([pdfFile])
    })

    expect(result.current.files[0].status).toBe('pending')
  })

  it('creates preview URL for image files', () => {
    const { result } = renderHook(() => useFileUpload())
    const imgFile = createMockFile('photo.jpg', 100, 'image/jpeg')

    actHook(() => {
      result.current.addFiles([imgFile])
    })

    expect(result.current.files[0].previewUrl).toBe('blob:mock-url')
    expect(mockCreateObjectURL).toHaveBeenCalledWith(imgFile)
  })

  it('does not create preview URL for non-image files', () => {
    const { result } = renderHook(() => useFileUpload())
    const txtFile = createMockFile('notes.txt', 100, 'text/plain')

    actHook(() => {
      result.current.addFiles([txtFile])
    })

    expect(result.current.files[0].previewUrl).toBeUndefined()
  })

  it('removes a file by id', () => {
    const { result } = renderHook(() => useFileUpload())
    const file = createMockFile('test.txt', 100, 'text/plain')

    actHook(() => {
      result.current.addFiles([file])
    })

    const id = result.current.files[0].id

    actHook(() => {
      result.current.removeFile(id)
    })

    expect(result.current.files).toHaveLength(0)
  })

  it('revokes preview URL when removing an image file', () => {
    const { result } = renderHook(() => useFileUpload())
    const imgFile = createMockFile('img.png', 100, 'image/png')

    actHook(() => {
      result.current.addFiles([imgFile])
    })

    const id = result.current.files[0].id

    actHook(() => {
      result.current.removeFile(id)
    })

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('clears all files', () => {
    const { result } = renderHook(() => useFileUpload())

    actHook(() => {
      result.current.addFiles([
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.txt', 100, 'text/plain'),
      ])
    })

    actHook(() => {
      result.current.clearAll()
    })

    expect(result.current.files).toHaveLength(0)
  })

  it('uploads pending files and tracks progress', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useFileUpload({ onUpload }))

    actHook(() => {
      result.current.addFiles([createMockFile('file.txt', 100, 'text/plain')])
    })

    await actHook(async () => {
      await result.current.upload()
    })

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(result.current.files[0].status).toBe('success')
    expect(result.current.files[0].progress).toBe(100)
    expect(result.current.isUploading).toBe(false)
  })

  it('handles upload errors gracefully', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useFileUpload({ onUpload }))

    actHook(() => {
      result.current.addFiles([createMockFile('fail.txt', 100, 'text/plain')])
    })

    await actHook(async () => {
      await result.current.upload()
    })

    expect(result.current.files[0].status).toBe('error')
    expect(result.current.files[0].error).toBe('Network error')
    expect(result.current.isUploading).toBe(false)
  })

  it('handles non-Error upload failures', async () => {
    const onUpload = vi.fn().mockRejectedValue('string error')
    const { result } = renderHook(() => useFileUpload({ onUpload }))

    actHook(() => {
      result.current.addFiles([createMockFile('fail.txt', 100, 'text/plain')])
    })

    await actHook(async () => {
      await result.current.upload()
    })

    expect(result.current.files[0].error).toBe('Upload failed')
  })

  it('does not upload when no onUpload callback', async () => {
    const { result } = renderHook(() => useFileUpload())

    actHook(() => {
      result.current.addFiles([createMockFile('file.txt', 100, 'text/plain')])
    })

    await actHook(async () => {
      await result.current.upload()
    })

    // Files remain pending
    expect(result.current.files[0].status).toBe('pending')
  })

  it('does not upload files already in error state', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useFileUpload({ onUpload, maxSizeBytes: 50 }),
    )

    actHook(() => {
      result.current.addFiles([createMockFile('big.txt', 1000, 'text/plain')])
    })

    await actHook(async () => {
      await result.current.upload()
    })

    // Already error, onUpload should not be called
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('calculates totalProgress correctly', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useFileUpload({ onUpload }))

    actHook(() => {
      result.current.addFiles([
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.txt', 100, 'text/plain'),
      ])
    })

    // Before upload, progress is 0
    expect(result.current.totalProgress).toBe(0)

    await actHook(async () => {
      await result.current.upload()
    })

    // After upload, progress is 100
    expect(result.current.totalProgress).toBe(100)
  })

  it('provides dropZoneProps with drag event handlers', () => {
    const { result } = renderHook(() => useFileUpload())
    const props = result.current.dropZoneProps

    expect(props).toHaveProperty('onDragEnter')
    expect(props).toHaveProperty('onDragOver')
    expect(props).toHaveProperty('onDragLeave')
    expect(props).toHaveProperty('onDrop')
    expect(typeof props.onDragEnter).toBe('function')
  })

  it('does not create preview URL for error files', () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxSizeBytes: 50 }),
    )
    const imgFile = createMockFile('big.png', 1000, 'image/png')

    actHook(() => {
      result.current.addFiles([imgFile])
    })

    expect(result.current.files[0].previewUrl).toBeUndefined()
    expect(result.current.files[0].status).toBe('error')
  })
})

// ===========================================================================
// 3. FileUploader component
// ===========================================================================

describe('FileUploader component', () => {
  it('renders drop zone with label', () => {
    render(<FileUploader />)
    expect(screen.getByTestId('drop-zone')).toBeDefined()
    expect(screen.getByText(/Drag & drop files here/)).toBeDefined()
  })

  it('renders with custom drop label', () => {
    render(<FileUploader dropLabel="Drop files" />)
    expect(screen.getByText('Drop files')).toBeDefined()
  })

  it('drop zone has role="button" and aria-label', () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')
    expect(zone.getAttribute('role')).toBe('button')
    expect(zone.getAttribute('aria-label')).toBe('File drop zone')
  })

  it('drop zone is keyboard accessible (tabIndex=0)', () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')
    expect(zone.getAttribute('tabindex')).toBe('0')
  })

  it('hidden file input exists', () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    expect(input.type).toBe('file')
    expect(input.style.display).toBe('none')
  })

  it('opens file dialog on drop zone click', () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    fireEvent.click(screen.getByTestId('drop-zone'))
    expect(clickSpy).toHaveBeenCalled()
  })

  it('opens file dialog on Enter key', () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    fireEvent.keyDown(screen.getByTestId('drop-zone'), { key: 'Enter' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('opens file dialog on Space key', () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    fireEvent.keyDown(screen.getByTestId('drop-zone'), { key: ' ' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('adds files when file input changes', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const file = createMockFile('doc.txt', 256, 'text/plain')

    Object.defineProperty(input, 'files', {
      value: createMockFileList([file]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByTestId('file-list')).toBeDefined()
    expect(screen.getByText('doc.txt')).toBeDefined()
  })

  it('shows file size in the file list', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const file = createMockFile('report.pdf', 2048, 'application/pdf')

    Object.defineProperty(input, 'files', {
      value: createMockFileList([file]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByText('2.0 KB')).toBeDefined()
  })

  it('shows remove button for each file', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const file = createMockFile('test.txt', 100, 'text/plain')

    Object.defineProperty(input, 'files', {
      value: createMockFileList([file]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    const removeBtn = screen.getByLabelText('Remove test.txt')
    expect(removeBtn).toBeDefined()
  })

  it('removes a file when remove button is clicked', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const file = createMockFile('test.txt', 100, 'text/plain')

    Object.defineProperty(input, 'files', {
      value: createMockFileList([file]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByText('test.txt')).toBeDefined()

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Remove test.txt'))
    })

    expect(screen.queryByText('test.txt')).toBeNull()
  })

  it('clears all files when Clear All is clicked', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.txt', 100, 'text/plain'),
      ]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getAllByText(/\.txt/).length).toBeGreaterThanOrEqual(2)

    await act(async () => {
      fireEvent.click(screen.getByTestId('clear-all-btn'))
    })

    expect(screen.queryByTestId('file-list')).toBeNull()
  })

  it('shows upload button when onUpload is provided', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    render(<FileUploader options={{ onUpload }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByTestId('upload-btn')).toBeDefined()
  })

  it('does not show upload button when onUpload is not provided', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.queryByTestId('upload-btn')).toBeNull()
  })

  it('shows error message for invalid file type', async () => {
    render(<FileUploader options={{ acceptTypes: ['image/*'] }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('doc.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByText(/not allowed/)).toBeDefined()
  })

  it('shows error message for oversized file', async () => {
    render(<FileUploader options={{ maxSizeBytes: 100 }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('big.txt', 5000, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByText(/exceeds limit/)).toBeDefined()
  })

  it('shows image preview for image files', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const imgFile = createMockFile('photo.png', 100, 'image/png')

    Object.defineProperty(input, 'files', {
      value: createMockFileList([imgFile]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(1)
    expect(imgs[0].getAttribute('src')).toBe('blob:mock-url')
  })

  it('handles drag enter on drop zone', () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')

    fireEvent.dragEnter(zone, {
      dataTransfer: { files: [] },
    })

    // The border should change to indicate drag over (visual, tested via style)
    // We verify no crash and the event is handled
    expect(zone).toBeDefined()
  })

  it('handles drag leave on drop zone', () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')

    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })
    fireEvent.dragLeave(zone, { dataTransfer: { files: [] } })

    expect(zone).toBeDefined()
  })

  it('adds files on drop', async () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')
    const file = createMockFile('dropped.txt', 100, 'text/plain')

    await act(async () => {
      fireEvent.drop(zone, {
        dataTransfer: {
          files: createMockFileList([file]),
        },
      })
    })

    expect(screen.getByText('dropped.txt')).toBeDefined()
  })

  it('shows pending status icon for new files', async () => {
    render(<FileUploader />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByTestId('status-pending')).toBeDefined()
  })

  it('shows error status icon for invalid files', async () => {
    render(<FileUploader options={{ maxSizeBytes: 50 }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('big.txt', 1000, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByTestId('status-error')).toBeDefined()
  })

  it('passes accept attribute to file input', () => {
    render(<FileUploader options={{ acceptTypes: ['image/*', '.pdf'] }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement
    expect(input.accept).toBe('image/*,.pdf')
  })

  it('does not show file list when no files are added', () => {
    render(<FileUploader />)
    expect(screen.queryByTestId('file-list')).toBeNull()
  })

  it('applies custom className', () => {
    render(<FileUploader className="custom-uploader" />)
    const el = screen.getByTestId('file-uploader')
    expect(el.className).toContain('custom-uploader')
  })

  it('uses custom buttonLabel', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    render(<FileUploader options={{ onUpload }} buttonLabel="Send" />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    expect(screen.getByTestId('upload-btn').textContent).toBe('Send')
  })

  it('uploads files and shows success state', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    render(<FileUploader options={{ onUpload }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('upload-btn'))
    })

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('status-success')).toBeDefined()
  })

  it('disables upload button after all files are uploaded', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    render(<FileUploader options={{ onUpload }} />)
    const input = screen.getByTestId('file-input') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: createMockFileList([createMockFile('test.txt', 100, 'text/plain')]),
      configurable: true,
    })

    await act(async () => {
      fireEvent.change(input)
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('upload-btn'))
    })

    const btn = screen.getByTestId('upload-btn') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})

// ===========================================================================
// 4. Edge cases
// ===========================================================================

describe('FileUploader edge cases', () => {
  it('handles empty FileList gracefully on drop', async () => {
    render(<FileUploader />)
    const zone = screen.getByTestId('drop-zone')

    await act(async () => {
      fireEvent.drop(zone, {
        dataTransfer: { files: createMockFileList([]) },
      })
    })

    expect(screen.queryByTestId('file-list')).toBeNull()
  })

  it('handles file with empty type for extension matching', () => {
    const { result } = renderHook(() =>
      useFileUpload({ acceptTypes: ['.csv'] }),
    )
    const csvFile = createMockFile('data.csv', 100, '')

    actHook(() => {
      result.current.addFiles([csvFile])
    })

    expect(result.current.files[0].status).toBe('pending')
  })

  it('validates type before size', () => {
    const { result } = renderHook(() =>
      useFileUpload({ acceptTypes: ['image/*'], maxSizeBytes: 50 }),
    )
    // File is wrong type AND too big — type error takes precedence
    const file = createMockFile('big.txt', 1000, 'text/plain')

    actHook(() => {
      result.current.addFiles([file])
    })

    expect(result.current.files[0].error).toContain('not allowed')
  })

  it('handles maxFiles of 0', () => {
    const { result } = renderHook(() => useFileUpload({ maxFiles: 0 }))

    actHook(() => {
      result.current.addFiles([createMockFile('a.txt', 100, 'text/plain')])
    })

    expect(result.current.files).toHaveLength(0)
  })
})
