// ---------------------------------------------------------------------------
// Code Tokenizer — lightweight regex-based tokenizer for syntax highlighting
// Supports: JavaScript, TypeScript, Python, CSS, JSON, Bash
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'operator'
  | 'punctuation'
  | 'plain'

export interface Token {
  readonly type: TokenType
  readonly value: string
}

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'css' | 'json' | 'bash'

// ---------------------------------------------------------------------------
// Language keyword sets
// ---------------------------------------------------------------------------

const KEYWORDS: Readonly<Record<SupportedLanguage, ReadonlySet<string>>> = {
  javascript: new Set([
    'abstract', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
    'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export',
    'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'import',
    'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'static', 'super',
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var',
    'void', 'while', 'with', 'yield',
  ]),
  typescript: new Set([
    'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class',
    'const', 'continue', 'debugger', 'declare', 'default', 'delete', 'do',
    'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from',
    'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface',
    'keyof', 'let', 'new', 'null', 'of', 'private', 'protected', 'public',
    'readonly', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true',
    'try', 'type', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
  ]),
  python: new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
    'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
    'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  ]),
  css: new Set([
    'important', 'inherit', 'initial', 'unset', 'revert', 'none', 'auto',
    'block', 'flex', 'grid', 'inline', 'relative', 'absolute', 'fixed',
    'sticky', 'static', 'hidden', 'visible', 'solid', 'dashed', 'dotted',
  ]),
  json: new Set(['true', 'false', 'null']),
  bash: new Set([
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case',
    'esac', 'function', 'return', 'exit', 'echo', 'export', 'local', 'readonly',
    'shift', 'unset', 'set', 'source', 'cd', 'ls', 'grep', 'awk', 'sed',
    'cat', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'curl', 'wget',
  ]),
}

// ---------------------------------------------------------------------------
// Tokenizer rules per language (order matters — first match wins)
// ---------------------------------------------------------------------------

interface TokenRule {
  readonly type: TokenType
  readonly pattern: RegExp
}

function buildRules(language: SupportedLanguage): readonly TokenRule[] {
  switch (language) {
    case 'json':
      return [
        { type: 'string', pattern: /^"(?:[^"\\]|\\.)*"/ },
        { type: 'number', pattern: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
        { type: 'keyword', pattern: /^(?:true|false|null)\b/ },
        { type: 'punctuation', pattern: /^[{}[\]:,]/ },
      ]

    case 'css':
      return [
        { type: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
        { type: 'string', pattern: /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
        { type: 'number', pattern: /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|s|ms)?/ },
        { type: 'punctuation', pattern: /^[{}();:,]/ },
        { type: 'operator', pattern: /^[>~+*=]/ },
      ]

    case 'python':
      return [
        { type: 'comment', pattern: /^#[^\n]*/ },
        { type: 'string', pattern: /^(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
        { type: 'number', pattern: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
        { type: 'operator', pattern: /^(?:->|==|!=|<=|>=|<<|>>|\*\*|\/\/|[+\-*/%=<>!&|^~])/ },
        { type: 'punctuation', pattern: /^[{}[\]():,.]/ },
      ]

    case 'bash':
      return [
        { type: 'comment', pattern: /^#[^\n]*/ },
        { type: 'string', pattern: /^(?:"(?:[^"\\]|\\.)*"|'[^']*')/ },
        { type: 'number', pattern: /^\d+/ },
        { type: 'operator', pattern: /^(?:&&|\|\||[|><&;])/ },
        { type: 'punctuation', pattern: /^[{}[\]()]/ },
      ]

    case 'javascript':
    case 'typescript':
    default:
      return [
        { type: 'comment', pattern: /^\/\/[^\n]*/ },
        { type: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
        { type: 'string', pattern: /^(?:`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
        { type: 'number', pattern: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
        { type: 'operator', pattern: /^(?:===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?])/ },
        { type: 'punctuation', pattern: /^[{}[\]():;,.]/ },
      ]
  }
}

// ---------------------------------------------------------------------------
// Resolve language alias
// ---------------------------------------------------------------------------

const LANGUAGE_ALIASES: Readonly<Record<string, SupportedLanguage>> = {
  js: 'javascript',
  jsx: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  css: 'css',
  scss: 'css',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
}

export function resolveLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'javascript'
  const normalized = lang.toLowerCase().trim()
  return LANGUAGE_ALIASES[normalized] ?? 'javascript'
}

// ---------------------------------------------------------------------------
// Tokenize a single line
// ---------------------------------------------------------------------------

export function tokenizeLine(line: string, language: SupportedLanguage): readonly Token[] {
  const tokens: Token[] = []
  const rules = buildRules(language)
  const keywords = KEYWORDS[language]
  let remaining = line

  while (remaining.length > 0) {
    // Skip whitespace — emit as plain
    const wsMatch = remaining.match(/^\s+/)
    if (wsMatch) {
      tokens.push({ type: 'plain', value: wsMatch[0] })
      remaining = remaining.slice(wsMatch[0].length)
      continue
    }

    // Try each rule
    let matched = false
    for (const rule of rules) {
      const m = remaining.match(rule.pattern)
      if (m) {
        tokens.push({ type: rule.type, value: m[0] })
        remaining = remaining.slice(m[0].length)
        matched = true
        break
      }
    }

    if (matched) continue

    // Word — check if keyword
    const wordMatch = remaining.match(/^[a-zA-Z_$][\w$]*/)
    if (wordMatch) {
      const word = wordMatch[0]
      const type: TokenType = keywords.has(word) ? 'keyword' : 'plain'
      tokens.push({ type, value: word })
      remaining = remaining.slice(word.length)
      continue
    }

    // Fallback — emit single character as plain
    tokens.push({ type: 'plain', value: remaining[0] })
    remaining = remaining.slice(1)
  }

  return tokens
}

// ---------------------------------------------------------------------------
// CSS class mapping for token types
// ---------------------------------------------------------------------------

export const TOKEN_CLASS_MAP: Readonly<Record<TokenType, string>> = {
  keyword: 'ch-keyword',
  string: 'ch-string',
  number: 'ch-number',
  comment: 'ch-comment',
  operator: 'ch-operator',
  punctuation: 'ch-punctuation',
  plain: 'ch-plain',
}
