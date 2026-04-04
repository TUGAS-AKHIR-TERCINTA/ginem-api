import { jwtPayloadSchema } from './JwtPayloadSchema'
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
  deviceId: z.coerce.number().int().positive()
})

export const findAllDeviceSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export type UpdateDeviceSchema = z.infer<typeof updateDeviceSchema>

export type CreateDeviceSchema = z.infer<typeof createDeviceSchema>

export type FindAllDeviceSchema = z.infer<typeof findAllDeviceSchema>

export type FindDetailDeviceSchema = z.infer<typeof findDetailDeviceSchema>

export type RemoveDeviceSchema = z.infer<typeof removeDeviceSchema>
