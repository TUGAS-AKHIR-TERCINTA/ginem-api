import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const updateCompanychema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  companyId: Joi.number().integer().positive().required(),
  companyName: Joi.string().max(100).optional().allow(''),
  companyIndustry: Joi.string().optional().allow('')
})

export const findDetailCompanychema = Joi.object({
  jwtPayload: jwtPayloadSchema
})

export const findAllSmartWalletSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  search: Joi.string().allow('').optional(),
  pagination: Joi.boolean().optional()
})