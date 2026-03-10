/**
 * Line-based diff utility using Longest Common Subsequence (LCS) algorithm.
 *
 * Pure functions — no external dependencies, no side effects.
 */

export type DiffLineType = 'added' | 'removed' | 'unchanged'

export interface DiffLine {
  readonly type: DiffLineType
  readonly content: string
  readonly oldLineNumber?: number
  readonly newLineNumber?: number
}

export interface DiffResult {
  readonly additions: number
  readonly deletions: number
  readonly changes: readonly DiffLine[]
}

/**
 * Split text into lines, preserving empty trailing line only when content
 * explicitly ends with a newline character.
 */
function splitLines(text: string): readonly string[] {
  if (text === '') return []
  const lines = text.split('\n')
  // Remove trailing empty string from split (artifact of trailing newline)
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    return lines.slice(0, -1)
  }
  return lines
}

/**
 * Compute the LCS table for two arrays of strings.
 * Returns a 2D array where lcs[i][j] is the length of the LCS
 * of oldLines[0..i-1] and newLines[0..j-1].
 */
function computeLCSTable(
  oldLines: readonly string[],
  newLines: readonly string[],
): readonly (readonly number[])[] {
  const m = oldLines.length
  const n = newLines.length
  const table: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  return table
}

/**
 * Backtrack through the LCS table to produce a list of diff lines.
 */
function backtrack(
  oldLines: readonly string[],
  newLines: readonly string[],
  table: readonly (readonly number[])[],
): DiffLine[] {
  const result: DiffLine[] = []
  let i = oldLines.length
  let j = newLines.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        type: 'unchanged',
        content: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      result.push({
        type: 'added',
        content: newLines[j - 1],
        newLineNumber: j,
      })
      j--
    } else {
      result.push({
        type: 'removed',
        content: oldLines[i - 1],
        oldLineNumber: i,
      })
      i--
    }
  }

  return result.reverse()
}

/**
 * Compute a line-based diff between two text strings.
 *
 * Uses the LCS (Longest Common Subsequence) algorithm to identify
 * added, removed, and unchanged lines.
 *
 * @param oldText - The original text
 * @param newText - The modified text
 * @returns DiffResult with addition/deletion counts and line-by-line changes
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = splitLines(oldText)
  const newLines = splitLines(newText)

  const table = computeLCSTable(oldLines, newLines)
  const changes = backtrack(oldLines, newLines, table)

  let additions = 0
  let deletions = 0
  for (const line of changes) {
    if (line.type === 'added') additions++
    else if (line.type === 'removed') deletions++
  }

  return { additions, deletions, changes }
}

/**
 * Generate a unified diff string (similar to `diff -u` output).
 */
export function formatUnifiedDiff(diff: DiffResult): string {
  const lines: string[] = []
  for (const change of diff.changes) {
    switch (change.type) {
      case 'added':
        lines.push(`+ ${change.content}`)
        break
      case 'removed':
        lines.push(`- ${change.content}`)
        break
      case 'unchanged':
        lines.push(`  ${change.content}`)
        break
    }
  }
  return lines.join('\n')
}
