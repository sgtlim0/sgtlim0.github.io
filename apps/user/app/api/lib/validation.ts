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

export type ChatRequestBody = z.infer<typeof chatRequestSchema>
export type ResearchRequestBody = z.infer<typeof researchRequestSchema>
