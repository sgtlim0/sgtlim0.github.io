import { z } from 'zod'

export const loginCredentialsSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
  rememberMe: z.boolean().optional(),
})

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'viewer']),
  organization: z.string(),
  avatarUrl: z.string().url().optional(),
})

export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>
export type AuthUserOutput = z.infer<typeof authUserSchema>
