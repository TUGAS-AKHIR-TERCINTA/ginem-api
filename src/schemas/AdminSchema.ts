import { z } from 'zod'

export const createAdminBodySchema = z.object({
  userName: z.string().min(1).max(200),
  userEmail: z.string().email().max(255),
  userPassword: z.string().min(6).max(200),
  userOnboardingStatus: z.enum(['waiting', 'completed']).optional()
})

export const updateAdminBodySchema = z.object({
  userId: z.number().int().positive(),
  userName: z.string().min(1).max(200).optional(),
  userEmail: z.string().email().max(255).optional(),
  userPassword: z.string().min(6).max(200).optional(),
  userOnboardingStatus: z.enum(['waiting', 'completed']).optional()
})

export const findAllAdminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export const adminUserIdParamSchema = z.object({
  userId: z.coerce.number().int().positive()
})

export type CreateAdminBody = z.infer<typeof createAdminBodySchema>
export type UpdateAdminBody = z.infer<typeof updateAdminBodySchema>
export type FindAllAdminQuery = z.infer<typeof findAllAdminQuerySchema>
export type AdminUserIdParam = z.infer<typeof adminUserIdParamSchema>
