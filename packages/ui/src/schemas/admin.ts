import { z } from 'zod'

// ============= Provider Configuration =============

export const providerStatusEnum = z.enum(['online', 'degraded', 'offline'])

export const providerInfoSchema = z.object({
  name: z.string().min(1, '프로바이더 이름을 입력해주세요'),
  status: providerStatusEnum,
  latency: z.string().min(1),
  uptime: z.string().min(1),
  models: z.array(z.string()).min(1, '최소 1개 이상의 모델이 필요합니다'),
  lastChecked: z.string().min(1),
  region: z.string().min(1, '리전을 입력해주세요'),
})

export const incidentSeverityEnum = z.enum(['success', 'warning', 'info'])

export const incidentLogSchema = z.object({
  time: z.string().min(1),
  provider: z.string().min(1),
  event: z.string().min(1),
  severity: incidentSeverityEnum,
})

// ============= Model Pricing =============

export const modelTierEnum = z.enum(['premium', 'standard', 'economy'])

export const modelDefSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1, '프로바이더를 선택해주세요'),
  name: z.string().min(1, '모델 이름을 입력해주세요'),
  label: z.string().min(1),
  contextWindow: z.string().min(1),
  inputCost: z.string().min(1),
  outputCost: z.string().min(1),
  tier: modelTierEnum,
  popular: z.boolean(),
})

export const modelSettingSchema = z.object({
  label: z.string().min(1),
  limit: z.string().min(1),
  enabled: z.boolean(),
})

// ============= Feature Usage =============

export const featureEnum = z.enum(['chat', 'group', 'tool', 'agent', 'debate', 'report'])

export const featureUsageDataSchema = z.object({
  name: z.string().min(1),
  monthlyUsage: z.string().min(1),
  changePercent: z.string(),
  changeUp: z.boolean(),
  activeUsers: z.string().min(1),
  avgResponseTime: z.string().min(1),
  satisfaction: z.string().min(1),
  usagePercentage: z.number().min(0).max(100),
})

// ============= Department Management =============

export const departmentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, '부서 이름을 입력해주세요').max(100, '부서 이름은 100자를 초과할 수 없습니다'),
  code: z.string().min(1, '부서 코드를 입력해주세요').max(50, '부서 코드는 50자를 초과할 수 없습니다'),
  parentCode: z.string(),
  memo: z.string().max(500, '메모는 500자를 초과할 수 없습니다').nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const departmentBulkItemSchema = z.object({
  id: z.object({ code: z.string().min(1) }),
  delete: z.boolean().optional(),
  meta: z
    .object({
      parentCode: z.string(),
      name: z.string().min(1),
    })
    .optional(),
})

export const departmentBulkRequestSchema = z
  .array(departmentBulkItemSchema)
  .min(1, '최소 1개 이상의 항목이 필요합니다')
  .max(1000, '한 번에 최대 1000개까지 처리 가능합니다')

// ============= Audit Log Queries =============

export const auditEventTypeEnum = z.enum(['login', 'upload', 'download'])

export const auditLogQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .optional(),
  workspaceId: z.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  eventDetail: auditEventTypeEnum.optional(),
  isXlsx: z.boolean().optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// ============= SSO Configuration =============

export const ssoApiEndpointEnum = z.enum(['production', 'government'])

export const ssoConfigSchema = z.object({
  companyCode: z
    .string()
    .min(1, '회사 코드를 입력해주세요')
    .max(50, '회사 코드는 50자를 초과할 수 없습니다'),
  encryptionKey: z
    .string()
    .min(16, '암호화 키는 16자 이상이어야 합니다')
    .max(256, '암호화 키는 256자를 초과할 수 없습니다'),
  baseUrl: z.string().url('올바른 URL 형식이 아닙니다'),
  enabled: z.boolean(),
  apiEndpoint: ssoApiEndpointEnum,
})

// ============= User Management =============

export const enterpriseUserRoleEnum = z.enum([
  'ENTERPRISE_MANAGER',
  'WORKSPACE_MANAGER',
  'WORKSPACE_USER',
])

