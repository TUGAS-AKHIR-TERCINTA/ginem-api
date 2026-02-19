import { jwtPayloadSchema } from './jwtPayloadSchema'
import { z } from 'zod'

export const createDeviceSchema = z.object({
  deviceName: z.string().max(100).min(1),
  deviceType: z.enum(['sensor', 'actuator', 'hybrid']),
  deviceStatus: z.enum(['online', 'offline']).optional(),
  deviceFirmwareVersion: z.string().max(50).optional(),
  deviceMetadata: z.object().optional()
})

export const updateDeviceSchema = z.object({
  deviceId: z.number().int().positive(),
  deviceToken: z.string().max(100).optional(),
  deviceName: z.string().max(100).optional(),
  deviceType: z.enum(['sensor', 'actuator', 'hybrid']).optional(),
  deviceStatus: z.enum(['online', 'offline']).optional(),
  deviceFirmwareVersion: z.string().max(50).optional(),
  deviceMetadata: z.object().optional()
})

export const findDetailDeviceSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceId: z.coerce.number().int().positive()
})

export const removeDeviceSchema = z.object({
  deviceId: z.number().int().positive()
})

export const findAllDeviceSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  page: z.number().int().optional(),
  size: z.number().int().optional(),
  search: z.string().optional(),
  pagination: z.boolean().optional()
})

export type UpdateDeviceSchema = z.infer<typeof updateDeviceSchema>

export type CreateDeviceSchema = z.infer<typeof createDeviceSchema>

export type FindAllDeviceSchema = z.infer<typeof findAllDeviceSchema>

export type FindDetailDeviceSchema = z.infer<typeof findDetailDeviceSchema>

export type RemoveDeviceSchema = z.infer<typeof removeDeviceSchema>
