import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const findAllSchedulerLogSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  type: z.enum(['actuator', 'sensor_data']).optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  deviceName: z.string().optional(),
  page: z.number().int().optional(),
  size: z.number().int().optional(),
  pagination: z.boolean().optional(),
  dateFrom: z.date().optional(),
  search: z.string().optional(),
  dateTo: z.date().optional()
})

export const findDetailSchedulerLogSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  schedulerLogId: z.number().int().positive()
})

export type FindAllSchedulerLogSchema = z.infer<typeof findAllSchedulerLogSchema>
export type FindDetailSchedulerLogSchema = z.infer<typeof findDetailSchedulerLogSchema>
