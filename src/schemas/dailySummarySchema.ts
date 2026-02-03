import { z } from 'zod'

export const DailySummarySchema = z.object({
  marketSentiment: z.enum(['BULLISH', 'NEUTRAL', 'BEARISH']),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(20),
  highlights: z.array(z.string()).min(1)
})

export type DailySummaryResult = z.infer<typeof DailySummarySchema>
