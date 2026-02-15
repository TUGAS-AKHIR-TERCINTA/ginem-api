import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const findAllSchedulerLogSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  type: Joi.string().valid('actuator', 'sensor_data').optional(),
  status: Joi.string().valid('pending', 'completed', 'failed').optional(),
  deviceName: Joi.string().allow('').optional(),
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  pagination: Joi.boolean().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
})

export const findDetailSchedulerLogSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  schedulerLogId: Joi.number().integer().positive().required()
})
