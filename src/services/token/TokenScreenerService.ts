import logger from '../../logs'
import { TokenModel } from '../../models/tokenModel'
import { TokenMetricModel } from '../../models/tokenMetricModel'
import { CoinGeckoService } from '../external/CoinGeckoService'
import { EtherscanService } from '../external/EtherscanService'

export class TokenScreenerService {
  static async addToken(contractAddress: string): Promise<void> {
    console.log('===add contract address', contractAddress)
    const marketData = await CoinGeckoService.getMarketData(contractAddress)

    const [token] = await TokenModel.findOrCreate({
      where: { contractAddress },
      defaults: {
        contractAddress,
        chain: 'ethereum',
        name: marketData.name,
        symbol: marketData.symbol
      }
    })

    const transfers = await EtherscanService.fetchTokenTransfers(contractAddress)

    let dexBuyUsd = 0
    let dexSellUsd = 0

    for (const tx of transfers) {
      const amountUsd = (Number(tx.value) / 1e18) * marketData.priceUsd

      if (tx.to?.toLowerCase() === contractAddress.toLowerCase()) {
        dexBuyUsd += amountUsd
      } else {
        dexSellUsd += amountUsd
      }
    }

    await TokenMetricModel.create({
      tokenId: token.getDataValue('id'),
      priceUsd: marketData.priceUsd,
      priceChange24h: marketData.priceChange24h,
      marketCapUsd: marketData.marketCapUsd,
      dexVolume24hUsd: dexBuyUsd + dexSellUsd,
      liquidityUsd: 0,
      dexBuy24hUsd: dexBuyUsd,
      dexSell24hUsd: dexSellUsd,
      dexFlow24hUsd: dexBuyUsd - dexSellUsd
    })

    logger.info('[TokenScreener] Token indexed', {
      contractAddress
    })
  }

  static async findAll(limit?: number, offset?: number) {
    return TokenModel.findAndCountAll({
      attributes: ['chain', 'name'],
      include: [
        {
          model: TokenMetricModel,
          required: true
        }
      ],
      order: [['id', 'desc']],
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset })
    })
  }
}
