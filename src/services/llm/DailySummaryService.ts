import { Op } from 'sequelize'
import { NewsModel } from '../../models/newsMode'
import { DailySummarySchema } from '../../schemas/dailySummarySchema'
import { LLMService } from './LlmServices'

type SentimentConfidence = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'

export class DailySummaryService {
  private static model = LLMService.create().withStructuredOutput(DailySummarySchema)

  static async generate(date: Date) {
    /**
     * 1. Define start and end of the day
     */
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    console.log('start', start)
    console.log('end', end)

    /**
     * 2. Fetch today's news
     */
    const news = await NewsModel.findAll({
      where: {
        newsPublishedAt: {
          [Op.between]: [start, end]
        }
      },
      order: [['newsPublishedAt', 'DESC']],
      limit: 50
    })

    if (!news.length) {
      throw new Error('No news found for today')
    }

    /**
     * 3. Initialize sentiment statistics
     */
    const stats: Record<SentimentConfidence, number> = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0
    }

    /**
     * 4. Build news lines and sentiment distribution
     */
    const newsLines = news.map((n) => {
      const confidence = n.newsSentimentConfidence as SentimentConfidence | undefined

      if (confidence && confidence in stats) {
        stats[confidence]++
      }

      return `- ${n.newsTitle} (${n.newsSentiment})`
    })

    /**
     * 5. Construct prompt for LLM
     */
    const prompt = `
You are a professional crypto market analyst.

Using the following daily crypto news and sentiment distribution,
generate a structured daily market summary.

Sentiment statistics:
- Positive: ${stats.POSITIVE}
- Neutral: ${stats.NEUTRAL}
- Negative: ${stats.NEGATIVE}

News:
${newsLines.join('\n')}

Rules:
- Be concise
- Focus on market direction
- Avoid speculation beyond given data
`

    /**
     * 6. Invoke LLM and return structured output
     */
    return await this.model.invoke(prompt)
  }
}
