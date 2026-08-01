import { jwtPayloadSchema } from './JwtPayloadSchema'
import { z } from 'zod'

export const createDeviceSchema = z.object({
  deviceName: z.string().max(100).min(1),
  deviceDescription: z.string().optional(),
  deviceType: z.enum(['sensor', 'actuator', 'hybrid']),
  deviceStatus: z.enum(['online', 'offline']).optional(),
  deviceFirmwareVersion: z.string().max(50).optional(),
  deviceMetadata: z.object().optional()
})

export const updateDeviceSchema = z.object({
  deviceId: z.number().int().positive(),
  deviceToken: z.string().max(100).optional(),
  deviceName: z.string().max(100).optional(),
  deviceDescription: z.string().optional(),
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
    .transform((v): boolean => v === 'true')
})

export type IUpdateDevice = z.infer<typeof updateDeviceSchema>

export type ICreateDevice = z.infer<typeof createDeviceSchema>

export type IFindAllDevice = z.infer<typeof findAllDeviceSchema>

export type IFindDetailDevice = z.infer<typeof findDetailDeviceSchema>

export type IRemoveDevice = z.infer<typeof removeDeviceSchema>
