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

export type IFindMyProfile = z.infer<typeof findMyProfileSchema>
export type IFindDetailMyProfile = z.infer<typeof findDetailMyProfileSchema>
export type IUpdateMyProfile = z.infer<typeof updateMyProfileSchema>
export type IUpdateOnboarding = z.infer<typeof updateOnboardingSchema>
