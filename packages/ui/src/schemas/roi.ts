import { z } from 'zod'

export const roiRecordSchema = z.object({
  날짜: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  사용자ID: z.string().min(1),
  부서: z.string().min(1),
  직급: z.string().min(1),
  기능: z.string().min(1),
  모델: z.string().min(1),
  토큰수: z.number().int().nonnegative(),
  절감시간_분: z.number().nonnegative(),
  만족도: z.number().int().min(1).max(5),
})

export const roiDatasetSchema = z
  .array(roiRecordSchema)
  .min(1, '최소 1개 이상의 레코드가 필요합니다')

export type ROIRecord = z.infer<typeof roiRecordSchema>
export type ROIDataset = z.infer<typeof roiDatasetSchema>
