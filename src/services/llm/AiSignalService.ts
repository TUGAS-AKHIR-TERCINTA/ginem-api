import { TopSignalsService } from '../market/TopSignalsService'
import { DailySummaryStoreService } from '../summary/DailySummaryStoreService'
import { LLMService } from '../llm/LlmServices'
import { AiSignalSchema } from '../../schemas/aiSignalSchema'

export class AiSignalService {
  private static model = LLMService.create().withStructuredOutput(AiSignalSchema)

  static async generateSignals() {
    /**
     * 1. Load market context
     */
    const topSignals = await TopSignalsService.getTopSignals(5)
    const dailySummary = await DailySummaryStoreService.getOrCreate(new Date())

    /**
     * 2. Build compact prompt (VERY IMPORTANT)
     */
    const prompt = `
You are a professional crypto trading analyst.

Your task is to generate trading signals
based ONLY on the provided data.

Market summary:
- Overall sentiment: ${dailySummary.dailySummaryMarketSentiment}
- Confidence: ${dailySummary.dailySummaryConfidence}

Top gainers (24h):
${topSignals.gainers.map((g: any) => `- ${g.symbol}: +${g.changePercent}%`).join('\n')}

Top losers (24h):
${topSignals.losers.map((l: any) => `- ${l.symbol}: ${l.changePercent}%`).join('\n')}

Rules:
- Generate ONE signal per symbol
- Signal must be BULLISH, BEARISH, or NEUTRAL
- Confidence must be realistic (0-1)
- Reason must reference price movement AND sentiment
`

    /**
     * 3. Invoke LLM
     */
    return await this.model.invoke(prompt)
  }
}
