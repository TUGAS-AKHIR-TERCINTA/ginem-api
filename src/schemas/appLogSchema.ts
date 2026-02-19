import { z } from 'zod'

const logLevelEnum = z.enum(['error', 'warn', 'info'])

/* ============================= */
/* CREATE LOG (body) */
/* ============================= */

export const createAppLogSchema = z.object({
  appLogLevel: logLevelEnum,
  appLogMessage: z.string().min(1),
  appLogSource: z
    .union([z.string().max(255), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? null : (v ?? null))),
  appLogMeta: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? null : (v ?? null)))
})

/* ============================= */
/* FIND ALL LOGS (query) */
/* ============================= */

export const findAllAppLogsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  appLogLevel: z
    .union([logLevelEnum, z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export type CreateAppLogInput = z.infer<typeof createAppLogSchema>

export type FindAllAppLogsInput = z.infer<typeof findAllAppLogsSchema>
