import { z } from 'zod'

export const MarketplaceAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  category: z.enum(['research', 'coding', 'writing', 'data', 'automation', 'custom']),
  provider: z.string(),
  version: z.string(),
  rating: z.number().min(0).max(5),
  downloads: z.number().int().min(0),
  status: z.enum(['published', 'draft', 'deprecated', 'reviewing']),
  tags: z.array(z.string()),
  pricing: z.enum(['free', 'freemium', 'paid']),
  monthlyPrice: z.number().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type MarketplaceAgent = z.infer<typeof MarketplaceAgentSchema>

export const CreateAgentSchema = MarketplaceAgentSchema.omit({
  id: true,
  rating: true,
  downloads: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>

export interface UpdateAgentInput {
  readonly name?: string
  readonly description?: string
  readonly category?: MarketplaceAgent['category']
  readonly version?: string
  readonly status?: MarketplaceAgent['status']
  readonly tags?: string[]
  readonly pricing?: MarketplaceAgent['pricing']
  readonly monthlyPrice?: number
}

export interface MarketplaceFilters {
  readonly category?: MarketplaceAgent['category']
  readonly pricing?: MarketplaceAgent['pricing']
  readonly status?: MarketplaceAgent['status']
  readonly search?: string
  readonly sortBy?: 'rating' | 'downloads' | 'newest'
}
