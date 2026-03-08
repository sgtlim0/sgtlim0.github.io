import { z } from 'zod'

export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다')
export const urlSchema = z.string().url('올바른 URL 형식이 아닙니다')
export const apiKeySchema = z
  .string()
  .regex(/^sk-[a-zA-Z0-9]{10,}$/, '올바른 API 키 형식이 아닙니다')
export const phoneSchema = z
  .string()
  .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다')

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>
