import redisClient from '../../configs/redis'
import { BinanceService } from '../external/BinanceService'

const CACHE_KEY = 'top-signals'
const CACHE_TTL = 30 // seconds

export class TopSignalsService {
  static async getTopSignals(limit = 5) {
    const cached = await redisClient.get(CACHE_KEY)

    if (cached) {
      return JSON.parse(cached)
    }

    const tickers = await BinanceService.get24hTickers()

    const mapped = tickers
      .filter((t) => t.symbol.endsWith('USDT'))
      .map((t) => ({
        symbol: t.symbol,
        changePercent: Number(t.priceChangePercent)
      }))
      .filter((t) => !Number.isNaN(t.changePercent))

    const gainers = [...mapped]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit)

    const losers = [...mapped]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit)

    const result = {
      gainers,
      losers,
      generatedAt: new Date().toISOString()
    }

    await redisClient.set(CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL)

    return result
  }
}
