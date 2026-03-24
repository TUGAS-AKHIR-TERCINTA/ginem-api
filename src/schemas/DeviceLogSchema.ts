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
  deviceLogDeviceId: z.coerce.number().int().positive().optional(),
  jwtPayload: jwtPayloadSchema,
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export const findLastLatestDeviceLogByDeviceIdSchema = z.object({
  jwtPayload: jwtPayloadSchema.optional(),
  deviceId: z.coerce.number().int().positive()
})

export type CreateDeviceLogSchema = z.infer<typeof createDeviceLogSchema>
export type UpdateDeviceLogSchema = z.infer<typeof updateDeviceLogSchema>
export type FindDetailDeviceLogSchema = z.infer<typeof findDetailDeviceLogSchema>
export type RemoveDeviceLogSchema = z.infer<typeof removeDeviceLogSchema>
export type FindAllDeviceLogSchema = z.infer<typeof findAllDeviceLogSchema>
export type FindLastLatestDeviceLogByDeviceIdSchema = z.infer<
  typeof findLastLatestDeviceLogByDeviceIdSchema
>
