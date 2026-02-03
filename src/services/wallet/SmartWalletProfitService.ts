import { WalletTransactionModel } from '../../models/walletTransactionModel'
import { SmartWalletModel } from '../../models/smartWalletModel'

export class SmartWalletProfitService {
  static async calculate(walletAddress: string): Promise<void> {
    const transactions = (await WalletTransactionModel.findAll({
      where: { walletAddress },
      order: [['timestamp', 'ASC']]
    })) as any[]

    if (transactions.length === 0) return

    const tokenMap: Record<string, { buyUsd: number; sellUsd: number }> = {}

    for (const tx of transactions) {
      const token = tx.tokenAddress || 'ETH'

      if (!tokenMap[token]) {
        tokenMap[token] = { buyUsd: 0, sellUsd: 0 }
      }

      const valueUsd = Number(tx.value) * Number(tx.priceUsd)

      if (tx.txType === 'BUY') tokenMap[token].buyUsd += valueUsd
      if (tx.txType === 'SELL') tokenMap[token].sellUsd += valueUsd
    }

    let totalProfit = 0
    let tradeCount = 0
    let winTrade = 0

    for (const token in tokenMap) {
      const { buyUsd, sellUsd } = tokenMap[token]

      if (buyUsd > 0 && sellUsd > 0) {
        const profit = sellUsd - buyUsd
        totalProfit += profit
        tradeCount++
        if (profit > 0) winTrade++
      }
    }

    if (tradeCount === 0) return

    const winRate = winTrade / tradeCount

    await SmartWalletModel.upsert({
      walletAddress,
      totalProfitUsd: totalProfit,
      winRate,
      tradeCount
    })
  }
}
