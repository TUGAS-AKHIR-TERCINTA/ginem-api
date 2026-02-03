import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const findAllNewsSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  search: Joi.string().allow('').optional(),
  pagination: Joi.boolean().optional()
})
