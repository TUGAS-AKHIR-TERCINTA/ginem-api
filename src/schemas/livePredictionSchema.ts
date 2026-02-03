import { z } from 'zod'

export const LivePredictionSchema = z.object({
  symbol: z.string(),
  profile: z.enum(['SCALPING', 'SWING', 'LONG']),
  trend: z.enum(['BULLISH', 'BEARISH', 'SIDEWAYS']),
  confidence: z.number().min(0).max(100),

  entryZone: z.object({
    buy: z.string(),
    sell: z.string()
  }),

  stopLoss: z.string(),
  takeProfit: z.string(),

  reasoning: z.string()
})
