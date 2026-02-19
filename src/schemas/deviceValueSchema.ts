import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createDeviceValueSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueDeviceId: z.number().int().positive(),
  deviceValueValue: z.string().max(255)
})

export const updateDeviceValueSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: z.number().int().positive(),
  deviceValueDeviceId: z.number().int().positive().optional(),
  deviceValueValue: z.string().max(255).optional()
})

export const findDetailDeviceValueSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: z.number().int().positive()
})

export const removeDeviceValueSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueId: z.number().int().positive()
})

export const findAllDeviceValueSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  deviceValueDeviceId: z.number().int().positive().optional(),
  page: z.number().int().optional(),
  size: z.number().int().optional(),
  pagination: z.boolean().optional()
})

export type CreateDeviceValueSchema = z.infer<typeof createDeviceValueSchema>
export type UpdateDeviceValueSchema = z.infer<typeof updateDeviceValueSchema>
export type FindDetailDeviceValueSchema = z.infer<typeof findDetailDeviceValueSchema>
export type RemoveDeviceValueSchema = z.infer<typeof removeDeviceValueSchema>
export type FindAllDeviceValueSchema = z.infer<typeof findAllDeviceValueSchema>
