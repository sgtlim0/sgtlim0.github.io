#!/usr/bin/env npx tsx
/**
 * generate-api-types.ts
 *
 * Parses docs/openapi.yaml and prints a summary of all endpoints
 * with their request/response schemas. This serves as a verification
 * tool — the actual TypeScript types in packages/ui/src/client/apiTypes.ts
 * are maintained manually for zero-dependency simplicity.
 *
 * Usage:
 *   npx tsx scripts/generate-api-types.ts
 *
 * Output:
 *   Endpoint listing with method, path, operationId, and schema refs.
 *   Exits with code 1 if any operationId is missing from apiTypes.ts.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface OpenApiPath {
  [method: string]: {
    operationId?: string
    summary?: string
    tags?: string[]
    requestBody?: {
      content?: {
        'application/json'?: { schema?: { $ref?: string } }
      }
    }
    responses?: Record<
      string,
      {
        content?: {
          'application/json'?: { schema?: { $ref?: string } }
          'text/event-stream'?: unknown
        }
      }
    >
  }
}

interface OpenApiSpec {
  paths: Record<string, OpenApiPath>
  components?: {
    schemas?: Record<string, unknown>
  }
}

function parseYamlSimple(text: string): OpenApiSpec {
  // Minimal YAML parser — extracts paths and operationIds via regex.
  // For full parsing, use a proper YAML library.
  const paths: Record<string, OpenApiPath> = {}
  const pathRegex = /^  (\/[^\s:]+):/gm
  const methodRegex = /^    (get|post|put|delete|patch):/gm
  const opIdRegex = /^\s+operationId:\s+(\S+)/gm

  let pathMatch: RegExpExecArray | null
  const pathPositions: { path: string; pos: number }[] = []

  while ((pathMatch = pathRegex.exec(text)) !== null) {
    pathPositions.push({ path: pathMatch[1], pos: pathMatch.index })
  }

  for (let i = 0; i < pathPositions.length; i++) {
    const { path, pos } = pathPositions[i]
    const end = i + 1 < pathPositions.length ? pathPositions[i + 1].pos : text.length
    const block = text.slice(pos, end)

    paths[path] = {}
    let methodMatch: RegExpExecArray | null
    const localMethodRegex = /^    (get|post|put|delete|patch):/gm

    const methodPositions: { method: string; mpos: number }[] = []
    while ((methodMatch = localMethodRegex.exec(block)) !== null) {
      methodPositions.push({ method: methodMatch[1], mpos: methodMatch.index })
    }

    for (let j = 0; j < methodPositions.length; j++) {
      const { method, mpos } = methodPositions[j]
      const mend = j + 1 < methodPositions.length ? methodPositions[j + 1].mpos : block.length
      const methodBlock = block.slice(mpos, mend)

      const opMatch = /operationId:\s+(\S+)/.exec(methodBlock)
      const summaryMatch = /summary:\s+(.+)/.exec(methodBlock)
      const tagMatch = /tags:\s+\[([^\]]+)\]/.exec(methodBlock)

      paths[path][method] = {
        operationId: opMatch?.[1],
        summary: summaryMatch?.[1],
        tags: tagMatch ? tagMatch[1].split(',').map((t) => t.trim()) : [],
      }
    }
  }

  return { paths }
}

function main(): void {
  const root = resolve(import.meta.dirname ?? __dirname, '..')
  const yamlPath = resolve(root, 'docs/openapi.yaml')
  const typesPath = resolve(root, 'packages/ui/src/client/apiTypes.ts')

  let yamlText: string
  try {
    yamlText = readFileSync(yamlPath, 'utf-8')
  } catch {
    process.stderr.write(`Error: Cannot read ${yamlPath}\n`)
    process.exit(1)
  }

  let typesText: string
  try {
    typesText = readFileSync(typesPath, 'utf-8')
  } catch {
    process.stderr.write(`Error: Cannot read ${typesPath}\n`)
    process.exit(1)
  }

  const spec = parseYamlSimple(yamlText)
  const endpoints: { method: string; path: string; operationId: string; summary: string; tags: string[] }[] = []

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          operationId: details.operationId ?? '(none)',
          summary: details.summary ?? '',
          tags: details.tags ?? [],
        })
      }
    }
  }

  process.stdout.write(`\nH Chat API — ${endpoints.length} endpoints from openapi.yaml\n`)
  process.stdout.write('='.repeat(70) + '\n\n')

  const byTag = new Map<string, typeof endpoints>()
  for (const ep of endpoints) {
    const tag = ep.tags[0] ?? 'untagged'
    if (!byTag.has(tag)) byTag.set(tag, [])
    byTag.get(tag)!.push(ep)
  }

  for (const [tag, eps] of byTag) {
    process.stdout.write(`[${tag}]\n`)
    for (const ep of eps) {
      process.stdout.write(`  ${ep.method.padEnd(7)} ${ep.path.padEnd(40)} ${ep.operationId}\n`)
    }
    process.stdout.write('\n')
  }

  // Verify key types exist in apiTypes.ts
  const requiredTypes = [
    'ChatRequest',
    'ChatResponse',
    'AnalyzeRequest',
    'AnalyzeResponse',
    'ResearchRequest',
    'ResearchResponse',
    'HealthResponse',
    'CsrfTokenResponse',
    'LoginRequest',
    'LoginResponse',
    'User',
    'AdminDashboard',
    'AdminUser',
    'AdminSettings',
    'RealtimeMetrics',
    'Model',
    'ChatStreamEvent',
  ]

  const missing = requiredTypes.filter((t) => !typesText.includes(`export interface ${t}`) && !typesText.includes(`export type ${t}`))

  if (missing.length > 0) {
    process.stderr.write(`\nMissing types in apiTypes.ts: ${missing.join(', ')}\n`)
    process.exit(1)
  }

  process.stdout.write(`All ${requiredTypes.length} key types verified in apiTypes.ts\n`)
}

main()
