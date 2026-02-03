import { z } from 'zod'
import { LLMService } from './LlmServices'

const SentimentSchema = z.object({
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  confidence: z.number().min(0).max(1),
  reason: z.string()
})

export class SentimentService {
  private static model = LLMService.create().withStructuredOutput(SentimentSchema)

  static async analyze(text: string) {
    return await this.model.invoke(
      `Analyze the sentiment of this crypto news:\n\n${text}`
    )
  }
}
