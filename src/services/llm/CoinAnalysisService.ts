import { Op } from 'sequelize'
import { NewsModel } from '../../models/newsMode'
import { TopSignalsService } from '../market/TopSignalsService'
import { LLMService } from '../llm/LlmServices'
import { CoinAnalysisSchema } from '../../schemas/coinAnalysisSchema'

export class CoinAnalysisService {
  private static model = LLMService.create().withStructuredOutput(CoinAnalysisSchema)

  static async analyze(symbol: string, profile: 'SCALPING' | 'SWING' | 'INVEST') {
    /**
     * 1. Load market movers
     */
    const topSignals = await TopSignalsService.getTopSignals(10)

    /**
     * 2. Load recent news for symbol
     */
    const news = await NewsModel.findAll({
      where: {
        newsTitle: {
          [Op.like]: `%${symbol.replace('USDT', '')}%`
        }
      },
      order: [['newsPublishedAt', 'DESC']],
      limit: 10
    })

    /**
     * 3. Prepare news sentiment summary
     */
    const sentimentStats = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0
    }

    news.forEach((n) => {
      if (n.newsSentiment) {
        sentimentStats[n.newsSentiment]++
      }
    })

    /**
     * 4. Prompt construction (STRICT)
     */
    const prompt = `
You are a professional crypto trading analyst.

Analyze the following coin based on market data,
news sentiment, and the user's risk profile.

Symbol: ${symbol}
Risk profile: ${profile}

Market movers (24h):
Top gainers:
${topSignals.gainers.map((g) => `- ${g.symbol} (${g.changePercent}%)`).join('\n')}

Top losers:
${topSignals.losers.map((l) => `- ${l.symbol} (${l.changePercent}%)`).join('\n')}

News sentiment for ${symbol}:
- Positive: ${sentimentStats.POSITIVE}
- Neutral: ${sentimentStats.NEUTRAL}
- Negative: ${sentimentStats.NEGATIVE}

Rules:
- Adjust aggressiveness based on risk profile
- Do NOT predict exact prices
- Focus on directional bias and decision making
- Mention realistic risks
`

    /**
     * 5. Invoke LLM → structured object
     */
    return await this.model.invoke(prompt)
  }
}
