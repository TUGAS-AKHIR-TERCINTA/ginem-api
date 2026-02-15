import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const findAllAppLogSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  level: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug')
    .optional(),
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  pagination: Joi.boolean().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
})

export const findDetailAppLogSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  logId: Joi.number().integer().positive().required()
})
