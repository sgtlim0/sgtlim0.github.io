import { z } from 'zod'

export const encoderOptionsSchema = z.object({
  entropyThreshold: z.number().min(0).max(1).default(0.3),
  language: z.enum(['ko', 'en', 'auto']).default('auto'),
  minWords: z.number().int().min(1).default(5),
  compressionFloor: z.number().min(0).max(1).default(0.4),
})

export const textEncoderInputSchema = z.object({
  text: z.string().min(1, '텍스트를 입력해주세요').max(100_000, '텍스트가 너무 깁니다'),
  options: encoderOptionsSchema.optional(),
})

export type EncoderOptionsInput = z.infer<typeof encoderOptionsSchema>
export type TextEncoderInput = z.infer<typeof textEncoderInputSchema>
