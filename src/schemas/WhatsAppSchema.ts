import { z } from 'zod'

export const whatsappConnectSchema = z
  .object({
    timeoutMs: z.number().int().positive().max(120000).optional()
  })
  .optional()

export type WhatsAppConnectInput = z.infer<typeof whatsappConnectSchema>

export const whatsappSendMessageSchema = z.object({
  to: z
    .string()
    .min(5)
    .max(20)
    .describe('Phone number in international format or digits only'),
  message: z.string().min(1).max(2000)
})

export type WhatsAppSendMessageInput = z.infer<typeof whatsappSendMessageSchema>

export const whatsappQrQuerySchema = z.object({
  timeoutMs: z.coerce.number().int().positive().max(120000).optional(),
  /** Use `json` in Swagger UI to see QR as data URL in response body (PNG binary preview is often blocked by CSP). */
  format: z.enum(['png', 'json']).optional().default('png')
})

export type WhatsAppQrQueryInput = z.infer<typeof whatsappQrQuerySchema>
