import { BinanceService } from '../external/BinanceService'
import { LLMService } from '../llm/LlmServices'
import { LivePredictionSchema } from '../../schemas/livePredictionSchema'
import { AiSignalService } from './AiSignalService'

export class LivePricePredictionService {
  private static model = LLMService.create().withStructuredOutput(LivePredictionSchema)

  static async predict(symbol: string, profile: 'SCALPING' | 'SWING' | 'INVEST') {
    /**
     * 1. Load market data
     */
    const ticker = await BinanceService.getTickerBySymbol(symbol)
    const aiSignal = await AiSignalService.generateSignals()

    /**
     * 2. Prompt (VERY CONTROLLED)
     */
    const prompt = `
You are a crypto trading assistant.

Your task is to provide a short-term price outlook,
NOT an exact price prediction.

Symbol: ${symbol}
Risk profile: ${profile}

Market data:
- Current price: ${ticker.lastPrice}
- 24h high: ${ticker.highPrice}
- 24h low: ${ticker.lowPrice}
- 24h change: ${ticker.priceChangePercent}%

AI signal:
- Bias: ${aiSignal.signal}

Rules:
- Do NOT predict an exact future price
- Provide a reasonable expected range
- Adjust aggressiveness based on risk profile
- Always include a risk note
`

    /**
     * 3. Invoke LLM
     */
    return await this.model.invoke(prompt)
  }
}
