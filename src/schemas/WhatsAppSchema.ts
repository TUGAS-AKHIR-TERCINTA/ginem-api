import { z } from 'zod'

/** POST /connect tidak membutuhkan field; tetap divalidasi agar body JSON aman. */
export const whatsappConnectBodySchema = z.object({}).strict().default({})

export type WhatsappConnectBodyInput = z.infer<typeof whatsappConnectBodySchema>

/** Query untuk `/connect?type=base64|image` (QR sebagai JSON base64 atau PNG binary). */
export const whatsappConnectQuerySchema = z
  .object({
    type: z.enum(['base64', 'image']).optional(),
    timeoutMs: z.coerce.number().int().positive().max(120_000).optional()
  })
  .strict()

export type WhatsappConnectQueryInput = z.infer<typeof whatsappConnectQuerySchema>

/** POST /disconnect — body kosong, sama pola keamanan dengan `/connect`. */
export const whatsappDisconnectBodySchema = z.object({}).strict().default({})

export type WhatsappDisconnectBodyInput = z.infer<typeof whatsappDisconnectBodySchema>
