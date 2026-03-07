'use client'

import React, { useMemo } from 'react'

export interface MarkdownRendererProps {
  content: string
  className?: string
}

interface ParsedNode {
  type: 'heading' | 'paragraph' | 'code-block' | 'blockquote' | 'list' | 'hr' | 'table'
  level?: number
  ordered?: boolean
  items?: string[]
  content?: string
  lang?: string
  rows?: string[][]
}

function escapeForRegex(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[ch] ?? ch
  })
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      const code = match[1].slice(1, -1)
      nodes.push(
        <code key={key++} className="inline-code">
          {code}
        </code>,
      )
    } else if (match[2]) {
      const bold = match[2].slice(2, -2)
      nodes.push(<strong key={key++}>{bold}</strong>)
    } else if (match[3]) {
      const italic = match[3].slice(1, -1)
      nodes.push(<em key={key++}>{italic}</em>)
    } else if (match[4] && match[5] && match[6]) {
      nodes.push(
        <a key={key++} href={match[6]} className="link" target="_blank" rel="noopener noreferrer">
          {match[5]}
        </a>,
      )
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function parseBlocks(content: string): ParsedNode[] {
  const lines = content.split('\n')
  const blocks: ParsedNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code-block', content: codeLines.join('\n'), lang })
      continue
    }

    // Horizontal rule
    if (/^---$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/)
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2] })
      i++
      continue
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', content: line.slice(2) })
      i++
      continue
    }

    // Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) {
        const cells = lines[i]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
        if (!cells.every((c) => /^[-:]+$/.test(c))) {
          rows.push(cells)
        }
        i++
      }
      blocks.push({ type: 'table', rows })
      continue
    }

    // Unordered list
    if (line.match(/^- /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph
    blocks.push({ type: 'paragraph', content: line })
    i++
  }

  return blocks
}

function renderBlock(block: ParsedNode, index: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3'
      return (
        <Tag key={index} className={`heading-${block.level}`}>
          {renderInline(block.content ?? '')}
        </Tag>
      )
    }
    case 'paragraph':
      return (
        <p key={index} className="paragraph">
          {renderInline(block.content ?? '')}
        </p>
      )
    case 'code-block':
      return (
        <pre key={index} className="code-block">
          <code>{block.content}</code>
        </pre>
      )
    case 'blockquote':
      return (
        <blockquote key={index} className="blockquote">
          {renderInline(block.content ?? '')}
        </blockquote>
      )
    case 'hr':
      return <hr key={index} className="horizontal-rule" />
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      const listClass = block.ordered ? 'ordered-list' : 'unordered-list'
      return (
        <ListTag key={index} className={listClass}>
          {block.items?.map((item, j) => (
            <li key={j} className="list-item">
              {renderInline(item)}
            </li>
          ))}
        </ListTag>
      )
    }
    case 'table': {
      if (!block.rows || block.rows.length === 0) return null
      const [header, ...body] = block.rows
      return (
        <table key={index} className="markdown-table">
          <thead>
            <tr className="table-row">
              {header.map((cell, j) => (
                <th key={j} className="table-cell">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, j) => (
              <tr key={j} className="table-row">
                {row.map((cell, k) => (
                  <td key={k} className="table-cell">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    default:
      return null
  }
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const blocks = useMemo(() => parseBlocks(content), [content])

  return (
    <div
      className={`markdown-renderer ${className}`}
      style={
        {
          '--code-bg': 'var(--user-text-primary)',
          '--code-text': 'var(--user-bg-main)',
        } as React.CSSProperties
      }
    >
      {blocks.map((block, i) => renderBlock(block, i))}
      <style jsx>{`
        .markdown-renderer {
          color: var(--user-text-primary);
          line-height: 1.6;
        }

        .markdown-renderer .heading-1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: var(--user-text-primary);
        }

        .markdown-renderer .heading-2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: var(--user-text-primary);
        }

        .markdown-renderer .heading-3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: var(--user-text-primary);
        }

        .markdown-renderer .paragraph {
          margin-bottom: 1em;
        }

        .markdown-renderer .inline-code {
          background-color: var(--user-bg-section);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em;
        }

        .markdown-renderer .code-block {
          background-color: var(--code-bg);
          color: var(--code-text);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em;
          line-height: 1.5;
        }

        .markdown-renderer .code-block code {
          background: none;
          padding: 0;
          border-radius: 0;
          color: inherit;
        }

        .markdown-renderer .link {
          color: var(--user-primary);
          text-decoration: underline;
        }

        .markdown-renderer .link:hover {
          opacity: 0.8;
        }

        .markdown-renderer .blockquote {
          border-left: 4px solid var(--user-primary);
          padding-left: 1rem;
          margin: 1em 0;
          background-color: var(--user-bg-section);
          padding: 0.75rem 1rem;
          border-radius: 0.25rem;
          color: var(--user-text-secondary);
        }

        .markdown-renderer .unordered-list,
        .markdown-renderer .ordered-list {
          margin: 1em 0;
          padding-left: 2em;
        }

        .markdown-renderer .list-item {
          margin-bottom: 0.5em;
        }

        .markdown-renderer .horizontal-rule {
          border: none;
          border-top: 1px solid var(--user-border);
          margin: 2em 0;
        }

        .markdown-renderer .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          overflow-x: auto;
          display: block;
        }

        .markdown-renderer .markdown-table thead {
          background-color: var(--user-bg-section);
        }

        .markdown-renderer .markdown-table th,
        .markdown-renderer .markdown-table td {
          border: 1px solid var(--user-border);
          padding: 0.5rem 1rem;
          text-align: left;
        }

        .markdown-renderer .markdown-table th {
          font-weight: 600;
          color: var(--user-text-primary);
        }

        .markdown-renderer .markdown-table td {
          color: var(--user-text-secondary);
        }

        .markdown-renderer .table-separator {
          display: none;
        }
      `}</style>
    </div>
  )
}
