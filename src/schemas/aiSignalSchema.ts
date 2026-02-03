import { z } from 'zod'

export const AiSignalSchema = z.object({
  symbol: z.string(),
  signal: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  confidence: z.number().min(0).max(1),
  reason: z.string()
})

export type AiSignalResult = z.infer<typeof AiSignalSchema>
