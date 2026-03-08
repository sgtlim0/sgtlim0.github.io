/**
 * Zod validation schemas for API request bodies.
 */

import { z } from 'zod'

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(50)
    .default([]),
  use_compression: z.boolean().default(true),
})

export const researchRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  num_sources: z.number().int().min(1).max(10).default(3),
})

export const analyzeRequestSchema = z.object({
  text: z.string().min(1).max(50000),
  mode: z.enum(['summarize', 'explain', 'research', 'translate']),
  url: z.string().url().optional(),
  title: z.string().max(500).optional(),
})

export type ChatRequestBody = z.infer<typeof chatRequestSchema>
export type ResearchRequestBody = z.infer<typeof researchRequestSchema>
export type AnalyzeRequestBody = z.infer<typeof analyzeRequestSchema>
