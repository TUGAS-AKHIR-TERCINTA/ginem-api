import axios from 'axios'
import { appConfigs } from '../../configs'

export interface BinanceTicker24h {
  symbol: string
  priceChangePercent: string
}

export class BinanceService {
  static async get24hTickers(): Promise<BinanceTicker24h[]> {
    const { data } = await axios.get(`${appConfigs?.binance?.baseUrl}/api/v3/ticker/24hr`)

    return data
  }

  static async getTickerBySymbol(symbol: string) {
    const { data } = await axios.get(
      `${appConfigs?.binance?.baseUrl}/api/v3/ticker/24hr`,
      {
        params: { symbol }
      }
    )

    return {
      lastPrice: Number(data.lastPrice),
      highPrice: Number(data.highPrice),
      lowPrice: Number(data.lowPrice),
      priceChangePercent: Number(data.priceChangePercent)
    }
  }
}
