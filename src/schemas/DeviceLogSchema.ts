import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createDeviceLogSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceLogDeviceId: z.number().int().positive(),
  deviceLogData: z.string().max(255)
})

export const updateDeviceLogSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceLogId: z.coerce.number().int().positive(),
  deviceLogDeviceId: z.coerce.number().int().positive().optional(),
  deviceLogData: z.string().max(255).optional()
})

export const findDetailDeviceLogSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceLogId: z.coerce.number().int().positive()
})

export const removeDeviceLogSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceLogId: z.coerce.number().int().positive()
})

export const findAllDeviceLogSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceLogDeviceId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().optional(),
  size: z.coerce.number().int().optional(),
  pagination: z.coerce.boolean().optional()
})

export type CreateDeviceLogSchema = z.infer<typeof createDeviceLogSchema>
export type UpdateDeviceLogSchema = z.infer<typeof updateDeviceLogSchema>
export type FindDetailDeviceLogSchema = z.infer<typeof findDetailDeviceLogSchema>
export type RemoveDeviceLogSchema = z.infer<typeof removeDeviceLogSchema>
export type FindAllDeviceLogSchema = z.infer<typeof findAllDeviceLogSchema>
