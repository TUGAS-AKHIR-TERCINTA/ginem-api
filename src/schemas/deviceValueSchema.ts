import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createDeviceValueSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueDeviceId: Joi.number().integer().positive().required(),
  deviceValueValue: Joi.string().max(255).required()
})

export const updateDeviceValueSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: Joi.number().integer().positive().required(),
  deviceValueDeviceId: Joi.number().integer().positive().optional(),
  deviceValueValue: Joi.string().max(255).optional()
})

export const findDetailDeviceValueSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: Joi.number().integer().positive().required()
})

export const removeDeviceValueSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: Joi.number().integer().positive().required()
})

export const findAllDeviceValueSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueDeviceId: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  pagination: Joi.boolean().optional()
})
