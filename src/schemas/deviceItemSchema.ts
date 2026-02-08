import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createDeviceItemSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceItemDeviceId: Joi.number().integer().positive().required(),
  deviceItemValue: Joi.string().max(255).required()
})

export const updateDeviceItemSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceItemId: Joi.number().integer().positive().required(),
  deviceItemDeviceId: Joi.number().integer().positive().optional(),
  deviceItemValue: Joi.string().max(255).optional()
})

export const findDetailDeviceItemSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceItemId: Joi.number().integer().positive().required()
})

export const removeDeviceItemSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceItemId: Joi.number().integer().positive().required()
})

export const findAllDeviceItemSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceItemDeviceId: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  pagination: Joi.boolean().optional()
})
