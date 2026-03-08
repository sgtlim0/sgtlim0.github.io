import { z } from 'zod'

// ============= Assistant Categories =============

export const assistantCategoryEnum = z.enum([
  '전체',
  '채팅',
  '업무',
  '번역',
  '정리',
  '보고',
  '그림',
  '글쓰기',
])

export const assistantCategoryWithoutAllEnum = z.enum([
  '채팅',
  '업무',
  '번역',
  '정리',
  '보고',
  '그림',
  '글쓰기',
])

// ============= Assistant Configuration =============

export const assistantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자를 초과할 수 없습니다'),
  icon: z.string().min(1, '아이콘을 선택해주세요'),
  iconColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, '올바른 색상 코드 형식이 아닙니다'),
  model: z.string().min(1, '모델을 선택해주세요'),
  description: z
    .string()
    .min(1, '설명을 입력해주세요')
    .max(500, '설명은 500자를 초과할 수 없습니다'),
  category: assistantCategoryWithoutAllEnum,
  isOfficial: z.boolean(),
})

export const createAssistantSchema = assistantSchema.omit({
  id: true,
  isOfficial: true,
})

export const updateAssistantSchema = assistantSchema
  .omit({ id: true, isOfficial: true })
  .partial()

// ============= Conversation =============

export const createConversationSchema = z.object({
  assistantId: z.string().min(1, '어시스턴트를 선택해주세요'),
  title: z
    .string()
    .min(1, '대화 제목을 입력해주세요')
    .max(200, '대화 제목은 200자를 초과할 수 없습니다'),
})

// ============= Chat Message =============

export const chatMessageModeEnum = z.enum(['chat', 'research'])

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url('올바른 URL 형식이 아닙니다'),
  snippet: z.string().optional(),
})

export const compressionStatsSchema = z.object({
  originalTokens: z.number().int().nonnegative(),
  compressedTokens: z.number().int().nonnegative(),
  reductionPct: z.number().min(0).max(100),
})

export const createMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z
    .string()
    .min(1, '메시지를 입력해주세요')
    .max(50000, '메시지는 50000자를 초과할 수 없습니다'),
  sessionId: z.string().optional(),
  assistantId: z.string().optional(),
  mode: chatMessageModeEnum.optional(),
  sources: z.array(sourceSchema).max(20).optional(),
  compressionStats: compressionStatsSchema.optional(),
})

// ============= Chat Search =============

export const chatSearchQuerySchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요')
    .max(200, '검색어는 200자를 초과할 수 없습니다'),
  assistantId: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  mode: chatMessageModeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(20),
})

// ============= Translation =============

export const translationEngineEnum = z.enum(['internal', 'deepl'])

export const translationJobSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  engine: translationEngineEnum,
  status: z.enum(['uploading', 'processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  resultUrl: z.string().url().optional(),
  createdAt: z.string(),
})

// ============= Document Projects =============

export const docTypeEnum = z.enum(['HWP', 'DOCX'])

export const docProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(200),
  docType: docTypeEnum,
  lastModified: z.string(),
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
})

// ============= Inferred Types =============

export type AssistantInput = z.infer<typeof assistantSchema>
export type CreateAssistantInput = z.infer<typeof createAssistantSchema>
export type UpdateAssistantInput = z.infer<typeof updateAssistantSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type CreateMessageInput = z.infer<typeof createMessageSchema>
export type ChatSearchQueryInput = z.infer<typeof chatSearchQuerySchema>
export type SourceInput = z.infer<typeof sourceSchema>
export type CompressionStatsInput = z.infer<typeof compressionStatsSchema>
export type TranslationJobInput = z.infer<typeof translationJobSchema>
export type DocProjectInput = z.infer<typeof docProjectSchema>
