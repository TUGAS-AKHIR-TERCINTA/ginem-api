import axios from 'axios'
import { appConfigs } from '../../configs'

export interface ICoinGeckoMarketData {
  name: string
  symbol: string
  priceUsd: number
  priceChange24h: number
  marketCapUsd: number
  liquidityUsd?: number
}

export class CoinGeckoService {
  static async getTokenPriceUsd(contractAddress: string): Promise<number> {
    const response = await axios.get(
      `${appConfigs.coingecko.baseUrl}/simple/token_price/ethereum`,
      {
        params: {
          contract_addresses: contractAddress,
          vs_currencies: 'usd'
        }
      }
    )

    return response.data[contractAddress.toLowerCase()]?.usd || 0
  }

  static async getMarketData(contractAddress: string): Promise<ICoinGeckoMarketData> {
    const response = await axios.get(
      `${appConfigs.coingecko.baseUrl}/coins/ethereum/contract/${contractAddress}`
    )

    const data = response.data

    return {
      name: data?.name || 'Unknown Token',
      symbol: data?.symbol?.toUpperCase() || 'UNKNOWN',
      priceUsd: data?.market_data?.current_price?.usd || 0,
      priceChange24h: data?.market_data?.price_change_percentage_24h || 0,
      marketCapUsd: data?.market_data?.market_cap?.usd || 0,
      liquidityUsd: data?.market_data?.total_volume?.usd || 0
    }
  }
}
