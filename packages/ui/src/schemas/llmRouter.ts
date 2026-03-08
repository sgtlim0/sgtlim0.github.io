import { z } from 'zod'

// ============= Model Catalog =============

export const llmModelCategoryEnum = z.enum([
  'chat',
  'completion',
  'embedding',
  'image',
  'audio',
  'code',
])

export const llmModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '모델 이름을 입력해주세요'),
  provider: z.string().min(1, '프로바이더를 선택해주세요'),
  providerIcon: z.string().min(1),
  category: llmModelCategoryEnum,
  inputPrice: z.number().nonnegative('입력 가격은 0 이상이어야 합니다'),
  outputPrice: z.number().nonnegative('출력 가격은 0 이상이어야 합니다'),
  contextWindow: z
    .number()
    .int()
    .positive('컨텍스트 윈도우는 1 이상이어야 합니다'),
  maxOutput: z
    .number()
    .int()
    .positive('최대 출력 토큰은 1 이상이어야 합니다'),
  latency: z.string().min(1),
  isPopular: z.boolean().optional(),
})

// ============= Model Search / Filter =============

export const modelFilterParamsSchema = z.object({
  provider: z.string().optional(),
  category: llmModelCategoryEnum.optional(),
  search: z
    .string()
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

// ============= Model Comparison =============

export const modelComparisonRequestSchema = z.object({
  modelIds: z
    .array(z.string().min(1))
    .min(2, '비교하려면 최소 2개의 모델이 필요합니다')
    .max(5, '한 번에 최대 5개의 모델까지 비교 가능합니다'),
})

// ============= API Key Management =============

export const apiKeyStatusEnum = z.enum(['active', 'revoked'])

export const apiKeySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  key: z.string().min(1),
  created: z.string(),
  lastUsed: z.string(),
  status: apiKeyStatusEnum,
})

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API 키 이름을 입력해주세요')
    .max(100, 'API 키 이름은 100자를 초과할 수 없습니다'),
})

// ============= Usage Statistics =============

export const usageStatSchema = z.object({
  date: z.string(),
  requests: z.number().int().nonnegative(),
  tokens: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
})

export const monthlyUsageSchema = z.object({
  month: z.string(),
  requests: z.number().int().nonnegative(),
  tokens: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
})

export const dashboardStatsSchema = z.object({
  totalModels: z.number().int().nonnegative(),
  totalRequests: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  avgLatency: z.string(),
})

// ============= Streaming Chat =============

export const streamingChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, '메시지를 입력해주세요'),
})

export const streamingOptionsSchema = z.object({
  model: z.string().min(1, '모델을 선택해주세요'),
  messages: z
    .array(streamingChatMessageSchema)
    .min(1, '최소 1개 이상의 메시지가 필요합니다')
    .max(100, '메시지는 100개를 초과할 수 없습니다'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(200000).optional(),
  topP: z.number().min(0).max(1).optional(),
})

// ============= Inferred Types =============

export type LLMModelInput = z.infer<typeof llmModelSchema>
export type ModelFilterParamsInput = z.infer<typeof modelFilterParamsSchema>
export type ModelComparisonRequestInput = z.infer<typeof modelComparisonRequestSchema>
export type ApiKeyInput = z.infer<typeof apiKeySchema>
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type UsageStatInput = z.infer<typeof usageStatSchema>
export type MonthlyUsageInput = z.infer<typeof monthlyUsageSchema>
export type DashboardStatsInput = z.infer<typeof dashboardStatsSchema>
export type StreamingChatMessageInput = z.infer<typeof streamingChatMessageSchema>
export type StreamingOptionsInput = z.infer<typeof streamingOptionsSchema>
