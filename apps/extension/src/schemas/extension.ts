import { z } from 'zod'

export const analysisModeSchema = z.enum(['summarize', 'explain', 'research', 'translate'])

export const analyzeRequestSchema = z.object({
  text: z.string().min(1, '텍스트를 입력해주세요').max(10000),
  mode: analysisModeSchema,
  url: z.string().url().optional(),
  title: z.string().max(500).optional(),
  targetLang: z.string().max(10).optional(),
})

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['ko', 'en']),
  apiMode: z.enum(['mock', 'real']),
  apiBaseUrl: z.string().url(),
  maxTextLength: z.number().int().min(100).max(50000),
  autoSanitize: z.boolean(),
  enableSidePanel: z.boolean(),
  enableShortcuts: z.boolean(),
})

export const pageContextSchema = z.object({
  text: z.string().max(10000),
  url: z.string(),
  title: z.string().max(500),
  favicon: z.string().optional(),
  timestamp: z.number(),
  sanitized: z.boolean(),
})

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type PageContextInput = z.infer<typeof pageContextSchema>
