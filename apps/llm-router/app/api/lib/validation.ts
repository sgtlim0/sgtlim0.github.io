/**
 * Zod validation schemas for LLM Router API request bodies.
 *
 * Re-exports from @hchat/ui shared schemas where possible,
 * plus LLM Router-specific API route schemas.
 */

import { z } from 'zod'

// Re-export shared schemas from @hchat/ui for API route validation
export {
  streamingOptionsSchema,
  modelComparisonRequestSchema,
  createApiKeySchema,
  modelFilterParamsSchema,
} from '@hchat/ui/schemas'

// ============= Query Parameter Schemas =============

export const modelQuerySchema = z.object({
  provider: z.string().max(100).optional(),
  category: z.enum(['chat', 'completion', 'embedding', 'image', 'audio', 'code']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const usageQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

export const modelIdSchema = z.object({
  id: z.string().min(1, '모델 ID를 입력해주세요'),
})

export type ModelQuery = z.infer<typeof modelQuerySchema>
export type UsageQuery = z.infer<typeof usageQuerySchema>
