import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createDeviceSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceToken: Joi.string().max(100).required(),
  deviceName: Joi.string().max(100).required().allow(''),
  deviceType: Joi.string().valid('sensor', 'actuator', 'hybrid').required(),
  deviceStatus: Joi.string().valid('online', 'offline').optional(),
  deviceFirmwareVersion: Joi.string().max(50).optional().allow(''),
  deviceMetadata: Joi.object().optional()
})

export const updateDeviceSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceId: Joi.number().integer().positive().required(),
  deviceToken: Joi.string().max(100).optional(),
  deviceName: Joi.string().max(100).optional().allow(''),
  deviceType: Joi.string().valid('sensor', 'actuator', 'hybrid').optional(),
  deviceStatus: Joi.string().valid('online', 'offline').optional(),
  deviceFirmwareVersion: Joi.string().max(50).optional().allow(''),
  deviceMetadata: Joi.object().optional()
})

export const findDetailDeviceSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceId: Joi.number().integer().positive().required()
})

export const removeDeviceSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  deviceId: Joi.number().integer().positive().required()
})

export const findAllDeviceSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  search: Joi.string().allow('').optional(),
  pagination: Joi.boolean().optional()
})
