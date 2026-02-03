import { z } from 'zod'

export const CoinAnalysisSchema = z.object({
  symbol: z.string(),
  profile: z.enum(['SCALPING', 'SWING', 'INVEST']),
  bias: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  confidence: z.number().min(0).max(1),
  recommendation: z.string(),
  risks: z.array(z.string())
})

export type CoinAnalysisResult = z.infer<typeof CoinAnalysisSchema>
