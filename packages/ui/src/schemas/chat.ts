import { z } from 'zod'

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, '메시지를 입력해주세요'),
})

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, '메시지를 입력해주세요')
    .max(10000, '메시지는 10000자를 초과할 수 없습니다'),
  assistantId: z.string().optional(),
  conversationId: z.string().optional(),
  history: z.array(chatMessageSchema).max(50, '대화 기록은 50개를 초과할 수 없습니다').default([]),
  use_compression: z.boolean().default(true),
})

export const researchRequestSchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요')
    .max(2000, '검색어는 2000자를 초과할 수 없습니다'),
  num_sources: z
    .number()
    .int()
    .min(1, '최소 1개 이상이어야 합니다')
    .max(10, '최대 10개까지 가능합니다')
    .default(3),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>
export type ChatRequestInput = z.infer<typeof chatRequestSchema>
export type ResearchRequestInput = z.infer<typeof researchRequestSchema>
