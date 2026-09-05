import { z } from 'zod'
import { jwtPayloadSchema } from './JwtPayloadSchema'

export const findAllSchedulerLogSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  pagination: z
    .string()
    .optional()
    .transform((v): boolean => v === 'true'),

  type: z.enum(['actuator', 'sensor_data']).optional(),
  category: z.enum(['once', 'repeat']).optional(),
  status: z.enum(['pending', 'active', 'completed', 'failed']).optional(),
  deviceName: z.string().optional(),

  dateFrom: z.date().optional(),
  dateTo: z.date().optional()
})

export const findDetailSchedulerLogSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  schedulerLogId: z.number().int().positive()
})

export const removeSchedulerLogSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  schedulerLogId: z.coerce.number().int().positive()
})

export type IFindAllSchedulerLog = z.infer<typeof findAllSchedulerLogSchema>
export type IFindDetailSchedulerLog = z.infer<typeof findDetailSchedulerLogSchema>
export type IRemoveSchedulerLog = z.infer<typeof removeSchedulerLogSchema>