export const createUserSchema = z.object({
  userName: z
    .string()
    .min(1, '사용자 이름을 입력해주세요')
    .max(100, '사용자 이름은 100자를 초과할 수 없습니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role: enterpriseUserRoleEnum,
  departmentCode: z.string().min(1, '부서를 선택해주세요'),
  usageLimit: z.number().int().min(0, '사용량 한도는 0 이상이어야 합니다').default(100000),
  enabled: z.boolean().default(true),
  employeeId: z.string().optional(),
})

export const updateUserSchema = z.object({
  userName: z.string().min(1).max(100).optional(),
  role: enterpriseUserRoleEnum.optional(),
  departmentCode: z.string().min(1).optional(),
  usageLimit: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
  employeeId: z.string().optional(),
})

export const userBulkItemSchema = z.object({
  id: z.union([
    z.object({ userId: z.number().int().positive() }),
    z.object({ email: z.string().email() }),
  ]),
  delete: z.boolean().optional(),
  meta: z
    .object({
      departmentCode: z.string().optional(),
      name: z.string().optional(),
      enabled: z.boolean().optional(),
      role: enterpriseUserRoleEnum.optional(),
      usageLimit: z.number().int().min(0).optional(),
      employeeId: z.string().optional(),
    })
    .optional(),
})

export const userBulkRequestSchema = z
  .array(userBulkItemSchema)
  .min(1, '최소 1개 이상의 항목이 필요합니다')
  .max(1000, '한 번에 최대 1000개까지 처리 가능합니다')

// ============= Admin Settings =============

export const adminSettingsSchema = z.object({
  systemName: z.string().min(1, '시스템 이름을 입력해주세요').max(100),
  defaultLanguage: z.string().min(1),
  models: z.array(modelSettingSchema),
  monthlyBudget: z.string().min(1),
  warningThreshold: z.string().min(1),
  dailyTokenLimit: z.string().min(1),
})

// ============= Prompt Templates =============

export const promptCategoryEnum = z.enum(['업무', '개발', '마케팅', '분석'])

export const promptTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, '프롬프트 제목을 입력해주세요').max(200),
  description: z.string().min(1, '프롬프트 설명을 입력해주세요').max(2000),
  category: promptCategoryEnum,
  author: z.string().min(1),
  usageCount: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  tags: z.array(z.string()).max(20, '태그는 최대 20개까지 가능합니다'),
})

// ============= User Response =============

export const userStatusEnum = z.enum(['active', 'inactive'])

export const userResponseSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1),
  totalConversations: z.number().int().nonnegative(),
  monthlyTokens: z.string().min(1),
  status: userStatusEnum,
})

export const usersResponseSchema = z.array(userResponseSchema)

// ============= Dashboard Response =============

export const dashboardStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  trend: z.string().optional(),
  trendUp: z.boolean().optional(),
})

export const usageRecordStatusEnum = z.enum(['success', 'error', 'pending'])

export const usageRecordSchema = z.object({
  date: z.string().min(1),
  user: z.string().min(1),
  type: z.string().min(1),
  model: z.string().min(1),
  tokens: z.string().min(1),
  cost: z.string().min(1),
  status: usageRecordStatusEnum,
})

export const modelUsageSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
  color: z.string().min(1),
})

export const dashboardSummarySchema = z.object({
  stats: z.array(dashboardStatSchema),
  recentUsage: z.array(usageRecordSchema),
  modelUsage: z.array(modelUsageSchema),
})

// ============= Inferred Types =============

export type UserResponseOutput = z.infer<typeof userResponseSchema>
export type DashboardSummaryOutput = z.infer<typeof dashboardSummarySchema>
export type ProviderInfoInput = z.infer<typeof providerInfoSchema>
export type IncidentLogInput = z.infer<typeof incidentLogSchema>
export type ModelDefInput = z.infer<typeof modelDefSchema>
export type ModelSettingInput = z.infer<typeof modelSettingSchema>
export type FeatureUsageDataInput = z.infer<typeof featureUsageDataSchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
export type DepartmentBulkItemInput = z.infer<typeof departmentBulkItemSchema>
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>
export type SSOConfigInput = z.infer<typeof ssoConfigSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserBulkItemInput = z.infer<typeof userBulkItemSchema>
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>
export type PromptTemplateInput = z.infer<typeof promptTemplateSchema>
