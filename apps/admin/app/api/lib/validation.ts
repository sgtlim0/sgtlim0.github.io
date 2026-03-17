/**
 * Zod validation schemas for Admin API request bodies.
 *
 * Re-exports from @hchat/ui shared schemas where possible,
 * plus admin-specific API route schemas.
 */

import { z } from 'zod'

// Re-export shared schemas from @hchat/ui for API route validation
export {
  departmentBulkRequestSchema,
  userBulkRequestSchema,
  auditLogQuerySchema,
  ssoConfigSchema,
  adminSettingsSchema,
  createUserSchema,
  updateUserSchema,
  loginCredentialsSchema,
} from '@hchat/ui/schemas'

// ============= Query Parameter Schemas =============

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
})

export const departmentQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(1000).default(1000),
})

export const userQuerySchema = paginationQuerySchema.extend({
  workspaceId: z.coerce.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
})

export const auditLogDownloadQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  workspaceId: z.coerce.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  eventDetail: z.enum(['login', 'upload', 'download']).optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isXlsx: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
})

export const bulkQuerySchema = z.object({
  implicitDeletion: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
})

export const userBulkQuerySchema = bulkQuerySchema.extend({
  idType: z.enum(['userId', 'email']).default('userId'),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type DepartmentQuery = z.infer<typeof departmentQuerySchema>
export type UserQuery = z.infer<typeof userQuerySchema>
export type AuditLogDownloadQuery = z.infer<typeof auditLogDownloadQuerySchema>
export type BulkQuery = z.infer<typeof bulkQuerySchema>
export type UserBulkQuery = z.infer<typeof userBulkQuerySchema>
