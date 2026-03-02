'use client';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parseMarkdown = (text: string): string => {
    let html = text;

    // Code blocks (must be first to avoid processing their contents)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="code-block"><code>${escapedCode}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3 class="heading-3">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="heading-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="heading-1">$1</h1>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="horizontal-rule" />');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="link" target="_blank" rel="noopener noreferrer">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*)$/gm, '<blockquote class="blockquote">$1</blockquote>');

    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

      // Check if this is a separator row
      if (cells.every((cell) => /^[-:]+$/.test(cell))) {
        return '<tr class="table-separator"></tr>';
      }

      const cellsHtml = cells.map((cell) => `<td class="table-cell">${cell}</td>`).join('');
      return `<tr class="table-row">${cellsHtml}</tr>`;
    });

    // Wrap table rows in table
    html = html.replace(/(<tr class="table-row">[\s\S]*?<\/tr>)+/g, (match) => {
      const rows = match.split('</tr>').filter(Boolean);
      const headerRow = rows[0] + '</tr>';
      const bodyRows = rows.slice(1).map((row) => row + '</tr>').join('');

      const headerCells = headerRow.replace(/<td/g, '<th').replace(/<\/td>/g, '</th>');

      return `<table class="markdown-table"><thead>${headerCells}</thead><tbody>${bodyRows}</tbody></table>`;
    });

    // Unordered lists
    html = html.replace(/^- (.*)$/gm, '<li class="list-item">$1</li>');
    html = html.replace(/(<li class="list-item">.*<\/li>\n?)+/g, '<ul class="unordered-list">$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*)$/gm, '<li class="list-item">$1</li>');
    html = html.replace(/(<li class="list-item">.*<\/li>\n?)+/g, (match) => {
      // Only wrap in ol if not already wrapped in ul
      if (match.includes('<ul')) return match;
      return `<ol class="ordered-list">${match}</ol>`;
    });

    // Paragraphs
    html = html.replace(/^(?!<[hblotu]|<\/|<pre|<code|<hr|<table)(.+)$/gm, '<p class="paragraph">$1</p>');

    return html;
  };

  const htmlContent = parseMarkdown(content);

  return (
    <div
      className={`markdown-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--code-bg': 'var(--user-text-primary)',
        '--code-text': 'var(--user-bg-main)',
      } as React.CSSProperties}
    >
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
  );
}
