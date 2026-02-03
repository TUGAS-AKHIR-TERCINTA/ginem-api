import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const findMyProfileSchema = Joi.object({
  jwtPayload: jwtPayloadSchema
})

export const findDetailMyProfileSchema = Joi.object({
  jwtPayload: jwtPayloadSchema
})

export const updateMyProfileSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  userName: Joi.string().allow('').min(3).max(30).optional(),
  userPassword: Joi.string().allow('').min(6).max(128).optional(),
  userEmail: Joi.string().optional().allow('')
})

export const updateOnboardingSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  userOnboardingStatus: Joi.string().valid('waiting', 'completed').required()
})
