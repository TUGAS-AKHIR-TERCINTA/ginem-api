import { z } from 'zod'
import { jwtPayloadSchema } from './JwtPayloadSchema'

export const findMyProfileSchema = z.object({
  jwtPayload: jwtPayloadSchema
})

export const findDetailMyProfileSchema = z.object({
  jwtPayload: jwtPayloadSchema
})

export const updateMyProfileSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  userName: z.string().max(30).optional(),
  userPassword: z.string().max(128).optional(),
  userEmail: z.string().optional()
})

export const updateOnboardingSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  userOnboardingStatus: z.enum(['waiting', 'completed'])
})

export type FindMyProfileSchema = z.infer<typeof findMyProfileSchema>
export type FindDetailMyProfileSchema = z.infer<typeof findDetailMyProfileSchema>
export type UpdateMyProfileSchema = z.infer<typeof updateMyProfileSchema>
export type UpdateOnboardingSchema = z.infer<typeof updateOnboardingSchema>
